const express = require('express');
const { query } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');

const router = express.Router();

/**
 * @route   GET /api/customer/addresses
 * @desc    Get all addresses for the authenticated user
 * @access  Private
 */
router.get('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query(
      `SELECT 
        id,
        title,
        full_name,
        phone_number,
        street,
        city,
        state,
        country,
        postal_code,
        is_default,
        created_at,
        updated_at
      FROM user_addresses
      WHERE user_id = $1
      ORDER BY is_default DESC, created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        addresses: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/addresses/:id
 * @desc    Get a specific address
 * @access  Private
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const result = await query(
      `SELECT 
        id,
        title,
        full_name,
        phone_number,
        street,
        city,
        state,
        country,
        postal_code,
        is_default,
        created_at,
        updated_at
      FROM user_addresses
      WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/customer/addresses
 * @desc    Create a new address
 * @access  Private
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      title,
      fullName,
      phoneNumber,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault
    } = req.body;

    // Validate required fields
    if (!title || !fullName || !phoneNumber || !street || !city || !country) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // If this is the first address, make it default
    const countResult = await query(
      'SELECT COUNT(*) as count FROM user_addresses WHERE user_id = $1',
      [userId]
    );
    const isFirstAddress = parseInt(countResult.rows[0].count) === 0;
    const shouldBeDefault = isFirstAddress || isDefault === true;

    // Insert the new address
    const result = await query(
      `INSERT INTO user_addresses (
        user_id,
        title,
        full_name,
        phone_number,
        street,
        city,
        state,
        country,
        postal_code,
        is_default
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        userId,
        title,
        fullName,
        phoneNumber,
        street,
        city,
        state || null,
        country,
        postalCode || null,
        shouldBeDefault
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/customer/addresses/:id
 * @desc    Update an address
 * @access  Private
 */
router.put('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const {
      title,
      fullName,
      phoneNumber,
      street,
      city,
      state,
      country,
      postalCode,
      isDefault
    } = req.body;

    // Check if address exists and belongs to user
    const checkResult = await query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Update the address
    const result = await query(
      `UPDATE user_addresses SET
        title = COALESCE($1, title),
        full_name = COALESCE($2, full_name),
        phone_number = COALESCE($3, phone_number),
        street = COALESCE($4, street),
        city = COALESCE($5, city),
        state = COALESCE($6, state),
        country = COALESCE($7, country),
        postal_code = COALESCE($8, postal_code),
        is_default = COALESCE($9, is_default)
      WHERE id = $10 AND user_id = $11
      RETURNING *`,
      [
        title,
        fullName,
        phoneNumber,
        street,
        city,
        state,
        country,
        postalCode,
        isDefault,
        id,
        userId
      ]
    );

    res.json({
      success: true,
      message: 'Address updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/customer/addresses/:id
 * @desc    Delete an address
 * @access  Private
 */
router.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const checkResult = await query(
      'SELECT id, is_default FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const wasDefault = checkResult.rows[0].is_default;

    // Delete the address
    await query(
      'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    // If deleted address was default, make another address default
    if (wasDefault) {
      await query(
        `UPDATE user_addresses 
         SET is_default = TRUE 
         WHERE user_id = $1 
         AND id = (
           SELECT id FROM user_addresses 
           WHERE user_id = $1 
           ORDER BY created_at DESC 
           LIMIT 1
         )`,
        [userId]
      );
    }

    res.json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/customer/addresses/:id/set-default
 * @desc    Set an address as default
 * @access  Private
 */
router.put('/:id/set-default', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    // Check if address exists and belongs to user
    const checkResult = await query(
      'SELECT id FROM user_addresses WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Set as default (trigger will handle removing default from others)
    const result = await query(
      `UPDATE user_addresses 
       SET is_default = TRUE 
       WHERE id = $1 AND user_id = $2
       RETURNING *`,
      [id, userId]
    );

    res.json({
      success: true,
      message: 'Default address updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
