import express from 'express';
import {
  getDataPackageOrderById,
  getDataPackageOrders,
  getDataPackageOrdersSummaryStats,
} from '../../controllers/admin/dataPackageOrdersController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/data-package-orders
 * @desc    Get all data package orders with filters
 * @access  Private/Admin
 */
router.get('/', getDataPackageOrders);

/**
 * @route   GET /api/admin/data-package-orders/stats/summary
 * @desc    Get data package orders statistics
 * @access  Private/Admin
 */
router.get('/stats/summary', getDataPackageOrdersSummaryStats);

/**
 * @route   GET /api/admin/data-package-orders/:id
 * @desc    Get data package order details
 * @access  Private/Admin
 */
router.get('/:id', getDataPackageOrderById);

export default router;
