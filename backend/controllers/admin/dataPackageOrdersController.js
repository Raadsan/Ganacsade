import prisma from '../../lib/config/prisma.js';

const toNumber = (value) => {
  if (value === null || value === undefined) return 0;
  return Number(value);
};

export const getDataPackageOrders = async (req, res, next) => {
  try {
    const {
      status,
      search,
      dateFrom,
      dateTo,
      start_date,
      end_date,
      page = 1,
      limit = 50,
    } = req.query;

    const pageNum = Number.parseInt(page, 10) || 1;
    const limitNum = Number.parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;
    const fromDate = dateFrom || start_date;
    const toDate = dateTo || end_date;

    const where = {
      order_type: 'data_package',
      ...(status && status !== 'all' ? { status } : {}),
      ...(search
        ? {
            OR: [
              { order_number: { contains: search, mode: 'insensitive' } },
              {
                users: {
                  OR: [
                    { first_name: { contains: search, mode: 'insensitive' } },
                    { last_name: { contains: search, mode: 'insensitive' } },
                  ],
                },
              },
            ],
          }
        : {}),
      ...(fromDate || toDate
        ? {
            created_at: {
              ...(fromDate ? { gte: new Date(fromDate) } : {}),
              ...(toDate ? { lte: new Date(`${toDate}T23:59:59`) } : {}),
            },
          }
        : {}),
    };

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        select: {
          id: true,
          order_number: true,
          user_id: true,
          total: true,
          status: true,
          payment_status: true,
          shipping_address: true,
          payment_method: true,
          created_at: true,
          updated_at: true,
          users: {
            select: {
              first_name: true,
              last_name: true,
              email: true,
              phone_number: true,
            },
          },
          order_items: {
            select: {
              package_name: true,
              provider_name: true,
              recipient_phone: true,
              package_duration: true,
              package_data: true,
            },
            take: 1,
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.orders.count({ where }),
    ]);

    const data = orders.map((order) => {
      const firstItem = order.order_items?.[0] || null;
      return {
        id: order.id,
        order_number: order.order_number,
        user_id: order.user_id,
        customer_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
        customer_email: order.users?.email || null,
        customer_phone: order.users?.phone_number || null,
        amount: toNumber(order.total),
        status: order.status,
        payment_status: order.payment_status,
        shipping_address: order.shipping_address,
        payment_method: order.payment_method,
        created_at: order.created_at,
        updated_at: order.updated_at,
        package_name: firstItem?.package_name || null,
        provider_name: firstItem?.provider_name || null,
        recipient_phone: firstItem?.recipient_phone || null,
        package_duration: firstItem?.package_duration || null,
        package_data: firstItem?.package_data || null,
      };
    });

    res.json({
      success: true,
      data,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDataPackageOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await prisma.orders.findFirst({
      where: { id, order_type: 'data_package' },
      select: {
        id: true,
        order_number: true,
        user_id: true,
        subtotal: true,
        tax: true,
        shipping: true,
        discount: true,
        total: true,
        status: true,
        payment_status: true,
        shipping_address: true,
        payment_method: true,
        created_at: true,
        updated_at: true,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        order_items: true,
        order_status_history: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Data package order not found',
      });
    }

    const payload = {
      ...order,
      customer_name: `${order.users?.first_name || ''} ${order.users?.last_name || ''}`.trim(),
      customer_email: order.users?.email || null,
      customer_phone: order.users?.phone_number || null,
      items: order.order_items,
      status_history: order.order_status_history,
      users: undefined,
      order_items: undefined,
      order_status_history: undefined,
    };

    return res.json({
      success: true,
      data: payload,
    });
  } catch (error) {
    return next(error);
  }
};

export const getDataPackageOrdersSummaryStats = async (req, res, next) => {
  try {
    const baseWhere = { order_type: 'data_package' };
    const [totalOrders, completedRevenueAgg, statusGroups, recentOrders, topProviders] = await Promise.all([
      prisma.orders.count({ where: baseWhere }),
      prisma.orders.aggregate({
        where: { ...baseWhere, payment_status: 'completed' },
        _sum: { total: true },
      }),
      prisma.orders.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
      }),
      prisma.orders.count({
        where: {
          ...baseWhere,
          created_at: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
      prisma.order_items.groupBy({
        by: ['provider_name'],
        where: {
          orders: { order_type: 'data_package' },
        },
        _count: { _all: true },
        _sum: { total: true },
        orderBy: { _count: { provider_name: 'desc' } },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        totalRevenue: toNumber(completedRevenueAgg?._sum?.total),
        ordersByStatus: statusGroups.map((group) => ({
          status: group.status,
          count: group._count?._all || 0,
        })),
        recentOrders,
        topProviders: topProviders.map((provider) => ({
          provider_name: provider.provider_name,
          count: provider._count?._all || 0,
          revenue: toNumber(provider._sum?.total),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
