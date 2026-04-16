const express = require('express');
const { query } = require('../../config/database');

const router = express.Router();

/**
 * @route   GET /api/customer/categories
 * @desc    Get all active categories with subcategory count
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT 
        c.id,
        c.name_en,
        c.name_so,
        c.name_ar,
        c.description_en,
        c.description_so,
        c.description_ar,
        c.icon_path,
        c.color,
        c.image_url,
        c.display_order,
        COUNT(DISTINCT sc.id) as product_count
      FROM categories c
      LEFT JOIN subcategories sc ON c.id = sc.category_id 
        AND sc.is_active = true
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.display_order ASC, c.name_en ASC`
    );

    res.json({
      success: true,
      data: {
        categories: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/categories/:id
 * @desc    Get single category by ID with subcategories
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get category
    const categoryResult = await query(
      `SELECT 
        c.id,
        c.name_en,
        c.name_so,
        c.name_ar,
        c.description_en,
        c.description_so,
        c.description_ar,
        c.icon_path,
        c.color,
        c.image_url,
        c.display_order,
        COUNT(DISTINCT p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id 
        AND p.deleted_at IS NULL 
        AND p.status = 'active'
        AND p.in_stock = true
      WHERE c.id = $1
        AND c.is_active = true
      GROUP BY c.id`,
      [id]
    );

    if (categoryResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Get subcategories
    const subcategoriesResult = await query(
      `SELECT 
        sc.id,
        sc.name_en,
        sc.name_so,
        sc.name_ar,
        sc.description_en,
        sc.description_so,
        sc.description_ar,
        sc.image_url,
        sc.display_order,
        COUNT(DISTINCT p.id) as product_count
      FROM subcategories sc
      LEFT JOIN products p ON sc.id = p.subcategory_id 
        AND p.deleted_at IS NULL 
        AND p.status = 'active'
        AND p.in_stock = true
      WHERE sc.category_id = $1
        AND sc.is_active = true
      GROUP BY sc.id
      ORDER BY sc.display_order ASC, sc.name_en ASC`,
      [id]
    );

    const category = categoryResult.rows[0];
    category.subcategories = subcategoriesResult.rows;

    res.json({
      success: true,
      data: {
        category
      }
    });
  } catch (error) {
    next(error);
  }
});

// Note: Removed /type/:type endpoint as categories table doesn't have a 'type' column
// Category types are handled in the Flutter app based on category names/IDs

module.exports = router;
