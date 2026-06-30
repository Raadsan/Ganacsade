import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import * as notificationsController from '../../controllers/notificationsController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/notifications
 * @access  Private
 */
router.get('/', authenticate, notificationsController.getMyNotifications);

/**
 * @route   PATCH /api/customer/notifications/read-all
 * @access  Private
 */
router.patch('/read-all', authenticate, notificationsController.markAllNotificationsRead);

/**
 * @route   PATCH /api/customer/notifications/:id/read
 * @access  Private
 */
router.patch('/:id/read', authenticate, notificationsController.markNotificationRead);

export default router;
