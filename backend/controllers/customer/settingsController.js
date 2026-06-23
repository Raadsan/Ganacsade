import prisma from '../../lib/config/prisma.js';

export const getPublicSettings = async (_req, res, next) => {
  try {
    const result = await prisma.settings.findMany({
      where: {
        key: { in: ['shipping_flat_rate', 'shipping_free_threshold', 'tax_rate', 'tax_enabled'] },
        is_public: true,
      },
      select: { key: true, value: true },
      orderBy: { key: 'asc' },
    });

    const settings = {};
    result.forEach((row) => {
      let value = row.value;
      if (typeof value === 'string') {
        const numValue = parseFloat(value);
        if (!Number.isNaN(numValue) && value.trim() !== '') {
          value = numValue;
        } else if (value === 'true' || value === 'false') {
          value = value === 'true';
        }
      }
      settings[row.key] = value;
    });

    res.json({ success: true, data: { settings } });
  } catch (error) {
    next(error);
  }
};
