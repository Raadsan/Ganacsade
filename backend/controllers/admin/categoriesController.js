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
        product_count: true,
        created_at: true,
};

export const getCategories = async (_req, res, next) => {
  try {
    const result = await prisma.categories.findMany({
      select: categorySelect,
      orderBy: [{ display_order: 'asc' }, { name_en: 'asc' }],
    });

    return res.json({
      success: true,
      data: result,
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
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
      });
    }

    const subcategories = await prisma.subcategories.findMany({
      where: { category_id: id },
      orderBy: { display_order: 'asc' },
    });

    res.json({
      success: true,
      data: {
        ...result,
        subcategories,
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

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productCheck = await prisma.products.count({ where: { category_id: id } });

    if (productCheck > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete category with existing products',
      });
    }

    const existing = await prisma.categories.findUnique({ where: { id }, select: { id: true } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Category not found',
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
