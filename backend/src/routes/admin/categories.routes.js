const express = require('express');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { query } = require('../../config/database');
const { uploadCategory } = require('../../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/admin/categories
 * @desc    Get all categories
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, name_en, name_so, name_ar, description_en, description_so, description_ar,
             icon_path, color, image_url, is_active, display_order, product_count, created_at
      FROM categories
      ORDER BY display_order, name_en
    `);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/categories/:id
 * @desc    Get category by ID
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT * FROM categories WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Get subcategories
    const subcategories = await query(
      `SELECT * FROM subcategories WHERE category_id = $1 ORDER BY display_order`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        subcategories: subcategories.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/categories
 * @desc    Create new category
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('nameEn').notEmpty().withMessage('English name is required'),
    body('nameSo').notEmpty().withMessage('Somali name is required'),
    body('nameAr').notEmpty().withMessage('Arabic name is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const {
        nameEn, nameSo, nameAr,
        descriptionEn, descriptionSo, descriptionAr,
        iconPath, color, imageUrl, isActive = true, displayOrder = 0
      } = req.body;

      const result = await query(
        `INSERT INTO categories (
          name_en, name_so, name_ar,
          description_en, description_so, description_ar,
          icon_path, color, image_url, is_active, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *`,
        [nameEn, nameSo, nameAr, descriptionEn, descriptionSo, descriptionAr,
         iconPath, color, imageUrl, isActive, displayOrder]
      );

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/admin/categories/:id
 * @desc    Update category
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      iconPath, color, imageUrl, isActive, displayOrder
    } = req.body;

    const result = await query(
      `UPDATE categories
       SET name_en = COALESCE($1, name_en),
           name_so = COALESCE($2, name_so),
           name_ar = COALESCE($3, name_ar),
           description_en = COALESCE($4, description_en),
           description_so = COALESCE($5, description_so),
           description_ar = COALESCE($6, description_ar),
           icon_path = COALESCE($7, icon_path),
           color = COALESCE($8, color),
           image_url = COALESCE($9, image_url),
           is_active = COALESCE($10, is_active),
           display_order = COALESCE($11, display_order)
       WHERE id = $12
       RETURNING *`,
      [nameEn, nameSo, nameAr, descriptionEn, descriptionSo, descriptionAr,
       iconPath, color, imageUrl, isActive, displayOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/categories/:id
 * @desc    Delete category
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category has products
    const productCheck = await query(
      'SELECT COUNT(*) as count FROM products WHERE category_id = $1',
      [id]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products',
      });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/categories/upload-image
 * @desc    Upload category image
 * @access  Private/Admin
 */
router.post('/upload-image', uploadCategory.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const imageUrl = `/uploads/categories/${req.file.filename}`;

    res.json({
      success: true,
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
