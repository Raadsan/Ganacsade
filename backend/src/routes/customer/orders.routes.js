const express = require('express');
const { query } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

/**
 * Generate unique order number
 */
function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

/**
 * @route   POST /api/customer/orders
 * @desc    Create a new order
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      items,
      shippingAddress,
      paymentMethod,
      subtotal,
      tax,
      shipping,
      discount,
      total,
      notes,
      transactionId
    } = req.body;

    // Validate required fields
    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    if (!shippingAddress || !shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address with phone is required'
      });
    }

    if (!paymentMethod || !paymentMethod.method) {
      return res.status(400).json({
        success: false,
        message: 'Payment method is required'
      });
    }

    // Generate order number
    const orderNumber = generateOrderNumber();

    // Start transaction
    await query('BEGIN');

    try {
      // Determine initial status based on whether payment was already processed
      const initialStatus = transactionId ? 'processing' : 'pending';
      const initialPaymentStatus = transactionId ? 'completed' : 'pending';

      // Create order
      const orderResult = await query(
        `INSERT INTO orders (
          user_id,
          order_number,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          status,
          payment_status,
          payment_transaction_id,
          shipping_address,
          payment_method,
          customer_notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          userId,
          orderNumber,
          subtotal || 0,
          tax || 0,
          shipping || 0,
          discount || 0,
          total || 0,
          initialStatus,
          initialPaymentStatus,
          transactionId || null,
          JSON.stringify(shippingAddress),
          JSON.stringify(paymentMethod),
          notes || null
        ]
      );

      const order = orderResult.rows[0];

      // Insert order items
      for (const item of items) {
        await query(
          `INSERT INTO order_items (
            order_id,
            product_id,
            variant_id,
            product_name,
            product_image_url,
            unit_price,
            discount_amount,
            quantity,
            total
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            order.id,
            item.productId,
            item.variantId || null,
            item.productName,
            item.productImage || null,
            item.unitPrice,
            item.discountAmount || 0,
            item.quantity,
            item.total
          ]
        );

        // Update product stock
        await query(
          `UPDATE products 
           SET stock_quantity = stock_quantity - $1
           WHERE id = $2 AND stock_quantity >= $1`,
          [item.quantity, item.productId]
        );
      }

      // Add initial status history
      await query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
         VALUES ($1, $2, $3, $4)`,
        [order.id, 'pending', 'Order placed', 'System']
      );

      // Commit transaction
      await query('COMMIT');

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          status: order.status,
          total: order.total,
          createdAt: order.created_at
        }
      });

    } catch (error) {
      // Rollback on error
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;

    let whereConditions = ['o.user_id = $1'];
    let params = [userId];
    let paramCount = 2;

    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');
    const offset = (page - 1) * limit;

    const result = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.order_type,
        o.subtotal,
        o.tax,
        o.shipping,
        o.discount,
        o.total,
        o.status,
        o.payment_status,
        o.tracking_number,
        o.created_at,
        o.updated_at,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
      FROM orders o
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: {
        orders: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(countResult.rows[0].total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Get order
    const orderResult = await query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    // Get status history
    const historyResult = await query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
        statusHistory: historyResult.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
