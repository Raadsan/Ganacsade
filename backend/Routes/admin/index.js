import express from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {
  getDashboardAnalytics,
  getOrdersByStatus,
  getQuickStats,
  getRecentOrders,
  getSalesData,
  getTopProducts,
} from '../../controllers/admin/dashboardController.js';

import productsRoutes from './productsRoutes.js';
import categoriesRoutes from './categoriesRoutes.js';
import subcategoriesRoutes from './subcategoriesRoutes.js';
import brandsRoutes from './brandsRoutes.js';
import ordersRoutes from './ordersRoutes.js';
import dataPackageOrdersRoutes from './dataPackageOrdersRoutes.js';
import usersRoutes from './usersRoutes.js';
import flashSalesRoutes from './flashSalesRoutes.js';
import advertisementsRoutes from './advertisementsRoutes.js';
import transactionsRoutes from './transactionsRoutes.js';
import settingsRoutes from './settingsRoutes.js';
import staffRoutes from './staffRoutes.js';
import rolesRoutes from './rolesRoutes.js';
import menuRoutes from './menuRoutes.js';
import rolePermissionsRoutes from './rolePermissionsRoutes.js';
import deliveryPersonsRoutes from './deliveryPersonsRoutes.js';
import { getMyMenus } from '../../controllers/admin/menuController.js';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticate);

// Delivery users need their own sidebar menus
router.get('/menus', getMyMenus);

// Orders are also used by delivery users (with controller-level permission checks)
router.use('/orders', ordersRoutes);

// Remaining routes are restricted to admin/staff
router.use(authorize('admin', 'staff'));

// Mount routes
router.use('/products', productsRoutes);
router.use('/categories', categoriesRoutes);
router.use('/subcategories', subcategoriesRoutes);
router.use('/brands', brandsRoutes);
router.use('/data-package-orders', dataPackageOrdersRoutes);
router.use('/users', usersRoutes);
router.use('/flash-sales', flashSalesRoutes);
router.use('/advertisements', advertisementsRoutes);
router.use('/transactions', transactionsRoutes);
router.use('/settings', settingsRoutes);
router.use('/staff', staffRoutes);
router.use('/roles', rolesRoutes);
router.use('/menus', menuRoutes);
router.use('/role-permissions', rolePermissionsRoutes);
router.use('/delivery-persons', deliveryPersonsRoutes);

// =====================================================
// Analytics & Dashboard Routes
// =====================================================

router.get('/analytics/dashboard', getDashboardAnalytics);
router.get('/analytics/sales', getSalesData);
router.get('/analytics/recent-orders', getRecentOrders);
router.get('/dashboard/quick-stats', getQuickStats);
router.get('/analytics/top-products', getTopProducts);
router.get('/analytics/orders-by-status', getOrdersByStatus);

export default router;
