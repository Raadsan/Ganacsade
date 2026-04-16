const express = require('express');
const { query } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/customer/wishlist
 * @desc    Get user's wishlist items
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        w.id as wishlist_id,
        w.created_at as added_at,
        p.id,
        p.name_en,
        p.name_so,
        p.name_ar,
        p.description_en,
        p.description_so,
        p.description_ar,
        p.price,
        p.discount_price,
        p.discount_percentage,
        p.in_stock,
        p.stock_quantity,
        p.image_url,
        p.images,
        p.rating,
        p.reviews_count,
        c.name_en as category_name_en,
        c.name_so as category_name_so,
        c.name_ar as category_name_ar
      FROM wishlist w
      INNER JOIN products p ON w.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE w.user_id = $1 
        AND w.deleted_at IS NULL
        AND p.deleted_at IS NULL
        AND p.status = 'active'
      ORDER BY w.created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    next(error);
  }
});

/**
 * @route   POST /api/customer/wishlist
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Check if product exists and is active
    const productCheck = await query(
      `SELECT id FROM products 
       WHERE id = $1 AND deleted_at IS NULL AND status = 'active'`,
      [product_id]
    );

    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if already in wishlist
    const existingItem = await query(
      `SELECT id FROM wishlist 
       WHERE user_id = $1 AND product_id = $2 AND deleted_at IS NULL`,
      [userId, product_id]
    );

    if (existingItem.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add to wishlist
    const result = await query(
      `INSERT INTO wishlist (user_id, product_id, created_at)
       VALUES ($1, $2, NOW())
       RETURNING id, created_at`,
      [userId, product_id]
    );

    res.status(201).json({
      success: true,
      message: 'Product added to wishlist',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/customer/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/:productId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await query(
      `UPDATE wishlist 
       SET deleted_at = NOW()
       WHERE user_id = $1 AND product_id = $2 AND deleted_at IS NULL
       RETURNING id`,
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in wishlist'
      });
    }

    res.json({
      success: true,
      message: 'Product removed from wishlist'
    });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    next(error);
  }
});

/**
 * @route   DELETE /api/customer/wishlist
 * @desc    Clear entire wishlist
 * @access  Private
 */
router.delete('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    await query(
      `UPDATE wishlist 
       SET deleted_at = NOW()
       WHERE user_id = $1 AND deleted_at IS NULL`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Wishlist cleared'
    });
  } catch (error) {
    console.error('Error clearing wishlist:', error);
    next(error);
  }
});

/**
 * @route   GET /api/customer/wishlist/check/:productId
 * @desc    Check if product is in wishlist
 * @access  Private
 */
router.get('/check/:productId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const result = await query(
      `SELECT id FROM wishlist 
       WHERE user_id = $1 AND product_id = $2 AND deleted_at IS NULL`,
      [userId, productId]
    );

    res.json({
      success: true,
      inWishlist: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error checking wishlist:', error);
    next(error);
  }
});

module.exports = router;
