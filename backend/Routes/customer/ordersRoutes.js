import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import { createOrder, getOrderById, getOrders } from '../../controllers/customer/ordersController.js';

const router = express.Router();

router.post('/', authenticate, createOrder);

/**
 * @route   GET /api/customer/orders
 * @access  Private
 */
router.get('/', authenticate, getOrders);

/**
 * @route   GET /api/customer/orders/:id
 * @access  Private
 */
router.get('/:id', authenticate, getOrderById);

export default router;
