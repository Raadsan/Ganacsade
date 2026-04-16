const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { authenticate, authorize } = require('../../middleware/auth');

/**
 * @route   GET /api/admin/settings
 * @desc    Get all settings
 * @access  Private (Admin only)
 */
router.get('/', async (req, res, next) => {
  try {
    const { category } = req.query;

    let queryText = 'SELECT * FROM settings';
    const params = [];

    if (category) {
      queryText += ' WHERE category = $1';
      params.push(category);
    }

    queryText += ' ORDER BY category, key';

    const result = await query(queryText, params);

    res.json({
      success: true,
      data: {
        settings: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/settings/:key
 * @desc    Get a specific setting by key
 * @access  Private (Admin only)
 */
router.get('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const result = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      data: {
        setting: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/settings/:key
 * @desc    Update a setting
 * @access  Private (Admin only)
 */
router.put('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Value is required'
      });
    }

    // Check if setting exists
    const checkResult = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    // Update setting
    const updateFields = ['value = $1'];
    const params = [value.toString()];
    let paramCount = 2;

    if (description !== undefined) {
      updateFields.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    // Always update updated_at
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    params.push(key);

    const result = await query(
      `UPDATE settings 
       SET ${updateFields.join(', ')}
       WHERE key = $${paramCount}
       RETURNING *`,
      params
    );

    res.json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        setting: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/settings
 * @desc    Create a new setting
 * @access  Private (Admin only)
 */
router.post('/', async (req, res, next) => {
  try {
    const { key, value, description, category, data_type } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required'
      });
    }

    // Check if setting already exists
    const checkResult = await query(
      'SELECT * FROM settings WHERE key = $1',
      [key]
    );

    if (checkResult.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists'
      });
    }

    // Create setting
    const result = await query(
      `INSERT INTO settings (key, value, description, category, data_type)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        key,
        value.toString(),
        description || null,
        category || 'general',
        data_type || 'string'
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: {
        setting: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/settings/:key
 * @desc    Delete a setting
 * @access  Private (Admin only)
 */
router.delete('/:key', async (req, res, next) => {
  try {
    const { key } = req.params;

    const result = await query(
      'DELETE FROM settings WHERE key = $1 RETURNING *',
      [key]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found'
      });
    }

    res.json({
      success: true,
      message: 'Setting deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
