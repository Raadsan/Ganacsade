import express from 'express';
const router = express.Router();
import {
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  getUserStats,
  updateUser,
  updateUserStatus,
} from '../../controllers/admin/usersController.js';

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with filters
 * @access  Private/Admin
 */
router.get('/', getUsers);

/**
 * @route   GET /api/admin/users/stats
 * @desc    Get user statistics
 * @access  Private/Admin
 */
router.get('/stats', getUserStats);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get single user
 * @access  Private/Admin
 */
router.get('/:id', getUserById);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private/Admin
 */
router.post('/', createUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user
 * @access  Private/Admin
 */
router.put('/:id', updateUser);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status
 * @access  Private/Admin
 */
router.put('/:id/status', updateUserStatus);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user (soft delete)
 * @access  Private/Admin
 */
router.delete('/:id', deleteUser);

export default router;
