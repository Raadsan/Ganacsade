import prisma from '../../lib/config/prisma.js';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const advertisementSelect = {
  id: true,
  title: true,
  description: true,
  image_url: true,
  target_url: true,
  placement: true,
  display_order: true,
  is_active: true,
  start_date: true,
  end_date: true,
  view_count: true,
  click_count: true,
  created_at: true,
  updated_at: true,
};

const deleteLocalImage = async (imageUrl) => {
  if (!imageUrl) return;
  const imagePath = path.join(__dirname, '../../../', imageUrl);
  try {
    await fs.unlink(imagePath);
  } catch (err) {
    console.error('Error deleting image:', err);
  }
};

export const getAdvertisements = async (req, res, next) => {
  try {
    const { placement } = req.query;

    const records = await prisma.advertisements.findMany({
      where: placement ? { placement } : undefined,
      select: advertisementSelect,
      orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
    });

    return res.json({
      success: true,
      data: records,
    });
  } catch (error) {
    return next(error);
  }
};

export const getAdvertisementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.advertisements.findUnique({
      where: { id },
      select: advertisementSelect,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
      });
    }

    return res.json({
      success: true,
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

export const createAdvertisement = async (req, res, next) => {
  try {
    const {
      title,
      description,
      targetUrl,
      placement,
      displayOrder = 0,
      isActive = true,
      startDate,
      endDate,
    } = req.body;

    if (!title || !placement) {
      return res.status(400).json({
        success: false,
        message: 'Title and placement are required',
      });
    }

    const imageUrl = req.file?.path || req.body.imageUrl;
    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Image is required',
      });
    }

    const record = await prisma.advertisements.create({
      data: {
        title,
        description: description || null,
        image_url: imageUrl,
        target_url: targetUrl || null,
        placement,
        display_order: displayOrder,
        is_active: isActive,
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
      },
      select: advertisementSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Advertisement created successfully',
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      targetUrl,
      placement,
      displayOrder,
      isActive,
      startDate,
      endDate,
    } = req.body;

    const current = await prisma.advertisements.findUnique({
      where: { id },
      select: { id: true, image_url: true },
    });

    if (!current) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
      });
    }

    let imageUrl = req.body.imageUrl ?? current.image_url;
    if (req.file) {
      if (current.image_url && current.image_url !== req.file.path) {
        await deleteLocalImage(current.image_url);
      }
      imageUrl = req.file.path;
    }

    const record = await prisma.advertisements.update({
      where: { id },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        ...(targetUrl !== undefined ? { target_url: targetUrl } : {}),
        ...(placement !== undefined ? { placement } : {}),
        ...(displayOrder !== undefined ? { display_order: displayOrder } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
        ...(startDate !== undefined ? { start_date: startDate ? new Date(startDate) : null } : {}),
        ...(endDate !== undefined ? { end_date: endDate ? new Date(endDate) : null } : {}),
        updated_at: new Date(),
      },
      select: advertisementSelect,
    });

    return res.json({
      success: true,
      message: 'Advertisement updated successfully',
      data: record,
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteAdvertisement = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.advertisements.findUnique({
      where: { id },
      select: { id: true, image_url: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Advertisement not found',
      });
    }

    await prisma.advertisements.delete({ where: { id } });
    await deleteLocalImage(existing.image_url);

    return res.json({
      success: true,
      message: 'Advertisement deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const incrementAdvertisementViews = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.advertisements.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });

    return res.json({
      success: true,
      message: 'View count incremented',
    });
  } catch (error) {
    return next(error);
  }
};

export const incrementAdvertisementClicks = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.advertisements.update({
      where: { id },
      data: { click_count: { increment: 1 } },
    });

    return res.json({
      success: true,
      message: 'Click count incremented',
    });
  } catch (error) {
    return next(error);
  }
};
