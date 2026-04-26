const express = require('express');
const { body } = require('express-validator');
const validate = require('../../middleware/validate');
const { query } = require('../../config/database');
const { uploadCategory } = require('../../middleware/upload'); // Reuse category upload for brands

const router = express.Router();

/**
 * @route   GET /api/admin/brands
 * @desc    Get all brands
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, name, description, logo_url, is_active, 
             product_count, created_at, updated_at
      FROM brands
      ORDER BY name
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
 * @route   GET /api/admin/brands/:id
 * @desc    Get single brand
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, name, description, logo_url, is_active, 
              product_count, created_at, updated_at
       FROM brands
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
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
 * @route   POST /api/admin/brands
 * @desc    Create new brand
 * @access  Private/Admin
 */
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Brand name is required'),
    body('description').optional().trim(),
    body('logoUrl').optional().trim(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { name, description, logoUrl, isActive = true } = req.body;

      // Check if brand already exists
      const existingBrand = await query(
        'SELECT id FROM brands WHERE LOWER(name) = LOWER($1)',
        [name]
      );

      if (existingBrand.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Brand with this name already exists',
        });
      }

      const result = await query(
        `INSERT INTO brands (name, description, logo_url, is_active)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, logo_url, is_active, 
                   product_count, created_at`,
        [name, description || null, logoUrl || null, isActive]
      );

      res.status(201).json({
        success: true,
        message: 'Brand created successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PUT /api/admin/brands/:id
 * @desc    Update brand
 * @access  Private/Admin
 */
router.put(
  '/:id',
  [
    body('name').optional().trim().notEmpty().withMessage('Brand name cannot be empty'),
    body('description').optional().trim(),
    body('logoUrl').optional().trim(),
    body('isActive').optional().isBoolean(),
    validate,
  ],
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, logoUrl, isActive } = req.body;

      // Check if brand exists
      const brandCheck = await query('SELECT id FROM brands WHERE id = $1', [id]);
      if (brandCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Brand not found',
        });
      }

      // Check if new name conflicts with existing brand
      if (name) {
        const existingBrand = await query(
          'SELECT id FROM brands WHERE LOWER(name) = LOWER($1) AND id != $2',
          [name, id]
        );

        if (existingBrand.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Brand with this name already exists',
          });
        }
      }

      const result = await query(
        `UPDATE brands
         SET name = COALESCE($1, name),
             description = COALESCE($2, description),
             logo_url = COALESCE($3, logo_url),
             is_active = COALESCE($4, is_active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING id, name, description, logo_url, is_active, 
                   product_count, created_at, updated_at`,
        [name, description, logoUrl, isActive, id]
      );

      res.json({
        success: true,
        message: 'Brand updated successfully',
        data: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   DELETE /api/admin/brands/:id
 * @desc    Delete brand
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if brand has products
    const productCheck = await query(
      'SELECT COUNT(*) as count FROM products WHERE brand = $1',
      [id]
    );

    if (parseInt(productCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete brand with existing products. Please reassign or delete products first.',
      });
    }

    const result = await query(
      'DELETE FROM brands WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/brands/upload-logo
 * @desc    Upload brand logo
 * @access  Private/Admin
 */
router.post('/upload-logo', uploadCategory.single('logo'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided',
      });
    }

    const logoUrl = req.file.path;

    res.json({
      success: true,
      data: {
        logoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
