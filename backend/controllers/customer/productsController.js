import prisma from '../../lib/config/prisma.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SORTABLE_FIELDS = new Set(['created_at', 'price', 'name_en', 'rating']);

const slugify = (text) => String(text || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const productRelations = {
  categories: {
    select: {
      id: true,
      name_en: true,
      name_so: true,
      name_ar: true,
    },
  },
  subcategories: {
    select: {
      id: true,
      name_en: true,
      name_so: true,
      name_ar: true,
    },
  },
  brands: {
    select: { name: true },
  },
  product_images: {
    select: { image_url: true, display_order: true },
    orderBy: { display_order: 'asc' },
  },
  flash_sale_products: {
    select: {
      sale_price: true,
      original_price: true,
      discount_percentage: true,
      flash_sales: {
        select: {
          status: true,
          start_time: true,
          end_time: true,
          created_at: true,
        },
      },
    },
  },
};

const productListSelect = {
  id: true,
  slug: true,
  name_en: true,
  name_so: true,
  name_ar: true,
  description_en: true,
  description_so: true,
  description_ar: true,
  price: true,
  discount_price: true,
  rating: true,
  review_count: true,
  in_stock: true,
  stock_quantity: true,
  sku: true,
  tags: true,
  is_featured: true,
  is_halal: true,
  created_at: true,
  ...productRelations,
};

const getActiveFlashSaleEntry = (product, now = new Date()) => product.flash_sale_products?.find((entry) => {
  const sale = entry.flash_sales;
  if (!sale) return false;
  return sale.status === 'active'
    && sale.start_time <= now
    && sale.end_time >= now;
}) || null;

const mapProduct = (product) => {
  if (!product) return product;

  const now = new Date();
  const activeFlashSale = getActiveFlashSaleEntry(product, now);
  const images = (product.product_images || [])
    .sort((a, b) => (a.display_order || 0) - (b.display_order || 0))
    .map((image) => image.image_url);

  return {
    id: product.id,
    slug: product.slug || slugify(product.name_en),
    name_en: product.name_en,
    name_so: product.name_so,
    name_ar: product.name_ar,
    description_en: product.description_en,
    description_so: product.description_so,
    description_ar: product.description_ar,
    price: product.price ? Number(product.price) : 0,
    discount_price: product.discount_price ? Number(product.discount_price) : null,
    rating: product.rating ? Number(product.rating) : 0,
    review_count: product.review_count ?? 0,
    in_stock: product.in_stock,
    stock_quantity: product.stock_quantity,
    sku: product.sku,
    tags: product.tags,
    is_featured: product.is_featured,
    is_halal: product.is_halal,
    created_at: product.created_at,
    category_id: product.categories?.id ?? null,
    category_name_en: product.categories?.name_en ?? null,
    category_name_so: product.categories?.name_so ?? null,
    category_name_ar: product.categories?.name_ar ?? null,
    subcategory_id: product.subcategories?.id ?? null,
    subcategory_name_en: product.subcategories?.name_en ?? null,
    subcategory_name_so: product.subcategories?.name_so ?? null,
    subcategory_name_ar: product.subcategories?.name_ar ?? null,
    brand: product.brands?.name ?? null,
    images,
    flash_sale_price: activeFlashSale ? Number(activeFlashSale.sale_price) : null,
    flash_original_price: activeFlashSale ? Number(activeFlashSale.original_price) : null,
    discount_percentage: activeFlashSale?.discount_percentage ?? null,
    flash_start_time: activeFlashSale?.flash_sales?.start_time ?? null,
    flash_end_time: activeFlashSale?.flash_sales?.end_time ?? null,
    is_flash_sale: Boolean(activeFlashSale),
  };
};

const buildProductWhere = (query) => {
  const { search, category, subcategory, minPrice, maxPrice } = query;
  const and = [
    { deleted_at: null },
    { status: 'active' },
  ];

  if (search) {
    and.push({
      OR: [
        { name_en: { contains: search, mode: 'insensitive' } },
        { name_so: { contains: search, mode: 'insensitive' } },
        { name_ar: { contains: search, mode: 'insensitive' } },
        { description_en: { contains: search, mode: 'insensitive' } },
      ],
    });
  }

  if (category) {
    and.push({
      OR: [
        { category_id: category },
        { categories: { name_en: { contains: category, mode: 'insensitive' } } },
      ],
    });
  }

  if (subcategory) {
    and.push({ subcategory_id: subcategory });
  }

  if (minPrice) {
    and.push({ price: { gte: parseFloat(minPrice) } });
  }

  if (maxPrice) {
    and.push({ price: { lte: parseFloat(maxPrice) } });
  }

  return { AND: and };
};

const resolveOrderBy = (sortBy = 'created_at', sortOrder = 'DESC') => {
  const field = SORTABLE_FIELDS.has(sortBy) ? sortBy : 'created_at';
  return { [field]: sortOrder.toLowerCase() === 'asc' ? 'asc' : 'desc' };
};

const findProductRecord = async (identifier) => {
  const baseWhere = {
    deleted_at: null,
    status: 'active',
  };

  if (UUID_RE.test(identifier)) {
    const byId = await prisma.products.findFirst({
      where: { ...baseWhere, id: identifier },
      select: productListSelect,
    });
    if (byId) return byId;
  }

  return prisma.products.findFirst({
    where: {
      ...baseWhere,
      OR: [
        { slug: identifier },
        { name_en: { equals: identifier.replace(/-/g, ' '), mode: 'insensitive' } },
      ],
    },
    select: productListSelect,
  });
};

export const getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 500);
    const skip = (pageNum - 1) * limitNum;
    const where = buildProductWhere(req.query);

    const [records, total] = await Promise.all([
      prisma.products.findMany({
        where,
        select: productListSelect,
        orderBy: resolveOrderBy(sortBy, sortOrder),
        skip,
        take: limitNum,
      }),
      prisma.products.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    return res.json({
      success: true,
      data: {
        products: records.map(mapProduct),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages,
          hasMore: pageNum < totalPages,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const limitNum = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);

    const records = await prisma.products.findMany({
      where: {
        deleted_at: null,
        status: 'active',
        in_stock: true,
        is_featured: true,
      },
      select: productListSelect,
      orderBy: { created_at: 'desc' },
      take: limitNum,
    });

    return res.json({
      success: true,
      data: {
        products: records.map(mapProduct),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getFlashSaleProducts = async (req, res, next) => {
  try {
    const limitNum = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const now = new Date();

    const records = await prisma.products.findMany({
      where: {
        deleted_at: null,
        status: 'active',
        in_stock: true,
        flash_sale_products: {
          some: {
            flash_sales: {
              status: 'active',
              start_time: { lte: now },
              end_time: { gte: now },
            },
          },
        },
      },
      select: productListSelect,
      orderBy: { created_at: 'desc' },
      take: limitNum,
    });

    return res.json({
      success: true,
      data: {
        products: records.map(mapProduct),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await findProductRecord(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    return res.json({
      success: true,
      data: {
        product: mapProduct(product),
      },
    });
  } catch (error) {
    return next(error);
  }
};
