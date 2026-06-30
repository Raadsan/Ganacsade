import express from 'express';
import { body } from 'express-validator';

import * as authController from '../controllers/authController.js';
import * as notificationsController from '../controllers/notificationsController.js';
import {
  getMyAssignedOrders,
  markAssignedOrderDelivered,
  getDeliveryDashboard,
} from '../controllers/admin/ordersController.js';
import { authenticate } from '../middlewares/auth.js';
import validate from '../middlewares/validate.js';
import { uploadProfile } from '../middlewares/upload.js';

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// =====================================================

/**
 * @route   POST /api/auth/register
 */
router.post(
  '/register',
  [
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email format is required'),
    body('phoneNumber').optional({ nullable: true, checkFalsy: true }).trim(),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('firstName').optional({ nullable: true, checkFalsy: true }).trim(),
    body('lastName').optional({ nullable: true, checkFalsy: true }).trim(),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phoneNumber) {
        throw new Error('Either email or phone number must be provided');
      }
      return true;
    }),
    validate,
  ],
  authController.register
);

/**
 * @route   POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('identifier').optional({ nullable: true, checkFalsy: true }).trim(),
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email format is required'),
    body('phoneNumber').optional({ nullable: true, checkFalsy: true }).trim(),
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phoneNumber && !req.body.identifier) {
        throw new Error('Email or phone number must be provided');
      }
      return true;
    }),
    validate,
  ],
  authController.login
);

/**
 * @route   POST /api/auth/admin/login
 */
router.post(
  '/admin/login',
  [
    body('email').optional({ nullable: true, checkFalsy: true }).isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('phoneNumber').optional({ nullable: true, checkFalsy: true }).trim(),
    body('password').notEmpty().withMessage('Password is required'),
    body().custom((value, { req }) => {
      if (!req.body.email && !req.body.phoneNumber && !req.body.identifier) {
        throw new Error('Either email or phone number must be provided');
      }
      return true;
    }),
    validate,
  ],
  authController.adminLogin
);

/**
 * @route   POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required'), validate],
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-otp
 */
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    validate,
  ],
  authController.verifyOTP
);

/**
 * @route   POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  authController.resetPassword
);

/**
 * @route   POST /api/auth/refresh-token
 */
router.post('/refresh-token', authController.refreshToken);

// =====================================================
// PROTECTED ROUTES
// =====================================================

/**
 * @route   GET /api/auth/profile
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 */
router.put(
  '/profile',
  [
    authenticate,
    body('firstName').optional().trim(),
    body('lastName').optional().trim(),
    body('phoneNumber').optional(),
    validate,
  ],
  authController.updateProfile
);

/**
 * @route   POST /api/auth/profile-image
 */
router.post('/profile-image', authenticate, uploadProfile.single('image'), authController.uploadProfileImage);

/**
 * @route   GET /api/auth/delivery-profile
 */
router.get('/delivery-profile', authenticate, authController.getDeliveryProfile);

/**
 * @route   PUT /api/auth/delivery-profile
 */
router.put('/delivery-profile', authenticate, authController.updateDeliveryProfile);

/**
 * @route   POST /api/auth/change-password
 */
router.post(
  '/change-password',
  [
    authenticate,
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  authController.changePassword
);

/**
 * @route   POST /api/auth/logout
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   GET /api/auth/notifications
 */
router.get('/notifications', authenticate, notificationsController.getMyNotifications);

/**
 * @route   PATCH /api/auth/notifications/read-all
 */
router.patch('/notifications/read-all', authenticate, notificationsController.markAllNotificationsRead);

/**
 * @route   PATCH /api/auth/notifications/:id/read
 */
router.patch('/notifications/:id/read', authenticate, notificationsController.markNotificationRead);

/**
 * @route   POST /api/auth/fcm-token
 */
router.post('/fcm-token', authenticate, authController.registerFcmToken);

/**
 * @route   GET /api/auth/delivery/orders
 * @desc    Delivery user's assigned orders (mobile app)
 */
router.get('/delivery/orders', authenticate, getMyAssignedOrders);

/**
 * @route   GET /api/auth/delivery/dashboard
 * @desc    Delivery dashboard stats (mobile app)
 */
router.get('/delivery/dashboard', authenticate, getDeliveryDashboard);

/**
 * @route   PATCH /api/auth/delivery/orders/:id/delivered
 * @desc    Mark assigned order as delivered (mobile app)
 */
router.patch('/delivery/orders/:id/delivered', authenticate, markAssignedOrderDelivered);

export default router;
