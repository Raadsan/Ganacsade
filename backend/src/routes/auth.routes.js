const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { uploadProfile } = require('../middleware/upload');

const router = express.Router();

// =====================================================
// PUBLIC ROUTES
// =====================================================

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email')
      .optional({ nullable: true, checkFalsy: true })
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email must be a valid email format'),
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
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
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
 * @desc    Admin login
 * @access  Public
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
 * @desc    Request password reset OTP
 * @access  Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    validate,
  ],
  authController.forgotPassword
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP code
 * @access  Public
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
 * @desc    Reset password using OTP
 * @access  Public
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

// =====================================================
// PROTECTED ROUTES
// =====================================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
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
 * @desc    Upload profile image
 * @access  Private
 */
router.post(
  '/profile-image',
  authenticate,
  uploadProfile.single('image'),
  authController.uploadProfileImage
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
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
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, authController.logout);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
