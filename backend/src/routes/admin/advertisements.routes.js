const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../../uploads/advertisements');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ad-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

/**
 * @route   GET /api/admin/advertisements
 * @desc    Get all advertisements
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { placement } = req.query;
    
    let queryText = `
      SELECT * FROM advertisements
      WHERE 1=1
    `;
    const params = [];
    
    if (placement) {
      params.push(placement);
      queryText += ` AND placement = $${params.length}`;
    }
    
    queryText += ` ORDER BY display_order ASC, created_at DESC`;
    
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
 * @route   GET /api/admin/advertisements/:id
 * @desc    Get single advertisement
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'SELECT * FROM advertisements WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
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
 * @route   POST /api/admin/advertisements
 * @desc    Create new advertisement
 * @access  Private/Admin
 */
router.post('/', upload.single('image'), async (req, res, next) => {
  try {
    const {
      title,
      description,
      targetUrl,
      placement,
      displayOrder = 0,
      isActive = true,
      startDate,
      endDate,
    } = req.body;

    // Validation
    if (!title || !placement) {
      return res.status(400).json({
        success: false,
        message: 'Title and placement are required',
      });
    }

    // Get image URL from uploaded file or request body
    let imageUrl = req.body.imageUrl;
    if (req.file) {
      imageUrl = `/uploads/advertisements/${req.file.filename}`;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const result = await query(
      `INSERT INTO advertisements 
       (title, description, image_url, target_url, placement, display_order, is_active, start_date, end_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [title, description || null, imageUrl, targetUrl || null, placement, displayOrder, isActive, startDate || null, endDate || null]
    );

    res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/advertisements/:id
 * @desc    Update advertisement
 * @access  Private/Admin
 */
router.put('/:id', upload.single('image'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      targetUrl,
      placement,
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = req.body;

    // Get current advertisement
    const current = await query('SELECT * FROM advertisements WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
      });
    }

    // Handle image update
    let imageUrl = req.body.imageUrl || current.rows[0].image_url;
    if (req.file) {
      imageUrl = `/uploads/advertisements/${req.file.filename}`;
      
      // Delete old image if it exists and is different
      if (current.rows[0].image_url && current.rows[0].image_url !== imageUrl) {
        const oldImagePath = path.join(__dirname, '../../../', current.rows[0].image_url);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.error('Error deleting old image:', err);
        }
      }
    }

    const result = await query(
      `UPDATE advertisements
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           target_url = COALESCE($4, target_url),
           placement = COALESCE($5, placement),
           display_order = COALESCE($6, display_order),
           is_active = COALESCE($7, is_active),
           start_date = COALESCE($8, start_date),
           end_date = COALESCE($9, end_date),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [title, description, imageUrl, targetUrl, placement, displayOrder, isActive, startDate, endDate, id]
    );

    res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/advertisements/:id
 * @desc    Delete advertisement
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get advertisement to delete image
    const ad = await query('SELECT image_url FROM advertisements WHERE id = $1', [id]);
    
    const result = await query(
      'DELETE FROM advertisements WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
      });
    }

    // Delete image file
    if (ad.rows.length > 0 && ad.rows[0].image_url) {
      const imagePath = path.join(__dirname, '../../../', ad.rows[0].image_url);
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.error('Error deleting image:', err);
      }
    }

    res.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/advertisements/:id/increment-views
 * @desc    Increment view count
 * @access  Private/Admin
 */
router.post('/:id/increment-views', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE advertisements SET view_count = view_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'View count incremented',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/advertisements/:id/increment-clicks
 * @desc    Increment click count
 * @access  Private/Admin
 */
router.post('/:id/increment-clicks', async (req, res, next) => {
  try {
    const { id } = req.params;

    await query(
      'UPDATE advertisements SET click_count = click_count + 1 WHERE id = $1',
      [id]
    );

    res.json({
      success: true,
      message: 'Click count incremented',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
