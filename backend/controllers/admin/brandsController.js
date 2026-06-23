import prisma from '../../lib/config/prisma.js';

const brandSelect = {
  id: true,
  name: true,
  description: true,
  logo_url: true,
  is_active: true,
  product_count: true,
  created_at: true,
  updated_at: true,
};

export const getBrands = async (_req, res, next) => {
  try {
    const result = await prisma.brands.findMany({
      select: brandSelect,
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getBrandById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await prisma.brands.findUnique({
      where: { id },
      select: brandSelect,
    });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const { name, description, logoUrl, isActive = true } = req.body;

    const existingBrand = await prisma.brands.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true },
    });

    if (existingBrand) {
      return res.status(400).json({
        success: false,
        message: 'Brand with this name already exists',
      });
    }

    const result = await prisma.brands.create({
      data: {
        name,
        description: description || null,
        logo_url: logoUrl || null,
        is_active: isActive,
      },
      select: {
        id: true,
        name: true,
        description: true,
        logo_url: true,
        is_active: true,
        product_count: true,
        created_at: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateBrand = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, logoUrl, isActive } = req.body;

    const brandCheck = await prisma.brands.findUnique({ where: { id }, select: { id: true } });
    if (!brandCheck) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    if (name) {
      const existingBrand = await prisma.brands.findFirst({
        where: {
          name: { equals: name, mode: 'insensitive' },
          NOT: { id },
        },
        select: { id: true },
      });

      if (existingBrand) {
        return res.status(400).json({
          success: false,
          message: 'Brand with this name already exists',
        });
      }
    }

    const result = await prisma.brands.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(logoUrl !== undefined ? { logo_url: logoUrl } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
      },
      select: {
        id: true,
        name: true,
        description: true,
        logo_url: true,
        is_active: true,
        product_count: true,
        created_at: true,
        updated_at: true,
      },
    });

    res.json({
      success: true,
      message: 'Brand updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBrand = async (req, res, next) => {
  try {
    const { id } = req.params;

    const productCheck = await prisma.products.count({ where: { brand_id: id } });

    if (productCheck > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete brand with existing products. Please reassign or delete products first.',
      });
    }

    const result = await prisma.brands.findUnique({ where: { id }, select: { id: true } });

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found',
      });
    }

    await prisma.brands.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Brand deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadBrandLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No logo file provided',
      });
    }

    const logoUrl = req.file.path;

    res.json({
      success: true,
      data: {
        logoUrl,
      },
    });
  } catch (error) {
    next(error);
  }
};
