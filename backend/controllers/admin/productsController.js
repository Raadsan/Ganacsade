import prisma from '../../lib/config/prisma.js';

export const getProducts = async (req, res, next) => {
  try {
    const { search, category, status, page = 1, limit = 50 } = req.query;
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const where = {
      deleted_at: null,
      ...(category ? { category_id: category } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name_en: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where,
        select: {
          id: true,
          name_en: true,
          name_so: true,
          name_ar: true,
          description_en: true,
          sku: true,
          price: true,
          stock_quantity: true,
          low_stock_threshold: true,
          status: true,
          is_featured: true,
          rating: true,
          review_count: true,
          created_at: true,
          categories: { select: { name_en: true } },
          brands: { select: { name: true } },
          product_images: {
            where: { is_primary: true },
            select: { image_url: true },
            take: 1,
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.products.count({ where }),
    ]);

    res.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name_en: p.name_en,
        name_so: p.name_so,
        name_ar: p.name_ar,
        description_en: p.description_en,
        sku: p.sku,
        price: p.price,
        stock_quantity: p.stock_quantity,
        low_stock_threshold: p.low_stock_threshold,
        status: p.status,
        is_featured: p.is_featured,
        rating: p.rating,
        review_count: p.review_count,
        created_at: p.created_at,
        category_name: p.categories?.name_en || null,
        brand_name: p.brands?.name || null,
        primary_image: p.product_images[0]?.image_url || null,
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await prisma.products.findFirst({
      where: { id, deleted_at: null },
      include: {
        categories: { select: { name_en: true } },
        brands: { select: { name: true } },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const [images, variants] = await Promise.all([
      prisma.product_images.findMany({
        where: { product_id: id },
        orderBy: { display_order: 'asc' },
      }),
      prisma.product_variants.findMany({ where: { product_id: id } }),
    ]);

    res.json({
      success: true,
      data: {
        ...product,
        category_name: product.categories?.name_en || null,
        brand_name: product.brands?.name || null,
        images,
        variants,
        categories: undefined,
        brands: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      categoryId, subcategoryId, brandId,
      sku, price, compareAtPrice,
      stockQuantity, lowStockThreshold,
      status, isFeatured,
    } = req.body;

    if (!nameEn || !sku || !price || stockQuantity === undefined || stockQuantity === null || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: nameEn, sku, price, stockQuantity, categoryId',
        received: { nameEn, sku, price, stockQuantity, categoryId },
      });
    }

    const categoryCheck = await prisma.categories.findUnique({
      where: { id: categoryId },
      select: { id: true },
    });
    if (!categoryCheck) {
      return res.status(400).json({
        success: false,
        message: `Invalid categoryId: ${categoryId} - category does not exist. Please select a valid category from the dropdown.`,
      });
    }

    const created = await prisma.products.create({
      data: {
        name_en: nameEn || '',
        name_so: nameSo || nameEn,
        name_ar: nameAr || nameEn,
        description_en: descriptionEn || '',
        description_so: descriptionSo || descriptionEn || '',
        description_ar: descriptionAr || descriptionEn || '',
        category_id: categoryId || null,
        subcategory_id: subcategoryId || null,
        brand_id: brandId || null,
        sku,
        price,
        discount_price: compareAtPrice || null,
        stock_quantity: stockQuantity,
        low_stock_threshold: lowStockThreshold || 10,
        status: status || 'draft',
        is_featured: isFeatured || false,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: created,
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: `SKU "${req.body.sku}" already exists. Please use a different SKU.`,
        error: 'DUPLICATE_SKU',
      });
    }
    next(error);
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      categoryId, subcategoryId, sku,
      price, compareAtPrice, stockQuantity,
      lowStockThreshold, status, isFeatured,
    } = req.body;

    const existing = await prisma.products.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const result = await prisma.products.update({
      where: { id },
      data: {
        ...(nameEn !== undefined ? { name_en: nameEn } : {}),
        ...(nameSo !== undefined ? { name_so: nameSo } : {}),
        ...(nameAr !== undefined ? { name_ar: nameAr } : {}),
        ...(descriptionEn !== undefined ? { description_en: descriptionEn } : {}),
        ...(descriptionSo !== undefined ? { description_so: descriptionSo } : {}),
        ...(descriptionAr !== undefined ? { description_ar: descriptionAr } : {}),
        ...(categoryId !== undefined ? { category_id: categoryId } : {}),
        ...(subcategoryId !== undefined ? { subcategory_id: subcategoryId } : {}),
        ...(sku !== undefined ? { sku } : {}),
        ...(price !== undefined ? { price } : {}),
        ...(compareAtPrice !== undefined ? { discount_price: compareAtPrice } : {}),
        ...(stockQuantity !== undefined ? { stock_quantity: stockQuantity } : {}),
        ...(lowStockThreshold !== undefined ? { low_stock_threshold: lowStockThreshold } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(isFeatured !== undefined ? { is_featured: isFeatured } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.products.updateMany({
      where: { id, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    if (result.count === 0) {
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
};

export const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    const imageUrls = req.files.map((file) => file.path);

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
};

export const getProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.product_images.findMany({
      where: { product_id: id },
      select: {
        id: true,
        image_url: true,
        display_order: true,
        is_primary: true,
        alt_text: true,
        created_at: true,
      },
      orderBy: { display_order: 'asc' },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const addProductImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No images uploaded',
      });
    }

    const productCheck = await prisma.products.findFirst({
      where: { id, deleted_at: null },
      select: { id: true },
    });
    if (!productCheck) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const maxOrderResult = await prisma.product_images.aggregate({
      where: { product_id: id },
      _max: { display_order: true },
    });
    let displayOrder = maxOrderResult._max.display_order || 0;

    const insertPromises = req.files.map((file, index) => {
      displayOrder++;
      const imageUrl = file.path;
      const isPrimary = index === 0 && displayOrder === 1;

      return prisma.product_images.create({
        data: {
          product_id: id,
          image_url: imageUrl,
          display_order: displayOrder,
          is_primary: isPrimary,
          alt_text: `Product image ${displayOrder}`,
        },
      });
    });

    await Promise.all(insertPromises);

    res.status(201).json({
      success: true,
      message: 'Images added successfully',
    });
  } catch (error) {
    next(error);
  }
};
