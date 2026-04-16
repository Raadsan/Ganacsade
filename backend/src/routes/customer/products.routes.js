const express = require('express');
const { query } = require('../../config/database');

const router = express.Router();

/**
 * @route   GET /api/customer/products
 * @desc    Get all active products for customers
 * @access  Public
 */
router.get('/', async (req, res, next) => {
  try {
    const { 
      search, 
      category, 
      subcategory,
      minPrice,
      maxPrice,
      page = 1, 
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = req.query;
    
    let whereConditions = [
      'p.deleted_at IS NULL',
      'p.status = \'active\''
    ];
    let params = [];
    let paramCount = 1;

    // Search filter
    if (search) {
      whereConditions.push(`(p.name_en ILIKE $${paramCount} OR p.name_so ILIKE $${paramCount} OR p.name_ar ILIKE $${paramCount} OR p.description_en ILIKE $${paramCount})`);
      params.push(`%${search}%`);
      paramCount++;
    }

    // Category filter (by ID or name)
    if (category) {
      whereConditions.push(`(p.category_id = $${paramCount} OR c.name_en ILIKE $${paramCount + 1})`);
      params.push(category);
      params.push(`%${category}%`);
      paramCount += 2;
    }

    // Subcategory filter
    if (subcategory) {
      whereConditions.push(`p.subcategory_id = $${paramCount}`);
      params.push(subcategory);
      paramCount++;
    }

    // Price range filter
    if (minPrice) {
      whereConditions.push(`p.price >= $${paramCount}`);
      params.push(parseFloat(minPrice));
      paramCount++;
    }

    if (maxPrice) {
      whereConditions.push(`p.price <= $${paramCount}`);
      params.push(parseFloat(maxPrice));
      paramCount++;
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    // Calculate offset
    const offset = (page - 1) * limit;

    // Debug logging
    console.log('🔍 Search query:', search);
    console.log('🔍 WHERE conditions:', whereConditions);
    console.log('🔍 Params:', params);

    // Get products with images
    const result = await query(
      `SELECT 
        p.id,
        p.name_en,
        p.name_so,
        p.name_ar,
        p.description_en,
        p.description_so,
        p.description_ar,
        p.price,
        p.discount_price,
        p.rating,
        p.review_count,
        p.in_stock,
        p.stock_quantity,
        p.sku,
        p.tags,
        p.is_featured,
        p.is_halal,
        p.created_at,
        c.id as category_id,
        c.name_en as category_name_en,
        c.name_so as category_name_so,
        c.name_ar as category_name_ar,
        sc.id as subcategory_id,
        sc.name_en as subcategory_name_en,
        sc.name_so as subcategory_name_so,
        sc.name_ar as subcategory_name_ar,
        b.name as brand,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order)
           FROM product_images 
           WHERE product_id = p.id),
          '[]'::json
        ) as images,
        fsp.sale_price as flash_sale_price,
        fsp.original_price as flash_original_price,
        CASE 
          WHEN fs.status = 'active' 
            AND fs.start_time <= CURRENT_TIMESTAMP 
            AND fs.end_time >= CURRENT_TIMESTAMP 
          THEN true 
          ELSE false 
        END as is_flash_sale
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN flash_sale_products fsp ON p.id = fsp.product_id
      LEFT JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      ${whereClause}
      ORDER BY p.${sortBy} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      [...params, limit, offset]
    );

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) as total
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ${whereClause}`,
      params
    );

    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    console.log('🔍 Found products:', result.rows.length);
    console.log('🔍 Total count:', total);

    res.json({
      success: true,
      data: {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasMore: page < totalPages
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/products/featured
 * @desc    Get featured products
 * @access  Public
 */
router.get('/featured', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
        p.id,
        p.name_en,
        p.name_so,
        p.name_ar,
        p.description_en,
        p.description_so,
        p.description_ar,
        p.price,
        p.discount_price,
        p.rating,
        p.review_count,
        p.in_stock,
        p.stock_quantity,
        p.sku,
        p.tags,
        p.is_featured,
        p.is_halal,
        p.created_at,
        c.id as category_id,
        c.name_en as category_name_en,
        b.name as brand,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order)
           FROM product_images 
           WHERE product_id = p.id),
          '[]'::json
        ) as images,
        fsp.sale_price as flash_sale_price,
        fsp.original_price as flash_original_price,
        CASE 
          WHEN fs.status = 'active' 
            AND fs.start_time <= CURRENT_TIMESTAMP 
            AND fs.end_time >= CURRENT_TIMESTAMP 
          THEN true 
          ELSE false 
        END as is_flash_sale
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN flash_sale_products fsp ON p.id = fsp.product_id
      LEFT JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      WHERE p.deleted_at IS NULL
        AND p.status = 'active'
        AND p.in_stock = true
        AND p.is_featured = true
      ORDER BY p.created_at DESC
      LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        products: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/products/flash-sales
 * @desc    Get flash sale products
 * @access  Public
 */
router.get('/flash-sales', async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const result = await query(
      `SELECT 
        p.id,
        p.name_en,
        p.name_so,
        p.name_ar,
        p.description_en,
        p.description_so,
        p.description_ar,
        p.price,
        p.discount_price,
        p.rating,
        p.review_count,
        p.in_stock,
        p.stock_quantity,
        p.sku,
        p.tags,
        p.is_featured,
        p.is_halal,
        p.created_at,
        c.id as category_id,
        c.name_en as category_name_en,
        b.name as brand,
        fsp.discount_percentage,
        fsp.sale_price as flash_sale_price,
        fsp.original_price as flash_original_price,
        fs.start_time as flash_start_time,
        fs.end_time as flash_end_time,
        COALESCE(
          (SELECT json_agg(image_url ORDER BY display_order)
           FROM product_images 
           WHERE product_id = p.id),
          '[]'::json
        ) as images
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      INNER JOIN flash_sale_products fsp ON p.id = fsp.product_id
      INNER JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      WHERE p.deleted_at IS NULL
        AND p.status = 'active'
        AND p.in_stock = true
        AND fs.status = 'active'
        AND fs.start_time <= CURRENT_TIMESTAMP
        AND fs.end_time >= CURRENT_TIMESTAMP
      ORDER BY fs.created_at DESC
      LIMIT $1`,
      [limit]
    );

    res.json({
      success: true,
      data: {
        products: result.rows
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @route   GET /api/customer/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT 
        p.*,
        c.id as category_id,
        c.name_en as category_name_en,
        c.name_so as category_name_so,
        c.name_ar as category_name_ar,
        sc.id as subcategory_id,
        sc.name_en as subcategory_name_en,
        sc.name_so as subcategory_name_so,
        sc.name_ar as subcategory_name_ar,
        fsp.discount_percentage,
        fsp.sale_price as flash_sale_price,
        fsp.original_price as flash_original_price,
        fs.start_time as flash_start_time,
        fs.end_time as flash_end_time,
        CASE 
          WHEN fs.status = 'active' 
            AND fs.start_time <= CURRENT_TIMESTAMP 
            AND fs.end_time >= CURRENT_TIMESTAMP 
          THEN true 
          ELSE false 
        END as is_flash_sale
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN subcategories sc ON p.subcategory_id = sc.id
      LEFT JOIN flash_sale_products fsp ON p.id = fsp.product_id
      LEFT JOIN flash_sales fs ON fsp.flash_sale_id = fs.id
      WHERE p.id = $1
        AND p.deleted_at IS NULL
        AND p.status = 'active'`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: {
        product: result.rows[0]
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
