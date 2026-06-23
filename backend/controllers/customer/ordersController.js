import prisma from '../../lib/config/prisma.js';

function generateOrderNumber() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export const createOrder = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, subtotal, tax, shipping, discount, total, notes, transactionId } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must contain at least one item' });
    }
    if (!shippingAddress || !shippingAddress.phone) {
      return res.status(400).json({ success: false, message: 'Shipping address with phone is required' });
    }
    if (!paymentMethod || !paymentMethod.method) {
      return res.status(400).json({ success: false, message: 'Payment method is required' });
    }

    const orderNumber = generateOrderNumber();
    const initialStatus = transactionId ? 'processing' : 'pending';
    const initialPaymentStatus = transactionId ? 'completed' : 'pending';

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.orders.create({
        data: {
          user_id: userId,
          order_number: orderNumber,
          subtotal: subtotal || 0,
          tax: tax || 0,
          shipping: shipping || 0,
          discount: discount || 0,
          total: total || 0,
          status: initialStatus,
          payment_status: initialPaymentStatus,
          payment_transaction_id: transactionId || null,
          shipping_address: shippingAddress,
          payment_method: paymentMethod,
          customer_notes: notes || null,
        },
      });

      for (const item of items) {
        await tx.order_items.create({
          data: {
            order_id: newOrder.id,
            product_id: item.productId,
            variant_id: item.variantId || null,
            product_name: item.productName,
            product_image_url: item.productImage || null,
            unit_price: item.unitPrice,
            discount_amount: item.discountAmount || 0,
            quantity: item.quantity,
            total: item.total,
          },
        });

        await tx.products.updateMany({
          where: { id: item.productId, stock_quantity: { gte: item.quantity } },
          data: { stock_quantity: { decrement: item.quantity } },
        });
      }

      await tx.order_status_history.create({
        data: { order_id: newOrder.id, status: 'pending', notes: 'Order placed', updated_by_name: 'System' },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: Number(order.total),
        createdAt: order.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = { user_id: userId };
    if (status && status !== 'all') where.status = status;

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        select: {
          id: true,
          order_number: true,
          order_type: true,
          subtotal: true,
          tax: true,
          shipping: true,
          discount: true,
          total: true,
          status: true,
          payment_status: true,
          tracking_number: true,
          created_at: true,
          updated_at: true,
          _count: { select: { order_items: true } },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit, 10),
      }),
      prisma.orders.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        orders: orders.map((o) => ({ ...o, item_count: o._count.order_items, _count: undefined })),
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total,
          totalPages: Math.ceil(total / parseInt(limit, 10)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await prisma.orders.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
      include: {
        order_items: true,
        order_status_history: { orderBy: { created_at: 'desc' } },
      },
    });

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({
      success: true,
      data: {
        ...order,
        items: order.order_items,
        statusHistory: order.order_status_history,
        order_items: undefined,
        order_status_history: undefined,
      },
    });
  } catch (error) {
    next(error);
  }
};
