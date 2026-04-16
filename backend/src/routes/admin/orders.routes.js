const express = require('express');
const { query } = require('../../config/database');

const router = express.Router();

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    // Exclude data package orders from product orders list
    whereConditions.push(`(o.order_type IS NULL OR o.order_type != 'data_package')`);

    // Status filter
    if (status && status !== 'all') {
      whereConditions.push(`o.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    // Search filter (order number or customer name)
    if (search) {
      whereConditions.push(`(o.order_number ILIKE $${paramCount} OR CONCAT(u.first_name, ' ', u.last_name) ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Date range filter
    if (dateFrom) {
      whereConditions.push(`o.created_at >= $${paramCount}`);
      params.push(dateFrom);
      paramCount++;
    }

    if (dateTo) {
      whereConditions.push(`o.created_at <= $${paramCount}`);
      params.push(dateTo + ' 23:59:59');
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ')
      : '';

    // Get orders with user info
    const result = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email,
        o.subtotal,
        o.tax,
        o.shipping,
        o.discount,
        o.total,
        o.status,
        o.payment_status,
        o.shipping_address,
        o.payment_method,
        o.tracking_number,
        o.notes,
        o.created_at,
        o.updated_at
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ${whereClause}
      ORDER BY o.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM orders o JOIN users u ON o.user_id = u.id ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order details with items
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get order details
    const orderResult = await query(
      `SELECT 
        o.*,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email,
        u.phone_number as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const order = orderResult.rows[0];

    // Get order items
    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    // Get order status history
    const historyResult = await query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
        statusHistory: historyResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.patch('/:id/status', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    // Update order status
    const result = await query(
      `UPDATE orders 
       SET status = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Add to status history
    await query(
      `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
       VALUES ($1, $2, $3, $4)`,
      [id, status, notes || `Status updated to ${status}`, req.user.first_name + ' ' + req.user.last_name]
    );

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
