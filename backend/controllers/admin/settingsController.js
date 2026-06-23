import prisma from '../../lib/config/prisma.js';

export const getSettings = async (req, res, next) => {
  try {
    const { category } = req.query;

    const settings = await prisma.settings.findMany({
      where: {
        ...(category ? { category } : {}),
      },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
    });

    res.json({
      success: true,
      data: {
        settings,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getSettingByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const setting = await prisma.settings.findUnique({
      where: { key },
    });

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    return res.json({
      success: true,
      data: {
        setting,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description } = req.body;

    if (value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Value is required',
      });
    }

    const existingSetting = await prisma.settings.findUnique({
      where: { key },
    });

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    const setting = await prisma.settings.update({
      where: { key },
      data: {
        value: value.toString(),
        ...(description !== undefined ? { description } : {}),
      },
    });

    return res.json({
      success: true,
      message: 'Setting updated successfully',
      data: {
        setting,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createSetting = async (req, res, next) => {
  try {
    const {
      key, value, description, category, data_type,
    } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Key and value are required',
      });
    }

    const existingSetting = await prisma.settings.findUnique({
      where: { key },
    });

    if (existingSetting) {
      return res.status(400).json({
        success: false,
        message: 'Setting with this key already exists',
      });
    }

    const setting = await prisma.settings.create({
      data: {
        key,
        value: value.toString(),
        description: description || null,
        category: category || 'general',
        data_type: data_type || 'string',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Setting created successfully',
      data: {
        setting,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteSetting = async (req, res, next) => {
  try {
    const { key } = req.params;

    const existingSetting = await prisma.settings.findUnique({
      where: { key },
      select: { key: true },
    });

    if (!existingSetting) {
      return res.status(404).json({
        success: false,
        message: 'Setting not found',
      });
    }

    await prisma.settings.delete({
      where: { key },
    });

    return res.json({
      success: true,
      message: 'Setting deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};
