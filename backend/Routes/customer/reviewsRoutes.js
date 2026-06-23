import express from 'express';
const router = express.Router();
import { authenticate } from '../../middlewares/auth.js';
import {
  createReview,
  deleteReview,
  getProductReviews,
  updateReview,
  voteReviewHelpful,
} from '../../controllers/customer/reviewsController.js';

/**
 * @route   GET /api/customer/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
router.get('/product/:productId', getProductReviews);

/**
 * @route   POST /api/customer/reviews
 * @desc    Create a new review
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, createReview);

/**
 * @route   PUT /api/customer/reviews/:id
 * @desc    Update a review
 * @access  Private (owner only)
 */
router.put('/:id', authenticate, updateReview);

/**
 * @route   DELETE /api/customer/reviews/:id
 * @desc    Delete a review
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, deleteReview);

/**
 * @route   POST /api/customer/reviews/:id/helpful
 * @desc    Mark a review as helpful or not helpful
 * @access  Private
 */
router.post('/:id/helpful', authenticate, voteReviewHelpful);

export default router;
