import { v4 as uuidv4 } from 'uuid';
import prisma from '../../lib/config/prisma.js';
import waafipayService from '../../lib/services/waafipayService.js';
import edahabService from '../../lib/services/edahabService.js';

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function getUserContact(user) {
  const name = `${user?.first_name || ''} ${user?.last_name || ''}`.trim();
  return {
    user_name: name || user?.phone_number || user?.email || null,
    user_email: user?.email || null,
  };
}

export const processDirectPayment = async (req, res, next) => {
  try {
    const { phoneNumber, amount, description, provider = 'waafipay' } = req.body;

    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required',
      });
    }

    const referenceId = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    const payload = {
      phoneNumber,
      amount: parseFloat(amount),
      currency: 'USD',
      referenceId,
      description: description || 'Order payment',
    };

    const paymentResult = provider === 'edahab'
      ? await edahabService.purchase(payload)
      : await waafipayService.purchase(payload);

    if (paymentResult.success) {
      return res.json({
        success: true,
        message: 'Payment successful',
        data: {
          transactionId: paymentResult.transactionId,
          invoiceId: paymentResult.invoiceId,
          referenceId: paymentResult.referenceId || referenceId,
          amount: paymentResult.amount || amount,
          provider,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: paymentResult.message || 'Payment failed',
      errorCode: paymentResult.errorCode,
    });
  } catch (error) {
    next(error);
  }
};

export const processOrderPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required',
      });
    }

    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      include: { _count: { select: { order_items: true } } },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled order',
      });
    }

    await prisma.orders.update({
      where: { id: orderId },
      data: { payment_status: 'processing' },
    });

    const paymentResult = await waafipayService.purchase({
      phoneNumber,
      amount: Number(order.total),
      currency: 'USD',
      referenceId: order.order_number,
      description: `Payment for order #${order.order_number}`,
    });

    if (paymentResult.success) {
      await prisma.$transaction(async (tx) => {
        await tx.orders.update({
          where: { id: orderId },
          data: {
            payment_status: 'completed',
            payment_transaction_id: paymentResult.transactionId,
            status: 'processing',
          },
        });

        await tx.order_status_history.create({
          data: {
            order_id: orderId,
            status: 'processing',
            notes: `Payment received via WaafiPay. Transaction ID: ${paymentResult.transactionId}`,
            updated_by_name: 'Customer',
          },
        });

        const contact = getUserContact(req.user);
        await tx.transactions.create({
          data: {
            transaction_id: paymentResult.transactionId || `TXN-${uuidv4().substring(0, 8).toUpperCase()}`,
            type: 'order_payment',
            amount: order.total,
            currency: 'USD',
            status: 'completed',
            payment_method: 'waafi_pay',
            user_id: userId,
            user_name: contact.user_name,
            user_email: contact.user_email,
            order_id: orderId,
            description: `Payment for order #${order.order_number}`,
            gateway_response: paymentResult,
            completed_at: new Date(),
          },
        });
      });

      return res.json({
        success: true,
        message: 'Payment successful',
        data: {
          orderId,
          orderNumber: order.order_number,
          transactionId: paymentResult.transactionId,
          amount: Number(order.total),
          status: 'paid',
        },
      });
    }

    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: orderId },
        data: { payment_status: 'failed' },
      });

      await tx.order_status_history.create({
        data: {
          order_id: orderId,
          status: 'pending',
          notes: `Payment failed: ${paymentResult.message}`,
          updated_by_name: 'Customer',
        },
      });
    });

    return res.status(400).json({
      success: false,
      message: paymentResult.message || 'Payment failed',
      errorCode: paymentResult.errorCode,
    });
  } catch (error) {
    next(error);
  }
};

export const initiateHppPayment = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required',
      });
    }

    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid',
      });
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const hppResult = await waafipayService.initiateHPP({
      phoneNumber,
      amount: Number(order.total),
      currency: 'USD',
      referenceId: order.order_number,
      description: `Payment for order #${order.order_number}`,
      successUrl: `${baseUrl}/api/customer/payments/hpp/success?orderId=${orderId}`,
      failureUrl: `${baseUrl}/api/customer/payments/hpp/failure?orderId=${orderId}`,
    });

    if (hppResult.success) {
      await prisma.orders.update({
        where: { id: orderId },
        data: { payment_status: 'processing' },
      });

      return res.json({
        success: true,
        message: 'HPP initiated successfully',
        data: {
          hppUrl: hppResult.hppUrl,
          directPaymentLink: hppResult.directPaymentLink,
          waafipayOrderId: hppResult.orderId,
        },
      });
    }

    return res.status(400).json({
      success: false,
      message: hppResult.message || 'Failed to initiate payment page',
      errorCode: hppResult.errorCode,
    });
  } catch (error) {
    next(error);
  }
};

export const handleHppSuccess = async (req, res) => {
  try {
    const { orderId, transactionId } = req.query;

    if (!orderId) {
      return res.redirect(`${FRONTEND_URL}/payment/error?message=Invalid callback`);
    }

    await prisma.$transaction(async (tx) => {
      await tx.orders.update({
        where: { id: String(orderId) },
        data: {
          payment_status: 'completed',
          payment_transaction_id: String(transactionId || 'HPP_SUCCESS'),
          status: 'processing',
        },
      });

      await tx.order_status_history.create({
        data: {
          order_id: String(orderId),
          status: 'processing',
          notes: `Payment received via WaafiPay HPP. Transaction: ${transactionId || 'N/A'}`,
          updated_by_name: 'System',
        },
      });
    });

    return res.redirect(`${FRONTEND_URL}/payment/success?orderId=${orderId}`);
  } catch (_error) {
    return res.redirect(`${FRONTEND_URL}/payment/error?message=Processing error`);
  }
};

export const handleHppFailure = async (req, res) => {
  try {
    const { orderId, errorCode, errorMessage } = req.query;

    if (orderId) {
      await prisma.$transaction(async (tx) => {
        await tx.orders.update({
          where: { id: String(orderId) },
          data: { payment_status: 'failed' },
        });

        await tx.order_status_history.create({
          data: {
            order_id: String(orderId),
            status: 'pending',
            notes: `Payment failed via HPP: ${errorMessage || errorCode || 'Unknown error'}`,
            updated_by_name: 'System',
          },
        });
      });
    }

    return res.redirect(
      `${FRONTEND_URL}/payment/failed?orderId=${orderId || ''}&error=${encodeURIComponent(String(errorMessage || 'Payment failed'))}`
    );
  } catch (_error) {
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await prisma.orders.findFirst({
      where: { id: orderId, user_id: userId },
      select: {
        id: true,
        order_number: true,
        total: true,
        payment_status: true,
        payment_method: true,
        payment_transaction_id: true,
        status: true,
        created_at: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: Number(order.total),
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        transactionId: order.payment_transaction_id,
        orderStatus: order.status,
      },
    });
  } catch (error) {
    next(error);
  }
};
