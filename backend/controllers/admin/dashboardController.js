import prisma from '../../lib/config/prisma.js';

export const getDashboardAnalytics = async (_req, res, next) => {
  try {
    const [totalUsers, totalProducts, paymentStats, refundStats, lastMonthUsers, lastMonthProducts, lastMonthPayments, lastMonthRefunds] = await Promise.all([
      prisma.users.count({ where: { role: 'customer', deleted_at: null } }),
      prisma.products.count({ where: { deleted_at: null } }),
      prisma.transactions.aggregate({
        where: { type: 'order_payment', status: 'completed' },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transactions.aggregate({
        where: { type: 'refund', status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.users.count({ where: { role: 'customer', deleted_at: null, created_at: { lt: new Date(new Date().setDate(1)) } } }),
      prisma.products.count({ where: { deleted_at: null, created_at: { lt: new Date(new Date().setDate(1)) } } }),
      prisma.transactions.aggregate({
        where: { type: 'order_payment', status: 'completed', created_at: { lt: new Date(new Date().setDate(1)) } },
        _count: { id: true },
        _sum: { amount: true },
      }),
      prisma.transactions.aggregate({
        where: { type: 'refund', status: 'completed', created_at: { lt: new Date(new Date().setDate(1)) } },
        _sum: { amount: true },
      }),
    ]);

    // One financial source: paid order transactions minus completed refunds.
    const totalRevenue = Number(paymentStats._sum.amount || 0) - Number(refundStats._sum.amount || 0);
    const totalOrders = paymentStats._count.id || 0;
    const lastMonthRevenue = Number(lastMonthPayments._sum.amount || 0) - Number(lastMonthRefunds._sum.amount || 0);
    const lastMonthOrderCount = lastMonthPayments._count.id || 0;

    const calcChange = (curr, prev) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return parseFloat(((curr - prev) / prev * 100).toFixed(1));
    };

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        revenueChange: calcChange(totalRevenue, lastMonthRevenue),
        ordersChange: calcChange(totalOrders, lastMonthOrderCount),
        usersChange: calcChange(totalUsers, lastMonthUsers),
        productsChange: calcChange(totalProducts, lastMonthProducts),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getRecentOrders = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const orders = await prisma.orders.findMany({
      where: { OR: [{ order_type: null }, { order_type: { not: 'data_package' } }] },
      select: {
        id: true,
        order_number: true,
        total: true,
        status: true,
        created_at: true,
        users: { select: { first_name: true, last_name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: limit,
    });

    res.json({
      success: true,
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        customerName: `${o.users.first_name} ${o.users.last_name}`,
        total: Number(o.total),
        status: o.status,
        createdAt: o.created_at,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const getQuickStats = async (_req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [pendingOrders, lowStockProducts, outOfStock, newUsersToday] = await Promise.all([
      prisma.orders.count({ where: { status: 'pending', OR: [{ order_type: null }, { order_type: { not: 'data_package' } }] } }),
      prisma.products.count({ where: { deleted_at: null, stock_quantity: { lte: prisma.products.fields?.low_stock_threshold } } }),
      prisma.products.count({ where: { deleted_at: null, stock_quantity: 0 } }),
      prisma.users.count({ where: { created_at: { gte: today } } }),
    ]);

    res.json({
      success: true,
      data: { pending_orders: pendingOrders, out_of_stock: outOfStock, new_users_today: newUsersToday },
    });
  } catch (error) {
    next(error);
  }
};

export const getTopProducts = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    const products = await prisma.products.findMany({
      where: { deleted_at: null },
      select: {
        id: true,
        name_en: true,
        order_items: { select: { quantity: true, total: true } },
        product_images: { where: { is_primary: true }, select: { image_url: true }, take: 1 },
      },
      take: limit * 3,
    });

    const sorted = products
      .map((p) => ({
        id: p.id,
        name: p.name_en,
        totalSold: p.order_items.reduce((acc, oi) => acc + (oi.quantity || 0), 0),
        revenue: p.order_items.reduce((acc, oi) => acc + Number(oi.total || 0), 0),
        image: p.product_images[0]?.image_url || null,
      }))
      .sort((a, b) => b.totalSold - a.totalSold || b.revenue - a.revenue)
      .slice(0, limit);

    res.json({ success: true, data: sorted });
  } catch (error) {
    next(error);
  }
};

export const getOrdersByStatus = async (_req, res, next) => {
  try {
    const groups = await prisma.orders.groupBy({
      by: ['status'],
      where: { OR: [{ order_type: null }, { order_type: { not: 'data_package' } }] },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    res.json({
      success: true,
      data: groups.map((g) => ({ status: g.status, count: g._count.id })),
    });
  } catch (error) {
    next(error);
  }
};

export const getSalesData = async (_req, res, next) => {
  try {
    const now = new Date();
    const buckets = [];

    // Last 12 months including current month
    for (let i = 11; i >= 0; i -= 1) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      buckets.push({ start, end });
    }

    const sales = await Promise.all(
      buckets.map(async ({ start, end }) => {
        const [ordersCount, revenueAgg] = await Promise.all([
          prisma.orders.count({
            where: {
              created_at: { gte: start, lt: end },
              OR: [{ order_type: null }, { order_type: { not: 'data_package' } }],
            },
          }),
          prisma.orders.aggregate({
            where: {
              created_at: { gte: start, lt: end },
              payment_status: 'completed',
              OR: [{ order_type: null }, { order_type: { not: 'data_package' } }],
            },
            _sum: { total: true },
          }),
        ]);

        return {
          date: start.toISOString().slice(0, 10),
          revenue: Number(revenueAgg._sum.total || 0),
          orders: ordersCount,
        };
      }),
    );

    return res.json({
      success: true,
      data: sales,
    });
  } catch (error) {
    return next(error);
  }
};
