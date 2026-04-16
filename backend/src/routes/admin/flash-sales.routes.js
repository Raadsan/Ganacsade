const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');

/**
 * @route   GET /api/admin/flash-sales
 * @desc    Get all flash sales
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const result = await query(`
      SELECT 
        fs.id, fs.title, fs.description,
        fs.start_time, fs.end_time,
        fs.status, fs.is_active,
        fs.created_at, fs.updated_at,
        COUNT(fsp.id) as product_count
      FROM flash_sales fs
      LEFT JOIN flash_sale_products fsp ON fs.id = fsp.flash_sale_id
      GROUP BY fs.id
      ORDER BY fs.start_time DESC
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
 * @route   GET /api/admin/flash-sales/:id
 * @desc    Get single flash sale with products
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Get flash sale details
    const saleResult = await query(
      `SELECT * FROM flash_sales WHERE id = $1`,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    // Get products in this flash sale
    const productsResult = await query(
      `SELECT 
        fsp.*,
        p.name_en as current_product_name,
        p.price as current_product_price
      FROM flash_sale_products fsp
      LEFT JOIN products p ON fsp.product_id = p.id
      WHERE fsp.flash_sale_id = $1
      ORDER BY fsp.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...saleResult.rows[0],
        products: productsResult.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/flash-sales
 * @desc    Create new flash sale
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      isActive = true,
    } = req.body;

    // Validation
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, start time, and end time are required',
      });
    }

    // Check if end time is after start time
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    // Determine status based on times
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    let status = 'scheduled';
    if (now >= start && now <= end) {
      status = 'active';
    } else if (now > end) {
      status = 'ended';
    }

    const result = await query(
      `INSERT INTO flash_sales (title, description, start_time, end_time, status, is_active)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [title, description || null, startTime, endTime, status, isActive]
    );

    res.status(201).json({
      success: true,
      message: 'Flash sale created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   PUT /api/admin/flash-sales/:id
 * @desc    Update flash sale
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      status,
      isActive,
    } = req.body;

    // Check if end time is after start time
    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    const result = await query(
      `UPDATE flash_sales
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           start_time = COALESCE($3, start_time),
           end_time = COALESCE($4, end_time),
           status = COALESCE($5, status),
           is_active = COALESCE($6, is_active),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [title, description, startTime, endTime, status, isActive, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    res.json({
      success: true,
      message: 'Flash sale updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/flash-sales/:id
 * @desc    Delete flash sale
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM flash_sales WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    res.json({
      success: true,
      message: 'Flash sale deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/flash-sales/:id/products
 * @desc    Add product to flash sale
 * @access  Private/Admin
 */
router.post('/:id/products', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      productId,
      salePrice,
      stockLimit,
    } = req.body;

    // Validation
    if (!productId || !salePrice || !stockLimit) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, sale price, and stock limit are required',
      });
    }

    // Get product details
    const productResult = await query(
      `SELECT id, name_en, price, 
              (SELECT image_url FROM product_images WHERE product_id = $1 AND is_primary = true LIMIT 1) as image_url
       FROM products WHERE id = $1`,
      [productId]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const product = productResult.rows[0];

    // Check if sale price is less than original price
    if (parseFloat(salePrice) >= parseFloat(product.price)) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be less than original price',
      });
    }

    // Add product to flash sale
    const result = await query(
      `INSERT INTO flash_sale_products 
       (flash_sale_id, product_id, product_name, product_image_url, original_price, sale_price, stock_limit)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [id, productId, product.name_en, product.image_url, product.price, salePrice, stockLimit]
    );

    res.status(201).json({
      success: true,
      message: 'Product added to flash sale',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({
        success: false,
        message: 'Product already exists in this flash sale',
      });
    }
    next(error);
  }
});

/**
 * @route   PUT /api/admin/flash-sales/:id/products/:productId
 * @desc    Update product in flash sale
 * @access  Private/Admin
 */
router.put('/:id/products/:productId', async (req, res, next) => {
  try {
    const { id, productId } = req.params;
    const { salePrice, stockLimit, soldCount } = req.body;

    // Validation
    if (salePrice !== undefined && salePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be greater than 0',
      });
    }

    if (stockLimit !== undefined && stockLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock limit must be greater than 0',
      });
    }

    // Get current product to validate sale price against original price
    const currentProduct = await query(
      'SELECT original_price FROM flash_sale_products WHERE flash_sale_id = $1 AND id = $2',
      [id, productId]
    );

    if (currentProduct.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in flash sale',
      });
    }

    // Check if sale price is less than original price
    if (salePrice !== undefined && parseFloat(salePrice) >= parseFloat(currentProduct.rows[0].original_price)) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be less than original price',
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (salePrice !== undefined) {
      updates.push(`sale_price = $${paramCount}`);
      values.push(salePrice);
      paramCount++;
    }

    if (stockLimit !== undefined) {
      updates.push(`stock_limit = $${paramCount}`);
      values.push(stockLimit);
      paramCount++;
    }

    if (soldCount !== undefined) {
      updates.push(`sold_count = $${paramCount}`);
      values.push(soldCount);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    // Add WHERE clause parameters
    values.push(id, productId);

    const result = await query(
      `UPDATE flash_sale_products
       SET ${updates.join(', ')}
       WHERE flash_sale_id = $${paramCount} AND id = $${paramCount + 1}
       RETURNING *`,
      values
    );

    res.json({
      success: true,
      message: 'Flash sale product updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/flash-sales/:id/products/:productId
 * @desc    Remove product from flash sale
 * @access  Private/Admin
 */
router.delete('/:id/products/:productId', async (req, res, next) => {
  try {
    const { id, productId } = req.params;

    const result = await query(
      'DELETE FROM flash_sale_products WHERE flash_sale_id = $1 AND id = $2 RETURNING id',
      [id, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in flash sale',
      });
    }

    res.json({
      success: true,
      message: 'Product removed from flash sale',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
