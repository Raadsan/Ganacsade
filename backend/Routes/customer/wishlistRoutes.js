import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  addWishlistItem,
  checkWishlistItem,
  clearWishlist,
  getWishlist,
  removeWishlistItem,
} from '../../controllers/customer/wishlistController.js';

const router = express.Router();

/**
 * @route   GET /api/customer/wishlist/check/:productId
 * @access  Private  (must be BEFORE /:productId DELETE route)
 */
router.get('/check/:productId', authenticate, checkWishlistItem);

/**
 * @route   GET /api/customer/wishlist
 * @access  Private
 */
router.get('/', authenticate, getWishlist);

/**
 * @route   POST /api/customer/wishlist
 * @access  Private
 */
router.post('/', authenticate, addWishlistItem);

/**
 * @route   DELETE /api/customer/wishlist/:productId
 * @access  Private
 */
router.delete('/:productId', authenticate, removeWishlistItem);

/**
 * @route   DELETE /api/customer/wishlist
 * @access  Private
 */
router.delete('/', authenticate, clearWishlist);

export default router;
