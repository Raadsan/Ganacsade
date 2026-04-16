const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { authenticate, optionalAuth } = require('../../middleware/auth');

/**
 * @route   GET /api/customer/reviews/product/:productId
 * @desc    Get reviews for a product
 * @access  Public
 */
router.get('/product/:productId', async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'created_at', 
      sortOrder = 'DESC',
      rating // Optional filter by rating
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build where conditions
    let whereConditions = ['r.product_id = $1', 'r.is_approved = TRUE'];
    let params = [productId];
    let paramCount = 2;

    if (rating) {
      whereConditions.push(`r.rating = $${paramCount}`);
      params.push(parseInt(rating));
      paramCount++;
    }

    const whereClause = whereConditions.join(' AND ');

    // Get reviews with user info
    const result = await query(
      `SELECT 
        r.id,
        r.rating,
        r.title,
        r.comment,
        r.is_verified_purchase,
        r.is_featured,
        r.helpful_count,
        r.not_helpful_count,
        r.created_at,
        r.updated_at,
        u.id as user_id,
        u.first_name,
        u.last_name,
        CONCAT(LEFT(u.first_name, 1), LEFT(u.last_name, 1)) as initials
      FROM product_reviews r
      JOIN users u ON r.user_id = u.id
      WHERE ${whereClause}
      ORDER BY r.is_featured DESC, r.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM product_reviews r
       WHERE ${whereClause}`,
      params
    );

    // Get rating distribution
    const ratingDistribution = await query(
      `SELECT 
        rating,
        COUNT(*) as count
       FROM product_reviews
       WHERE product_id = $1 AND is_approved = TRUE
       GROUP BY rating
       ORDER BY rating DESC`,
      [productId]
    );

    // Get average rating
    const avgResult = await query(
      `SELECT 
        COALESCE(ROUND(AVG(rating)::numeric, 1), 0) as average_rating,
        COUNT(*) as total_reviews
       FROM product_reviews
       WHERE product_id = $1 AND is_approved = TRUE`,
      [productId]
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    // Format rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratingDistribution.rows.forEach(row => {
      distribution[row.rating] = parseInt(row.count);
    });

    res.json({
      success: true,
      data: {
        reviews: result.rows.map(review => ({
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.is_verified_purchase,
          isFeatured: review.is_featured,
          helpfulCount: review.helpful_count,
          notHelpfulCount: review.not_helpful_count,
          createdAt: review.created_at,
          updatedAt: review.updated_at,
          user: {
            id: review.user_id,
            firstName: review.first_name,
            lastName: review.last_name,
            initials: review.initials,
            displayName: `${review.first_name} ${review.last_name}`
          }
        })),
        summary: {
          averageRating: parseFloat(avgResult.rows[0].average_rating),
          totalReviews: parseInt(avgResult.rows[0].total_reviews),
          ratingDistribution: distribution
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: total,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/customer/reviews
 * @desc    Create a new review
 * @access  Private (requires authentication)
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, rating, title, comment, orderId } = req.body;

    // Validate required fields
    if (!productId || !rating) {
      return res.status(400).json({
        success: false,
        message: 'Product ID and rating are required'
      });
    }

    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if product exists
    const productCheck = await query(
      'SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL',
      [productId]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = await query(
      'SELECT id FROM product_reviews WHERE product_id = $1 AND user_id = $2',
      [productId, userId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Check if this is a verified purchase
    let isVerifiedPurchase = false;
    if (orderId) {
      const orderCheck = await query(
        `SELECT id FROM orders 
         WHERE id = $1 AND user_id = $2 AND status = 'delivered'`,
        [orderId, userId]
      );
      isVerifiedPurchase = orderCheck.rows.length > 0;
    } else {
      // Check if user has any delivered order with this product
      const purchaseCheck = await query(
        `SELECT o.id FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         WHERE o.user_id = $1 AND oi.product_id = $2 AND o.status = 'delivered'
         LIMIT 1`,
        [userId, productId]
      );
      isVerifiedPurchase = purchaseCheck.rows.length > 0;
    }

    // Create the review
    const result = await query(
      `INSERT INTO product_reviews 
        (product_id, user_id, order_id, rating, title, comment, is_verified_purchase)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [productId, userId, orderId || null, rating, title || null, comment || null, isVerifiedPurchase]
    );

    const review = result.rows[0];

    // Get user info
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      data: {
        review: {
          id: review.id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          isVerifiedPurchase: review.is_verified_purchase,
          createdAt: review.created_at,
          user: {
            firstName: user.first_name,
            lastName: user.last_name,
            displayName: `${user.first_name} ${user.last_name}`
          }
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/customer/reviews/:id
 * @desc    Update a review
 * @access  Private (owner only)
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, title, comment } = req.body;

    // Check if review exists and belongs to user
    const reviewCheck = await query(
      'SELECT * FROM product_reviews WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to edit it'
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update the review
    const result = await query(
      `UPDATE product_reviews 
       SET rating = COALESCE($1, rating),
           title = COALESCE($2, title),
           comment = COALESCE($3, comment),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4 AND user_id = $5
       RETURNING *`,
      [rating, title, comment, id, userId]
    );

    res.json({
      success: true,
      message: 'Review updated successfully',
      data: {
        review: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/customer/reviews/:id
 * @desc    Delete a review
 * @access  Private (owner only)
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if review exists and belongs to user
    const result = await query(
      'DELETE FROM product_reviews WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found or you do not have permission to delete it'
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/customer/reviews/:id/helpful
 * @desc    Mark a review as helpful or not helpful
 * @access  Private
 */
router.post('/:id/helpful', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { isHelpful } = req.body;

    if (typeof isHelpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isHelpful must be a boolean'
      });
    }

    // Check if review exists
    const reviewCheck = await query(
      'SELECT id, user_id FROM product_reviews WHERE id = $1',
      [id]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Can't vote on your own review
    if (reviewCheck.rows[0].user_id === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot vote on your own review'
      });
    }

    // Check if user already voted
    const existingVote = await query(
      'SELECT * FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingVote.rows.length > 0) {
      // Update existing vote
      const oldVote = existingVote.rows[0].is_helpful;
      
      if (oldVote === isHelpful) {
        // Remove vote if clicking same option
        await query(
          'DELETE FROM review_helpful_votes WHERE review_id = $1 AND user_id = $2',
          [id, userId]
        );
        
        // Update counts
        if (isHelpful) {
          await query(
            'UPDATE product_reviews SET helpful_count = helpful_count - 1 WHERE id = $1',
            [id]
          );
        } else {
          await query(
            'UPDATE product_reviews SET not_helpful_count = not_helpful_count - 1 WHERE id = $1',
            [id]
          );
        }
      } else {
        // Change vote
        await query(
          'UPDATE review_helpful_votes SET is_helpful = $1 WHERE review_id = $2 AND user_id = $3',
          [isHelpful, id, userId]
        );
        
        // Update counts
        if (isHelpful) {
          await query(
            'UPDATE product_reviews SET helpful_count = helpful_count + 1, not_helpful_count = not_helpful_count - 1 WHERE id = $1',
            [id]
          );
        } else {
          await query(
            'UPDATE product_reviews SET helpful_count = helpful_count - 1, not_helpful_count = not_helpful_count + 1 WHERE id = $1',
            [id]
          );
        }
      }
    } else {
      // Create new vote
      await query(
        'INSERT INTO review_helpful_votes (review_id, user_id, is_helpful) VALUES ($1, $2, $3)',
        [id, userId, isHelpful]
      );
      
      // Update counts
      if (isHelpful) {
        await query(
          'UPDATE product_reviews SET helpful_count = helpful_count + 1 WHERE id = $1',
          [id]
        );
      } else {
        await query(
          'UPDATE product_reviews SET not_helpful_count = not_helpful_count + 1 WHERE id = $1',
          [id]
        );
      }
    }

    // Get updated review
    const updatedReview = await query(
      'SELECT helpful_count, not_helpful_count FROM product_reviews WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Vote recorded',
      data: {
        helpfulCount: updatedReview.rows[0].helpful_count,
        notHelpfulCount: updatedReview.rows[0].not_helpful_count
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
