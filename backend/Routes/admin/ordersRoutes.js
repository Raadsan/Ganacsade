import express from 'express';
import {
  advanceOrderStatus,
  assignOrderDelivery,
  getDeliveryDashboard,
  getOrderById,
  getAssignableDeliveryUsers,
  getOrders,
  getMyAssignedOrders,
  markAssignedOrderDelivered,
  updateOrderStatus,
} from '../../controllers/admin/ordersController.js';

const router = express.Router();

/**
 * @route   GET /api/admin/orders
 * @desc    Get all orders with filters
 * @access  Private/Admin
 */
router.get('/', getOrders);
router.get('/delivery-users', getAssignableDeliveryUsers);
router.get('/delivery-dashboard', getDeliveryDashboard);
router.get('/my-assigned', getMyAssignedOrders);

/**
 * @route   GET /api/admin/orders/:id
 * @desc    Get order details with items
 * @access  Private/Admin
 */
router.get('/:id', getOrderById);

/**
 * @route   PATCH /api/admin/orders/:id/status
 * @desc    Update order status
 * @access  Private/Admin
 */
router.patch('/:id/status', updateOrderStatus);

/**
 * @route   PATCH /api/admin/orders/:id/advance-status
 * @desc    Advance order to next status with delivery assignment
 * @access  Private/Admin
 */
router.patch('/:id/advance-status', advanceOrderStatus);

/**
 * @route   PATCH /api/admin/orders/:id/assign-delivery
 * @desc    Assign order to a delivery person (user role: delivery_person)
 * @access  Private/Admin
 */
router.patch('/:id/assign-delivery', assignOrderDelivery);

/**
 * @route   PATCH /api/admin/orders/:id/delivered-by-delivery
 * @desc    Mark assigned order as delivered by delivery user
 * @access  Private/Delivery
 */
router.patch('/:id/delivered-by-delivery', markAssignedOrderDelivered);

export default router;
