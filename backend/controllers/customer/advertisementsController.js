import prisma from '../../lib/config/prisma.js';

export const getAdvertisements = async (req, res, next) => {
  try {
    const { placement } = req.query;
    const now = new Date();

    const advertisements = await prisma.advertisements.findMany({
      where: {
        is_active: true,
        OR: [{ start_date: null }, { start_date: { lte: now } }],
        AND: [{ OR: [{ end_date: null }, { end_date: { gte: now } }] }],
        ...(placement ? { placement } : {}),
      },
      select: {
        id: true,
        title: true,
        description: true,
        image_url: true,
        target_url: true,
        placement: true,
        display_order: true,
      },
      orderBy: [{ display_order: 'asc' }, { created_at: 'desc' }],
    });

    res.json({
      success: true,
      data: {
        advertisements: advertisements.map((ad) => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          imageUrl: ad.image_url,
          targetUrl: ad.target_url,
          placement: ad.placement,
          displayOrder: ad.display_order,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const recordAdvertisementView = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.advertisements.update({
      where: { id },
      data: { view_count: { increment: 1 } },
    });
    res.json({ success: true, message: 'View recorded' });
  } catch (error) {
    next(error);
  }
};

export const recordAdvertisementClick = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.advertisements.update({
      where: { id },
      data: { click_count: { increment: 1 } },
    });
    res.json({ success: true, message: 'Click recorded' });
  } catch (error) {
    next(error);
  }
};
