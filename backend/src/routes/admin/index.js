const express = require('express');
const { authenticate, authorize } = require('../../middleware/auth');

const router = express.Router();

// Apply authentication and authorization to all admin routes
// Both 'admin' and 'staff' roles can access the dashboard
router.use(authenticate);
router.use(authorize('admin', 'staff'));

// Import admin route modules
const productsRoutes = require('./products.routes');
const categoriesRoutes = require('./categories.routes');
const subcategoriesRoutes = require('./subcategories.routes');
const brandsRoutes = require('./brands.routes');
const ordersRoutes = require('./orders.routes');
const dataPackageOrdersRoutes = require('./data-package-orders.routes');
const usersRoutes = require('./users.routes');
const flashSalesRoutes = require('./flash-sales.routes');
const advertisementsRoutes = require('./advertisements.routes');
const transactionsRoutes = require('./transactions.routes');
const settingsRoutes = require('./settings.routes');
const staffRoutes = require('./staff.routes');

// Mount routes
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/subcategories', subcategoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/orders', ordersRoutes);
router.use('/data-package-orders', dataPackageOrdersRoutes);
router.use('/users', usersRoutes);
router.use('/flash-sales', flashSalesRoutes);
router.use('/advertisements', advertisementsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/settings', settingsRoutes);
router.use('/staff', staffRoutes);

// Admin dashboard stats
router.get('/analytics/dashboard', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');
    
    // Get current stats (excluding data package orders)
    const currentStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND deleted_at IS NULL) as total_users,
        (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL) as total_products,
        (SELECT COUNT(*) FROM orders WHERE order_type IS NULL OR order_type != 'data_package') as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'completed' AND (order_type IS NULL OR order_type != 'data_package')) as total_revenue
    `);

    // Get last month stats for comparison (excluding data package orders)
    const lastMonthStats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM users WHERE role = 'customer' AND deleted_at IS NULL AND created_at < DATE_TRUNC('month', CURRENT_DATE)) as total_users,
        (SELECT COUNT(*) FROM products WHERE deleted_at IS NULL AND created_at < DATE_TRUNC('month', CURRENT_DATE)) as total_products,
        (SELECT COUNT(*) FROM orders WHERE created_at < DATE_TRUNC('month', CURRENT_DATE) AND (order_type IS NULL OR order_type != 'data_package')) as total_orders,
        (SELECT COALESCE(SUM(total), 0) FROM orders WHERE payment_status = 'completed' AND created_at < DATE_TRUNC('month', CURRENT_DATE) AND (order_type IS NULL OR order_type != 'data_package')) as total_revenue
    `);

    const current = currentStats.rows[0];
    const lastMonth = lastMonthStats.rows[0];

    // Calculate percentage changes
    const calculateChange = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    res.json({
      success: true,
      data: {
        totalRevenue: parseFloat(current.total_revenue),
        totalOrders: parseInt(current.total_orders),
        totalUsers: parseInt(current.total_users),
        totalProducts: parseInt(current.total_products),
        revenueChange: parseFloat(calculateChange(current.total_revenue, lastMonth.total_revenue)),
        ordersChange: parseFloat(calculateChange(current.total_orders, lastMonth.total_orders)),
        usersChange: parseFloat(calculateChange(current.total_users, lastMonth.total_users)),
        productsChange: parseFloat(calculateChange(current.total_products, lastMonth.total_products)),
      },
    });
  } catch (error) {
    next(error);
  }
});

// Recent orders
router.get('/analytics/recent-orders', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');
    const limit = parseInt(req.query.limit) || 10;
    
    const result = await query(`
      SELECT 
        o.id,
        o.order_number as "orderNumber",
        CONCAT(u.first_name, ' ', u.last_name) as "customerName",
        o.total,
        o.status,
        o.created_at as "createdAt"
      FROM orders o
      JOIN users u ON o.user_id = u.id
      WHERE o.order_type IS NULL OR o.order_type != 'data_package'
      ORDER BY o.created_at DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

// Quick stats for sidebar
router.get('/dashboard/quick-stats', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');
    
    const stats = await query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE status = 'pending' AND (order_type IS NULL OR order_type != 'data_package')) as pending_orders,
        (SELECT COUNT(*) FROM products WHERE stock_quantity <= low_stock_threshold AND deleted_at IS NULL) as low_stock_products,
        (SELECT COUNT(*) FROM products WHERE stock_quantity = 0 AND deleted_at IS NULL) as out_of_stock,
        (SELECT COUNT(*) FROM users WHERE created_at >= CURRENT_DATE) as new_users_today
    `);

    res.json({
      success: true,
      data: stats.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

// Monthly revenue + orders for last 12 months
router.get('/analytics/sales', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');

    const result = await query(`
      SELECT
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        COUNT(*) AS orders,
        COALESCE(SUM(total), 0) AS revenue
      FROM orders
      WHERE
        created_at >= DATE_TRUNC('month', NOW()) - INTERVAL '11 months'
        AND (order_type IS NULL OR order_type != 'data_package')
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month_date ASC
    `);

    res.json({
      success: true,
      data: result.rows.map(r => ({
        month: r.month,
        orders: parseInt(r.orders),
        revenue: parseFloat(r.revenue),
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Top 5 products by units sold
router.get('/analytics/top-products', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');
    const limit = parseInt(req.query.limit) || 5;

    const result = await query(`
      SELECT
        p.id,
        p.name_en AS name,
        COALESCE(SUM(oi.quantity), 0) AS total_sold,
        COALESCE(SUM(oi.total), 0) AS revenue,
        (SELECT image_url FROM product_images
         WHERE product_id = p.id AND is_primary = true LIMIT 1) AS image
      FROM products p
      LEFT JOIN order_items oi ON oi.product_id = p.id
      WHERE p.deleted_at IS NULL
      GROUP BY p.id, p.name_en
      ORDER BY total_sold DESC, revenue DESC
      LIMIT $1
    `, [limit]);

    res.json({
      success: true,
      data: result.rows.map(r => ({
        id: r.id,
        name: r.name,
        totalSold: parseInt(r.total_sold),
        revenue: parseFloat(r.revenue),
        image: r.image || null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Order status distribution
router.get('/analytics/orders-by-status', async (req, res, next) => {
  try {
    const { query } = require('../../config/database');

    const result = await query(`
      SELECT status, COUNT(*) AS count
      FROM orders
      WHERE order_type IS NULL OR order_type != 'data_package'
      GROUP BY status
      ORDER BY count DESC
    `);

    res.json({
      success: true,
      data: result.rows.map(r => ({
        status: r.status,
        count: parseInt(r.count),
      })),
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
