import express from 'express';
const router = express.Router();
import { authenticate } from '../../middlewares/auth.js';
import { createDataPackageOrder } from '../../controllers/customer/dataPackageOrdersController.js';

/**
 * @route   POST /api/customer/data-package-orders
 * @desc    Create a new data package order after successful payment
 * @access  Private
 */
router.post('/', authenticate, createDataPackageOrder);

export default router;
