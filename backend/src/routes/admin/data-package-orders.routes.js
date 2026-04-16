const express = require('express');
const { query } = require('../../config/database');

const router = express.Router();

/**
 * @route   GET /api/admin/data-package-orders
 * @desc    Get all data package orders with filters
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, search, dateFrom, dateTo, page = 1, limit = 50 } = req.query;
    
    let whereConditions = [];
    let params = [];
    let paramCount = 1;

    // Only get data package orders
    whereConditions.push(`o.order_type = 'data_package'`);

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

    // Get data package orders with user info and package details
    const result = await query(
      `SELECT 
        o.id,
        o.order_number,
        o.user_id,
        CONCAT(u.first_name, ' ', u.last_name) as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        o.total as amount,
        o.status,
        o.payment_status,
        o.payment_transaction_id,
        o.shipping_address,
        o.payment_method,
        o.created_at,
        o.updated_at,
        oi.package_name,
        oi.provider_name,
        oi.recipient_phone,
        oi.package_duration,
        oi.package_data
      FROM orders o
      JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
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
 * @route   GET /api/admin/data-package-orders/:id
 * @desc    Get data package order details
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
        u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.id = $1 AND o.order_type = 'data_package'`,
      [id]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Data package order not found',
      });
    }

    // Get order items (package details)
    const itemsResult = await query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [id]
    );

    // Get order status history
    const historyResult = await query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at DESC`,
      [id]
    );

    const order = orderResult.rows[0];
    order.items = itemsResult.rows;
    order.status_history = historyResult.rows;

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/data-package-orders/stats/summary
 * @desc    Get data package orders statistics
 * @access  Private/Admin
 */
router.get('/stats/summary', async (req, res, next) => {
  try {
    // Get total orders count
    const totalResult = await query(
      `SELECT COUNT(*) as total FROM orders WHERE order_type = 'data_package'`
    );

    // Get total revenue
    const revenueResult = await query(
      `SELECT SUM(total) as revenue FROM orders WHERE order_type = 'data_package' AND payment_status = 'paid'`
    );

    // Get orders by status
    const statusResult = await query(
      `SELECT status, COUNT(*) as count FROM orders WHERE order_type = 'data_package' GROUP BY status`
    );

    // Get recent orders (last 7 days)
    const recentResult = await query(
      `SELECT COUNT(*) as count FROM orders 
       WHERE order_type = 'data_package' AND created_at >= NOW() - INTERVAL '7 days'`
    );

    // Get top providers
    const providersResult = await query(
      `SELECT oi.provider_name, COUNT(*) as count, SUM(oi.total) as revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       WHERE o.order_type = 'data_package'
       GROUP BY oi.provider_name
       ORDER BY count DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        totalOrders: parseInt(totalResult.rows[0].total),
        totalRevenue: parseFloat(revenueResult.rows[0].revenue || 0),
        ordersByStatus: statusResult.rows,
        recentOrders: parseInt(recentResult.rows[0].count),
        topProviders: providersResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
