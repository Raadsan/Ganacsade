import prisma from '../../lib/config/prisma.js';

export const checkWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: { user_id: userId, product_id: productId, deleted_at: null },
    });

    res.json({ success: true, inWishlist: !!item });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const items = await prisma.wishlist.findMany({
      where: { user_id: userId, deleted_at: null, products: { deleted_at: null, status: 'active' } },
      select: {
        id: true,
        created_at: true,
        products: {
          select: {
            id: true,
            name_en: true,
            name_so: true,
            name_ar: true,
            description_en: true,
            price: true,
            discount_price: true,
            discount_percentage: true,
            in_stock: true,
            stock_quantity: true,
            image_url: true,
            rating: true,
            reviews_count: true,
            categories: { select: { name_en: true, name_so: true, name_ar: true } },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    res.json({
      success: true,
      data: items.map((w) => ({
        wishlist_id: w.id,
        added_at: w.created_at,
        ...w.products,
        category_name_en: w.products.categories?.name_en,
        category_name_so: w.products.categories?.name_so,
        category_name_ar: w.products.categories?.name_ar,
        categories: undefined,
      })),
      count: items.length,
    });
  } catch (error) {
    next(error);
  }
};

export const addWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const product = await prisma.products.findFirst({
      where: { id: product_id, deleted_at: null, status: 'active' },
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const existing = await prisma.wishlist.findFirst({
      where: { user_id: userId, product_id, deleted_at: null },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Product already in wishlist' });
    }

    const item = await prisma.wishlist.create({
      data: { user_id: userId, product_id },
      select: { id: true, created_at: true },
    });

    res.status(201).json({ success: true, message: 'Product added to wishlist', data: item });
  } catch (error) {
    next(error);
  }
};

export const removeWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    const item = await prisma.wishlist.findFirst({
      where: { user_id: userId, product_id: productId, deleted_at: null },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: 'Product not found in wishlist' });
    }

    await prisma.wishlist.update({
      where: { id: item.id },
      data: { deleted_at: new Date() },
    });

    res.json({ success: true, message: 'Product removed from wishlist' });
  } catch (error) {
    next(error);
  }
};

export const clearWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;

    await prisma.wishlist.updateMany({
      where: { user_id: userId, deleted_at: null },
      data: { deleted_at: new Date() },
    });

    res.json({ success: true, message: 'Wishlist cleared' });
  } catch (error) {
    next(error);
  }
};
