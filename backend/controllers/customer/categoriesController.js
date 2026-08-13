import prisma from '../../lib/config/prisma.js';

export const getCategories = async (_req, res, next) => {
  try {
    const categories = await prisma.categories.findMany({
      where: { is_active: true },
      select: {
        id: true,
        name_en: true,
        name_so: true,
        name_ar: true,
        description_en: true,
        description_so: true,
        description_ar: true,
        icon_path: true,
        color: true,
        image_url: true,
        display_order: true,
        _count: { select: { subcategories: { where: { is_active: true } } } },
      },
      orderBy: [{ display_order: 'asc' }, { name_en: 'asc' }],
    });

    res.json({
      success: true,
      data: {
        categories: categories.map((c) => ({
          ...c,
          product_count: c._count.subcategories,
          _count: undefined,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await prisma.categories.findFirst({
      where: { id, is_active: true },
      select: {
        id: true,
        name_en: true,
        name_so: true,
        name_ar: true,
        description_en: true,
        description_so: true,
        description_ar: true,
        icon_path: true,
        color: true,
        image_url: true,
        display_order: true,
        subcategories: {
          where: { is_active: true },
          select: {
            id: true,
            name_en: true,
            name_so: true,
            name_ar: true,
            description_en: true,
            description_so: true,
            description_ar: true,
            image_url: true,
            display_order: true,
            _count: {
              select: {
                products: {
                  where: { deleted_at: null, status: 'active', in_stock: true },
                },
              },
            },
          },
          orderBy: [{ display_order: 'asc' }, { name_en: 'asc' }],
        },
      },
    });

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    res.json({
      success: true,
      data: {
        category: {
          ...category,
          subcategories: category.subcategories.map((sc) => ({
            ...sc,
            product_count: sc._count.products,
            _count: undefined,
          })),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
