import prisma from '../../lib/config/prisma.js';

const flashSaleSelect = {
  id: true,
  title: true,
  description: true,
  start_time: true,
  end_time: true,
  status: true,
  is_active: true,
  created_at: true,
  updated_at: true,
  _count: {
    select: { flash_sale_products: true },
  },
};

const flashSaleProductSelect = {
  id: true,
  flash_sale_id: true,
  product_id: true,
  product_name: true,
  product_image_url: true,
  original_price: true,
  sale_price: true,
  discount_percentage: true,
  stock_limit: true,
  sold_count: true,
  created_at: true,
  products: {
    select: {
      name_en: true,
      price: true,
    },
  },
};

const resolveFlashSaleStatus = (startTime, endTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now >= start && now <= end) return 'active';
  if (now > end) return 'ended';
  return 'scheduled';
};

const toFlashSalePayload = (record) => ({
  ...record,
  product_count: record._count?.flash_sale_products ?? 0,
  _count: undefined,
});

const toFlashSaleProductPayload = (record) => ({
  ...record,
  current_product_name: record.products?.name_en ?? null,
  current_product_price: record.products?.price ? Number(record.products.price) : null,
  original_price: Number(record.original_price),
  sale_price: Number(record.sale_price),
  products: undefined,
});

export const getFlashSales = async (req, res, next) => {
  try {
    const records = await prisma.flash_sales.findMany({
      select: flashSaleSelect,
      orderBy: { start_time: 'desc' },
    });

    return res.json({
      success: true,
      data: records.map(toFlashSalePayload),
    });
  } catch (error) {
    return next(error);
  }
};

export const getFlashSaleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sale = await prisma.flash_sales.findUnique({
      where: { id },
      select: {
        ...flashSaleSelect,
        flash_sale_products: {
          select: flashSaleProductSelect,
          orderBy: { created_at: 'asc' },
        },
      },
    });

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    const { flash_sale_products, _count, ...saleData } = sale;

    return res.json({
      success: true,
      data: {
        ...toFlashSalePayload({ ...saleData, _count }),
        products: flash_sale_products.map(toFlashSaleProductPayload),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createFlashSale = async (req, res, next) => {
  try {
    const {
      title,
      description,
      startTime,
      endTime,
      isActive = true,
    } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, start time, and end time are required',
      });
    }

    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    const record = await prisma.flash_sales.create({
      data: {
        title,
        description: description || null,
        start_time: new Date(startTime),
        end_time: new Date(endTime),
        status: resolveFlashSaleStatus(startTime, endTime),
        is_active: isActive,
      },
      select: flashSaleSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Flash sale created successfully',
      data: toFlashSalePayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      startTime,
      endTime,
      status,
      isActive,
    } = req.body;

    if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time',
      });
    }

    const existing = await prisma.flash_sales.findUnique({
      where: { id },
      select: { id: true, start_time: true, end_time: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    const nextStart = startTime ? new Date(startTime) : existing.start_time;
    const nextEnd = endTime ? new Date(endTime) : existing.end_time;

    const record = await prisma.flash_sales.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(startTime !== undefined ? { start_time: nextStart } : {}),
        ...(endTime !== undefined ? { end_time: nextEnd } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(!status && (startTime !== undefined || endTime !== undefined)
          ? { status: resolveFlashSaleStatus(nextStart, nextEnd) }
          : {}),
        updated_at: new Date(),
      },
      select: flashSaleSelect,
    });

    return res.json({
      success: true,
      message: 'Flash sale updated successfully',
      data: toFlashSalePayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteFlashSale = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.flash_sales.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Flash sale not found',
      });
    }

    await prisma.flash_sales.delete({ where: { id } });

    return res.json({
      success: true,
      message: 'Flash sale deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const addFlashSaleProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { productId, salePrice, stockLimit } = req.body;

    if (!productId || !salePrice || !stockLimit) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, sale price, and stock limit are required',
      });
    }

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name_en: true,
        price: true,
        product_images: {
          where: { is_primary: true },
          select: { image_url: true },
          take: 1,
        },
      },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const originalPrice = Number(product.price);
    const parsedSalePrice = Number(salePrice);

    if (parsedSalePrice >= originalPrice) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be less than original price',
      });
    }

    const record = await prisma.flash_sale_products.create({
      data: {
        flash_sale_id: id,
        product_id: productId,
        product_name: product.name_en,
        product_image_url: product.product_images[0]?.image_url ?? null,
        original_price: originalPrice,
        sale_price: parsedSalePrice,
        stock_limit: Number(stockLimit),
      },
      select: flashSaleProductSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Product added to flash sale',
      data: toFlashSaleProductPayload(record),
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Product already exists in this flash sale',
      });
    }
    return next(error);
  }
};

export const updateFlashSaleProduct = async (req, res, next) => {
  try {
    const { id, productId } = req.params;
    const { salePrice, stockLimit, soldCount } = req.body;

    if (salePrice !== undefined && salePrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be greater than 0',
      });
    }

    if (stockLimit !== undefined && stockLimit <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Stock limit must be greater than 0',
      });
    }

    const current = await prisma.flash_sale_products.findFirst({
      where: {
        flash_sale_id: id,
        id: productId,
      },
      select: { id: true, original_price: true },
    });

    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in flash sale',
      });
    }

    if (salePrice !== undefined && Number(salePrice) >= Number(current.original_price)) {
      return res.status(400).json({
        success: false,
        message: 'Sale price must be less than original price',
      });
    }

    if (salePrice === undefined && stockLimit === undefined && soldCount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
      });
    }

    const record = await prisma.flash_sale_products.update({
      where: { id: current.id },
      data: {
        ...(salePrice !== undefined ? { sale_price: Number(salePrice) } : {}),
        ...(stockLimit !== undefined ? { stock_limit: Number(stockLimit) } : {}),
        ...(soldCount !== undefined ? { sold_count: Number(soldCount) } : {}),
      },
      select: flashSaleProductSelect,
    });

    return res.json({
      success: true,
      message: 'Flash sale product updated successfully',
      data: toFlashSaleProductPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteFlashSaleProduct = async (req, res, next) => {
  try {
    const { id, productId } = req.params;

    const existing = await prisma.flash_sale_products.findFirst({
      where: {
        flash_sale_id: id,
        id: productId,
      },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in flash sale',
      });
    }

    await prisma.flash_sale_products.delete({ where: { id: existing.id } });

    return res.json({
      success: true,
      message: 'Product removed from flash sale',
    });
  } catch (error) {
    return next(error);
  }
};
