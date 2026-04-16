const express = require('express');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { query } = require('../../config/database');
const { uploadSubcategory } = require('../../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/admin/subcategories
 * @desc    Get all subcategories or by category
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    let queryText = `
      SELECT s.*, c.name_en as category_name
      FROM subcategories s
      LEFT JOIN categories c ON s.category_id = c.id
    `;
    const params = [];

    if (categoryId) {
      queryText += ' WHERE s.category_id = $1';
      params.push(categoryId);
    }

    queryText += ' ORDER BY s.display_order, s.name_en';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/subcategories/:id
 * @desc    Get subcategory by ID
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT s.*, c.name_en as category_name
       FROM subcategories s
       LEFT JOIN categories c ON s.category_id = c.id
       WHERE s.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/subcategories
 * @desc    Create new subcategory
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('categoryId').notEmpty().withMessage('Category ID is required'),
    body('nameEn').notEmpty().withMessage('English name is required'),
    body('nameSo').notEmpty().withMessage('Somali name is required'),
    body('nameAr').notEmpty().withMessage('Arabic name is required'),
    validate,
  ],
  async (req, res, next) => {
    try {
      const {
        categoryId, nameEn, nameSo, nameAr,
        descriptionEn, descriptionSo, descriptionAr,
        imageUrl, isActive = true, displayOrder = 0
      } = req.body;

      const result = await query(
        `INSERT INTO subcategories (
          category_id, name_en, name_so, name_ar,
          description_en, description_so, description_ar,
          image_url, is_active, display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [categoryId, nameEn, nameSo, nameAr, descriptionEn, descriptionSo, descriptionAr,
         imageUrl, isActive, displayOrder]
      );

      res.status(201).json({
        success: true,
        message: 'Subcategory created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/admin/subcategories/:id
 * @desc    Update subcategory
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      categoryId, nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      imageUrl, isActive, displayOrder
    } = req.body;

    const result = await query(
      `UPDATE subcategories
       SET category_id = COALESCE($1, category_id),
           name_en = COALESCE($2, name_en),
           name_so = COALESCE($3, name_so),
           name_ar = COALESCE($4, name_ar),
           description_en = COALESCE($5, description_en),
           description_so = COALESCE($6, description_so),
           description_ar = COALESCE($7, description_ar),
           image_url = COALESCE($8, image_url),
           is_active = COALESCE($9, is_active),
           display_order = COALESCE($10, display_order)
       WHERE id = $11
       RETURNING *`,
      [categoryId, nameEn, nameSo, nameAr, descriptionEn, descriptionSo, descriptionAr,
       imageUrl, isActive, displayOrder, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/subcategories/:id
 * @desc    Delete subcategory
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if subcategory has products
    const productCheck = await query(
      'SELECT COUNT(*) as count FROM products WHERE subcategory_id = $1',
      [id]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete subcategory with existing products',
      });
    }

    const result = await query('DELETE FROM subcategories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    res.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/subcategories/upload-image
 * @desc    Upload subcategory image
 * @access  Private/Admin
 */
router.post('/upload-image', uploadSubcategory.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const imageUrl = `/uploads/subcategories/${req.file.filename}`;

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
