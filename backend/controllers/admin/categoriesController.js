import prisma from '../../lib/config/prisma.js';

const categorySelect = {
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
        is_active: true,
        display_order: true,
        created_at: true,
        _count: {
          select: {
            products: { where: { deleted_at: null } },
            subcategories: true,
          },
        },
};

export const getCategories = async (_req, res, next) => {
  try {
    const result = await prisma.categories.findMany({
      where: { name_en: { not: '__Archived__' } },
      select: categorySelect,
      orderBy: [{ display_order: 'asc' }, { name_en: 'asc' }],
    });

    return res.json({
      success: true,
      data: result.map((c) => ({
        ...c,
        product_count: c._count.products,
        subcategory_count: c._count.subcategories,
        _count: undefined,
      })),
    });
  } catch (error) {
    return next(error);
  }
};

export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.categories.findUnique({
      where: { id },
      select: {
        ...categorySelect,
        subcategories: {
          orderBy: { display_order: 'asc' },
          select: {
            id: true,
            category_id: true,
            name_en: true,
            name_so: true,
            name_ar: true,
            description_en: true,
            description_so: true,
            description_ar: true,
            image_url: true,
            is_active: true,
            display_order: true,
            created_at: true,
            updated_at: true,
            _count: {
              select: {
                products: { where: { deleted_at: null } },
              },
            },
          },
        },
      },
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const { _count, subcategories, ...category } = result;

    res.json({
      success: true,
      data: {
        ...category,
        product_count: _count.products,
        subcategory_count: _count.subcategories,
        subcategories: subcategories.map((sc) => ({
          ...sc,
          product_count: sc._count.products,
          _count: undefined,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      iconPath, color, imageUrl, isActive = true, displayOrder = 0,
    } = req.body;

    const result = await prisma.categories.create({
      data: {
        name_en: nameEn,
        name_so: nameSo,
        name_ar: nameAr,
        description_en: descriptionEn,
        description_so: descriptionSo,
        description_ar: descriptionAr,
        icon_path: iconPath,
        color,
        image_url: imageUrl,
        is_active: isActive,
        display_order: displayOrder,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      nameEn, nameSo, nameAr,
      descriptionEn, descriptionSo, descriptionAr,
      iconPath, color, imageUrl, isActive, displayOrder,
    } = req.body;

    const existing = await prisma.categories.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const result = await prisma.categories.update({
      where: { id },
      data: {
        ...(nameEn !== undefined ? { name_en: nameEn } : {}),
        ...(nameSo !== undefined ? { name_so: nameSo } : {}),
        ...(nameAr !== undefined ? { name_ar: nameAr } : {}),
        ...(descriptionEn !== undefined ? { description_en: descriptionEn } : {}),
        ...(descriptionSo !== undefined ? { description_so: descriptionSo } : {}),
        ...(descriptionAr !== undefined ? { description_ar: descriptionAr } : {}),
        ...(iconPath !== undefined ? { icon_path: iconPath } : {}),
        ...(color !== undefined ? { color } : {}),
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
      },
    });

    res.json({
      success: true,
      message: 'Category updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

async function getOrCreateArchivedCategory() {
  const existing = await prisma.categories.findFirst({
    where: { name_en: '__Archived__' },
    select: { id: true },
  });
  if (existing) return existing.id;

  const created = await prisma.categories.create({
    data: {
      name_en: '__Archived__',
      name_so: '__Archived__',
      name_ar: '__Archived__',
      description_en: 'Internal category for deleted products linked to orders',
      is_active: false,
      display_order: 9999,
    },
    select: { id: true },
  });
  return created.id;
}

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.categories.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    // Never delete the internal archive bucket itself
    const categoryMeta = await prisma.categories.findUnique({
      where: { id },
      select: { name_en: true },
    });
    if (categoryMeta?.name_en === '__Archived__') {
      return res.status(400).json({
        success: false,
        message: 'This system category cannot be deleted',
      });
    }

    // Only active products / subcategories block deletion (ignore orders)
    const [activeProductCount, subcategoryCount] = await Promise.all([
      prisma.products.count({
        where: { category_id: id, deleted_at: null },
      }),
      prisma.subcategories.count({
        where: { category_id: id },
      }),
    ]);

    if (activeProductCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${activeProductCount} existing product(s)`,
      });
    }

    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category with ${subcategoryCount} subcategory(ies). Delete subcategories first.`,
      });
    }

    // Soft-deleted products still hold FK — move them to archive (keep order history)
    const softDeletedCount = await prisma.products.count({
      where: { category_id: id, deleted_at: { not: null } },
    });

    if (softDeletedCount > 0) {
      const archiveId = await getOrCreateArchivedCategory();
      await prisma.products.updateMany({
        where: { category_id: id, deleted_at: { not: null } },
        data: { category_id: archiveId, subcategory_id: null },
      });
    }

    await prisma.categories.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadCategoryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    const imageUrl = req.file.path;

    res.json({
      success: true,
      data: {
        imageUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
