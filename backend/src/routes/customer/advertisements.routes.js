const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

/**
 * @route   GET /api/customer/advertisements
 * @desc    Get active advertisements for customers (filtered by placement)
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { placement } = req.query;
    
    let queryText = `
      SELECT 
        id,
        title,
        description,
        image_url,
        target_url,
        placement,
        display_order
      FROM advertisements
      WHERE is_active = true
        AND (start_date IS NULL OR start_date <= CURRENT_TIMESTAMP)
        AND (end_date IS NULL OR end_date >= CURRENT_TIMESTAMP)
    `;
    const params = [];
    
    if (placement) {
      params.push(placement);
      queryText += ` AND placement = $${params.length}`;
    }
    
    queryText += ` ORDER BY display_order ASC, created_at DESC`;
    
    const result = await query(queryText, params);

    // Transform snake_case to camelCase for frontend
    const advertisements = result.rows.map(ad => ({
      id: ad.id,
      title: ad.title,
      description: ad.description,
      imageUrl: ad.image_url,
      targetUrl: ad.target_url,
      placement: ad.placement,
      displayOrder: ad.display_order,
    }));

    res.json({
      success: true,
      data: {
        advertisements,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/customer/advertisements/:id/view
 * @desc    Increment view count for an advertisement
 * @access  Public
 */
router.post('/:id/view', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE advertisements SET view_count = view_count + 1 WHERE id = $1::uuid',
      [id]
    );

    res.json({
      success: true,
      message: 'View recorded',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/customer/advertisements/:id/click
 * @desc    Increment click count for an advertisement
 * @access  Public
 */
router.post('/:id/click', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE advertisements SET click_count = click_count + 1 WHERE id = $1::uuid',
      [id]
    );

    res.json({
      success: true,
      message: 'Click recorded',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
