import prisma from '../../lib/config/prisma.js';

const subcategorySelect = {
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
  categories: {
    select: { name_en: true },
  },
  _count: {
    select: {
      products: { where: { deleted_at: null } },
    },
  },
};

const toPayload = (record) => ({
  ...record,
  category_name: record.categories?.name_en ?? null,
  product_count: record._count?.products ?? 0,
  categories: undefined,
  _count: undefined,
});

export const getSubcategories = async (req, res, next) => {
  try {
    const { categoryId } = req.query;

    const records = await prisma.subcategories.findMany({
      where: categoryId ? { category_id: categoryId } : undefined,
      select: subcategorySelect,
      orderBy: [{ display_order: 'asc' }, { name_en: 'asc' }],
    });

    return res.json({
      success: true,
      data: records.map(toPayload),
    });
  } catch (error) {
    return next(error);
  }
};

export const getSubcategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.subcategories.findUnique({
      where: { id },
      select: subcategorySelect,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    return res.json({
      success: true,
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const createSubcategory = async (req, res, next) => {
  try {
    const {
      categoryId,
      nameEn,
      nameSo,
      nameAr,
      descriptionEn,
      descriptionSo,
      descriptionAr,
      imageUrl,
      isActive = true,
      displayOrder = 0,
    } = req.body;

    const record = await prisma.subcategories.create({
      data: {
        category_id: categoryId,
        name_en: nameEn,
        name_so: nameSo,
        name_ar: nameAr,
        description_en: descriptionEn,
        description_so: descriptionSo,
        description_ar: descriptionAr,
        image_url: imageUrl,
        is_active: isActive,
        display_order: displayOrder,
      },
      select: subcategorySelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Subcategory created successfully',
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      categoryId,
      nameEn,
      nameSo,
      nameAr,
      descriptionEn,
      descriptionSo,
      descriptionAr,
      imageUrl,
      isActive,
      displayOrder,
    } = req.body;

    const existing = await prisma.subcategories.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    const record = await prisma.subcategories.update({
      where: { id },
      data: {
        ...(categoryId !== undefined ? { category_id: categoryId } : {}),
        ...(nameEn !== undefined ? { name_en: nameEn } : {}),
        ...(nameSo !== undefined ? { name_so: nameSo } : {}),
        ...(nameAr !== undefined ? { name_ar: nameAr } : {}),
        ...(descriptionEn !== undefined ? { description_en: descriptionEn } : {}),
        ...(descriptionSo !== undefined ? { description_so: descriptionSo } : {}),
        ...(descriptionAr !== undefined ? { description_ar: descriptionAr } : {}),
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
        updated_at: new Date(),
      },
      select: subcategorySelect,
    });

    return res.json({
      success: true,
      message: 'Subcategory updated successfully',
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSubcategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.subcategories.findUnique({
      where: { id },
      select: { id: true, category_id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Subcategory not found',
      });
    }

    // Only active products block deletion (ignore orders)
    const activeProductCount = await prisma.products.count({
      where: { subcategory_id: id, deleted_at: null },
    });

    if (activeProductCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete subcategory with ${activeProductCount} existing product(s)`,
      });
    }

    // Soft-deleted products: clear subcategory link (keep product + order history)
    await prisma.products.updateMany({
      where: { subcategory_id: id, deleted_at: { not: null } },
      data: { subcategory_id: null },
    });

    await prisma.subcategories.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Subcategory deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const uploadSubcategoryImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided',
      });
    }

    return res.json({
      success: true,
      data: {
        imageUrl: req.file.path,
      },
    });
  } catch (error) {
    return next(error);
  }
};
