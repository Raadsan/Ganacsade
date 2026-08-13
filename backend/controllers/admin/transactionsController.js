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

const toPayload = (record) => {
  const { users, ...transaction } = record;
  const fallbackName = `${users?.first_name || ''} ${users?.last_name || ''}`.trim();

  return {
    ...transaction,
    amount: transaction.amount ? Number(transaction.amount) : 0,
    user_name: transaction.user_name || fallbackName || users?.phone_number || null,
    user_email: transaction.user_email || users?.email || null,
  };
};

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
        },
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

    const [totalTransactions, paymentAgg, refundAgg, completedCount, pendingCount, failedCount] =
      await Promise.all([
        prisma.transactions.count({ where }),
        prisma.transactions.aggregate({
          where: { ...where, type: 'order_payment', status: 'completed' },
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

    // Revenue is payments only. Refunds are kept separate and deducted once.
    const totalRevenue = Number(paymentAgg._sum.amount || 0);
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
            order_items: {
              select: {
                id: true,
                product_name: true,
                package_name: true,
                provider_name: true,
                quantity: true,
                unit_price: true,
                total: true,
              },
            },
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
        order_items: (orders?.order_items || []).map((item) => ({
          ...item,
          unit_price: Number(item.unit_price),
          total: Number(item.total),
        })),
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

/**
 * Record a customer refund against a completed order payment.
 * The payment gateway integration can be added here later; this endpoint keeps
 * the financial ledger and refund audit trail accurate immediately.
 */
export const refundTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reason = String(req.body.reason || '').trim();
    const selectedItems = Array.isArray(req.body.selectedItems) ? req.body.selectedItems : [];
    if (!reason) {
      return res.status(400).json({ success: false, message: 'Refund reason is required' });
    }
    if (!selectedItems.length) {
      return res.status(400).json({ success: false, message: 'Select at least one returned product or service' });
    }

    const payment = await prisma.transactions.findUnique({
      where: { id },
      select: {
        id: true, transaction_id: true, type: true, status: true, amount: true,
        currency: true, payment_method: true, user_id: true, user_name: true,
        user_email: true, order_id: true,
      },
    });

    if (!payment || payment.type !== 'order_payment' || payment.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Only completed order payments can be refunded' });
    }
    if (!payment.order_id) {
      return res.status(400).json({ success: false, message: 'This payment is not linked to an order' });
    }

    const [order, priorRefundRecords] = await Promise.all([
      prisma.orders.findUnique({
        where: { id: payment.order_id },
        select: { order_items: { select: { id: true, product_name: true, package_name: true, provider_name: true, quantity: true, unit_price: true } } },
      }),
      prisma.transactions.findMany({
        where: { type: 'refund', status: 'completed', order_id: payment.order_id },
        select: { metadata: true },
      }),
    ]);
    if (!order?.order_items.length) {
      return res.status(400).json({ success: false, message: 'No order products or services are available for refund' });
    }

    const refundedQuantities = new Map();
    for (const record of priorRefundRecords) {
      const items = record.metadata?.refunded_items;
      if (Array.isArray(items)) {
        for (const item of items) refundedQuantities.set(item.id, (refundedQuantities.get(item.id) || 0) + Number(item.quantity || 0));
      }
    }
    const orderItems = new Map(order.order_items.map((item) => [item.id, item]));
    const refundItems = [];
    let amount = 0;
    for (const selected of selectedItems) {
      const item = orderItems.get(String(selected.id));
      const quantity = Number(selected.quantity);
      if (!item || !Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ success: false, message: 'Invalid selected product or service' });
      }
      const available = item.quantity - (refundedQuantities.get(item.id) || 0);
      if (quantity > available) {
        return res.status(400).json({ success: false, message: `${item.product_name} has only ${available} refundable unit(s) remaining` });
      }
      const lineAmount = Number(item.unit_price) * quantity;
      amount += lineAmount;
      refundItems.push({
        id: item.id,
        name: item.package_name || item.product_name,
        provider: item.provider_name || null,
        quantity,
        unit_price: Number(item.unit_price),
        amount: lineAmount,
      });
    }

    const priorRefunds = await prisma.transactions.aggregate({
      where: { type: 'refund', status: 'completed', order_id: payment.order_id },
      _sum: { amount: true },
    });
    const remaining = Number(payment.amount) - Number(priorRefunds._sum.amount || 0);
    if (amount > remaining + 0.00001) {
      return res.status(400).json({
        success: false,
        message: `Refund amount cannot exceed the remaining refundable amount ($${remaining.toFixed(2)})`,
      });
    }

    const adminName = `${req.user.first_name || ''} ${req.user.last_name || ''}`.trim() || req.user.email || 'Admin';
    const transactionId = await generateTransactionId();
    const refund = await prisma.$transaction(async (tx) => {
      const record = await tx.transactions.create({
        data: {
          transaction_id: transactionId,
          type: 'refund',
          status: 'completed',
          amount,
          currency: payment.currency || 'USD',
          payment_method: payment.payment_method,
          user_id: payment.user_id,
          user_name: payment.user_name,
          user_email: payment.user_email,
          order_id: payment.order_id,
          description: reason,
          metadata: {
            original_transaction_id: payment.transaction_id,
            refunded_items: refundItems,
            refund_reason: reason,
            refunded_by_user_id: req.user.id,
            refunded_by_name: adminName,
          },
          completed_at: new Date(),
        },
        select: transactionSelect,
      });

      if (amount >= remaining - 0.00001) {
        await tx.orders.update({
          where: { id: payment.order_id },
          data: { payment_status: 'refunded', status: 'refunded', updated_at: new Date() },
        });
      }
      return record;
    });

    return res.status(201).json({
      success: true,
      message: 'Refund recorded successfully and deducted from revenue',
      data: toPayload(refund),
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
