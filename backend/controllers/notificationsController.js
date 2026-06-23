import prisma from '../lib/config/prisma.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const { unreadOnly } = req.query;
    const where = { user_id: req.user.id };
    if (unreadOnly === 'true') {
      where.is_read = false;
    }

    const notifications = await prisma.notifications.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    const unreadCount = await prisma.notifications.count({
      where: { user_id: req.user.id, is_read: false },
    });

    res.json({
      success: true,
      data: notifications.map((item) => ({
        id: item.id,
        title: item.title,
        body: item.body,
        type: item.type,
        data: item.data,
        isRead: item.is_read,
        createdAt: item.created_at,
      })),
      meta: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const notification = await prisma.notifications.findFirst({
      where: { id, user_id: req.user.id },
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    const updated = await prisma.notifications.update({
      where: { id },
      data: { is_read: true },
    });

    res.json({
      success: true,
      data: {
        id: updated.id,
        isRead: updated.is_read,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await prisma.notifications.updateMany({
      where: { user_id: req.user.id, is_read: false },
      data: { is_read: true },
    });

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};
