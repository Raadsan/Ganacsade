const express = require('express');
const { query } = require('../../config/database');
const upload = require('../../middleware/upload');
const path = require('path');

const router = express.Router();

/**
 * @route   GET /api/admin/products
 * @desc    Get all products with filters
 * @access  Private/Admin
 */
router.get('/', async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    
    let whereConditions = ['p.deleted_at IS NULL'];
    let params = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      whereConditions.push(`(p.name_en ILIKE $${paramCount} OR p.sku ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Category filter
    if (category) {
      whereConditions.push(`p.category_id = $${paramCount}`);
      params.push(category);
      paramCount++;
    }

    // Status filter
    if (status) {
      whereConditions.push(`p.status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    // Get products with category info
    const result = await query(
      `SELECT 
        p.id,
        p.name_en,
        p.name_so,
        p.name_ar,
        p.description_en,
        p.sku,
        p.price,
        p.stock_quantity,
        p.low_stock_threshold,
        p.status,
        p.is_featured,
        p.rating,
        p.review_count,
        p.created_at,
        c.name_en as category_name,
        b.name as brand_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = true LIMIT 1) as primary_image
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total FROM products p ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: result.rows,
      meta: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult.rows[0].total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/products/:id
 * @desc    Get product details
 * @access  Private/Admin
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT p.*, c.name_en as category_name, b.name as brand_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       WHERE p.id = $1 AND p.deleted_at IS NULL`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get product images
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY display_order',
      [id]
    );

    // Get product variants
    const variants = await query(
      'SELECT * FROM product_variants WHERE product_id = $1',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...result.rows[0],
        images: images.rows,
        variants: variants.rows,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/products
 * @desc    Create new product
 * @access  Private/Admin
 */
router.post('/', async (req, res, next) => {
  try {
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      categoryId, subcategoryId, brandId,
      sku, price, compareAtPrice,
      stockQuantity, lowStockThreshold,
      status, isFeatured
    } = req.body;

    // Validate required fields
    if (!nameEn || !sku || !price || stockQuantity === undefined || stockQuantity === null || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: nameEn, sku, price, stockQuantity, categoryId',
        received: { nameEn, sku, price, stockQuantity, categoryId }
      });
    }

    // Validate categoryId exists
    const categoryCheck = await query('SELECT id FROM categories WHERE id = $1', [categoryId]);
    if (categoryCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: `Invalid categoryId: ${categoryId} - category does not exist. Please select a valid category from the dropdown.`,
      });
    }

    const result = await query(
      `INSERT INTO products (
        name_en, name_so, name_ar,
        description_en, description_so, description_ar,
        category_id, subcategory_id, brand_id,
        sku, price, discount_price,
        stock_quantity, low_stock_threshold,
        status, is_featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        nameEn || '', 
        nameSo || nameEn, 
        nameAr || nameEn,
        descriptionEn || '', 
        descriptionSo || descriptionEn || '', 
        descriptionAr || descriptionEn || '',
        categoryId || null, 
        subcategoryId || null, 
        brandId || null,
        sku, 
        price, 
        compareAtPrice || null,
        stockQuantity, 
        lowStockThreshold || 10,
        status || 'draft', 
        isFeatured || false
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error creating product:', error);
    console.error('Request body:', req.body);
    
    // Handle duplicate SKU error
    if (error.code === '23505' && error.constraint === 'products_sku_key') {
      return res.status(409).json({
        success: false,
        message: `SKU "${req.body.sku}" already exists. Please use a different SKU.`,
        error: 'DUPLICATE_SKU'
      });
    }
    
    next(error);
  }
});

/**
 * @route   PUT /api/admin/products/:id
 * @desc    Update product
 * @access  Private/Admin
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      categoryId, subcategoryId, sku,
      price, compareAtPrice, stockQuantity, 
      lowStockThreshold, status, isFeatured
    } = req.body;

    const result = await query(
      `UPDATE products
       SET name_en = COALESCE($1, name_en),
           name_so = COALESCE($2, name_so),
           name_ar = COALESCE($3, name_ar),
           description_en = COALESCE($4, description_en),
           description_so = COALESCE($5, description_so),
           description_ar = COALESCE($6, description_ar),
           category_id = COALESCE($7, category_id),
           subcategory_id = COALESCE($8, subcategory_id),
           sku = COALESCE($9, sku),
           price = COALESCE($10, price),
           discount_price = COALESCE($11, discount_price),
           stock_quantity = COALESCE($12, stock_quantity),
           low_stock_threshold = COALESCE($13, low_stock_threshold),
           status = COALESCE($14, status),
           is_featured = COALESCE($15, is_featured),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $16 AND deleted_at IS NULL
       RETURNING *`,
      [nameEn, nameSo, nameAr, descriptionEn, descriptionSo, descriptionAr, 
       categoryId, subcategoryId, sku, price, compareAtPrice, stockQuantity, 
       lowStockThreshold, status, isFeatured, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   DELETE /api/admin/products/:id
 * @desc    Soft delete product
 * @access  Private/Admin
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'UPDATE products SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/products/upload-images
 * @desc    Upload product images
 * @access  Private/Admin
 */
router.post('/upload-images', upload.array('images', 5), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Generate URLs for uploaded images
    const imageUrls = req.files.map(file => {
      return `/uploads/products/${file.filename}`;
    });

    res.status(200).json({
      success: true,
      message: 'Images uploaded successfully',
      data: {
        images: imageUrls,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/admin/products/:id/images
 * @desc    Get all images for a product
 * @access  Private/Admin
 */
router.get('/:id/images', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, image_url, display_order, is_primary, alt_text, created_at
       FROM product_images
       WHERE product_id = $1
       ORDER BY display_order ASC`,
      [id]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   POST /api/admin/products/:id/images
 * @desc    Add images to existing product
 * @access  Private/Admin
 */
router.post('/:id/images', upload.array('images', 5), async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    // Check if product exists
    const productCheck = await query('SELECT id FROM products WHERE id = $1 AND deleted_at IS NULL', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    // Get current max display order
    const maxOrderResult = await query(
      'SELECT COALESCE(MAX(display_order), 0) as max_order FROM product_images WHERE product_id = $1',
      [id]
    );
    let displayOrder = maxOrderResult.rows[0].max_order;

    // Insert images into database
    const insertPromises = req.files.map(async (file, index) => {
      displayOrder++;
      const imageUrl = `/uploads/products/${file.filename}`;
      const isPrimary = index === 0 && displayOrder === 1; // First image is primary if it's the first ever

      return query(
        `INSERT INTO product_images (product_id, image_url, display_order, is_primary, alt_text)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [id, imageUrl, displayOrder, isPrimary, `Product image ${displayOrder}`]
      );
    });

    await Promise.all(insertPromises);

    res.status(201).json({
      success: true,
      message: 'Images added successfully',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
