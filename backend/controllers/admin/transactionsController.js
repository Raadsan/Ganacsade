import prisma from '../../lib/config/prisma.js';

const transactionSelect = {
  id: true,
  transaction_id: true,
  type: true,
  status: true,
  amount: true,
  currency: true,
  payment_method: true,
  user_id: true,
  user_name: true,
  user_email: true,
  order_id: true,
  description: true,
  failure_reason: true,
  gateway_response: true,
  metadata: true,
  created_at: true,
  updated_at: true,
  completed_at: true,
  failed_at: true,
};

const toPayload = (record) => ({
  ...record,
  amount: record.amount ? Number(record.amount) : 0,
});

const generateTransactionId = async () => {
  const year = new Date().getFullYear();
  const prefix = `TXN-${year}-`;

  const latest = await prisma.transactions.findFirst({
    where: {
      transaction_id: { startsWith: prefix },
    },
    select: { transaction_id: true },
    orderBy: { transaction_id: 'desc' },
  });

  let nextNumber = 1;
  if (latest?.transaction_id) {
    const lastNumber = parseInt(latest.transaction_id.split('-')[2], 10);
    if (!Number.isNaN(lastNumber)) nextNumber = lastNumber + 1;
  }

  return `${prefix}${String(nextNumber).padStart(7, '0')}`;
};

const buildTransactionWhere = (query) => {
  const {
    status,
    type,
    payment_method,
    user_id,
    order_id,
    start_date,
    end_date,
    search,
  } = query;

  return {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(payment_method ? { payment_method } : {}),
    ...(user_id ? { user_id } : {}),
    ...(order_id ? { order_id } : {}),
    ...(start_date || end_date
      ? {
          created_at: {
            ...(start_date ? { gte: new Date(start_date) } : {}),
            ...(end_date ? { lte: new Date(end_date) } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            { transaction_id: { contains: search, mode: 'insensitive' } },
            { user_name: { contains: search, mode: 'insensitive' } },
            { user_email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };
};

export const getTransactions = async (req, res, next) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;
    const where = buildTransactionWhere(req.query);

    const [records, total] = await Promise.all([
      prisma.transactions.findMany({
        where,
        select: transactionSelect,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.transactions.count({ where }),
    ]);

    return res.json({
      success: true,
      data: records.map(toPayload),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransactionStats = async (req, res, next) => {
  try {
    const { start_date, end_date } = req.query;
    const where = buildTransactionWhere({ start_date, end_date });

    const [totalTransactions, completedAgg, refundAgg, completedCount, pendingCount, failedCount] =
      await Promise.all([
        prisma.transactions.count({ where }),
        prisma.transactions.aggregate({
          where: { ...where, status: 'completed' },
          _sum: { amount: true },
        }),
        prisma.transactions.aggregate({
          where: { ...where, type: 'refund', status: 'completed' },
          _sum: { amount: true },
        }),
        prisma.transactions.count({ where: { ...where, status: 'completed' } }),
        prisma.transactions.count({ where: { ...where, status: 'pending' } }),
        prisma.transactions.count({ where: { ...where, status: 'failed' } }),
      ]);

    const totalRevenue = Number(completedAgg._sum.amount || 0);
    const totalRefunds = Number(refundAgg._sum.amount || 0);

    return res.json({
      success: true,
      data: {
        total_transactions: totalTransactions,
        total_revenue: totalRevenue,
        total_refunds: totalRefunds,
        net_revenue: totalRevenue - totalRefunds,
        completed_count: completedCount,
        pending_count: pendingCount,
        failed_count: failedCount,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const record = await prisma.transactions.findUnique({
      where: { id },
      select: {
        ...transactionSelect,
        users: {
          select: {
            first_name: true,
            last_name: true,
            email: true,
            phone_number: true,
          },
        },
        orders: {
          select: {
            order_number: true,
            total: true,
          },
        },
      },
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const { users, orders, ...transaction } = record;

    return res.json({
      success: true,
      data: {
        ...toPayload(transaction),
        user_name: transaction.user_name
          || `${users?.first_name || ''} ${users?.last_name || ''}`.trim()
          || null,
        user_email: transaction.user_email || users?.email || null,
        user_phone: users?.phone_number || null,
        order_number: orders?.order_number || null,
        order_total: orders?.total ? Number(orders.total) : null,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const {
      type,
      amount,
      currency = 'USD',
      paymentMethod,
      userId,
      userName,
      userEmail,
      orderId,
      description,
      gatewayResponse,
      metadata,
    } = req.body;

    if (!type || !amount || !paymentMethod || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, payment method, and user ID are required',
      });
    }

    const transactionId = await generateTransactionId();

    const record = await prisma.transactions.create({
      data: {
        transaction_id: transactionId,
        type,
        amount,
        currency,
        payment_method: paymentMethod,
        user_id: userId,
        user_name: userName || null,
        user_email: userEmail || null,
        order_id: orderId || null,
        description: description || null,
        gateway_response: gatewayResponse || null,
        metadata: metadata || {},
      },
      select: transactionSelect,
    });

    return res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const updateTransactionStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, failureReason } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required',
      });
    }

    const existing = await prisma.transactions.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    const record = await prisma.transactions.update({
      where: { id },
      data: {
        status,
        updated_at: new Date(),
        ...(status === 'completed' ? { completed_at: new Date() } : {}),
        ...(status === 'failed'
          ? {
              failed_at: new Date(),
              ...(failureReason ? { failure_reason: failureReason } : {}),
            }
          : {}),
      },
      select: transactionSelect,
    });

    return res.json({
      success: true,
      message: 'Transaction status updated successfully',
      data: toPayload(record),
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existing = await prisma.transactions.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    await prisma.transactions.update({
      where: { id },
      data: {
        status: 'cancelled',
        updated_at: new Date(),
      },
    });

    return res.json({
      success: true,
      message: 'Transaction cancelled successfully',
    });
  } catch (error) {
    return next(error);
  }
};
