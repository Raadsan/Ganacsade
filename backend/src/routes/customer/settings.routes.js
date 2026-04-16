const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

/**
 * @route   GET /api/customer/settings/public
 * @desc    Get public settings (shipping, tax rates)
 * @access  Public
 */
router.get('/public', async (req, res, next) => {
  try {
    // Only return public settings that customers need
    const result = await query(
      `SELECT key, value 
       FROM settings 
       WHERE key IN ('shipping_flat_rate', 'shipping_free_threshold', 'tax_rate', 'tax_enabled')
       AND is_public = true
       ORDER BY key`
    );

    // Convert to key-value object for easier consumption
    const settings = {};
    result.rows.forEach(row => {
      // Value is stored as text or JSONB, parse accordingly
      let value = row.value;
      
      // If it's a string representation of a number, parse it
      if (typeof value === 'string') {
        // Try to parse as number
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value.trim() !== '') {
          value = numValue;
        } else if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
      }
      
      settings[row.key] = value;
    });

    res.json({
      success: true,
      data: {
        settings
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
