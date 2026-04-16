const express = require('express');
const { query } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');
const waafipayService = require('../../services/waafipay.service');
const edahabService = require('../../services/edahab.service');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

/**
 * POST /api/customer/payments/process-direct
 * Process payment directly without creating order first
 * Payment first, order creation after success
 * Supports: waafipay, edahab
 */
router.post('/process-direct', authenticate, async (req, res, next) => {
  try {
    const { phoneNumber, amount, description, provider = 'waafipay' } = req.body;

    // Validate input
    if (!phoneNumber || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and amount are required'
      });
    }

    // Generate a temporary reference ID for the payment
    const referenceId = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;

    let paymentResult;

    // Route to appropriate payment provider
    if (provider === 'edahab') {
      // Process payment with eDahab
      paymentResult = await edahabService.purchase({
        phoneNumber,
        amount: parseFloat(amount),
        currency: 'USD',
        referenceId,
        description: description || 'Order payment'
      });
    } else {
      // Default: Process payment with WaafiPay
      paymentResult = await waafipayService.purchase({
        phoneNumber,
        amount: parseFloat(amount),
        currency: 'USD',
        referenceId,
        description: description || 'Order payment'
      });
    }

    if (paymentResult.success) {
      return res.json({
        success: true,
        message: 'Payment successful',
        data: {
          transactionId: paymentResult.transactionId,
          invoiceId: paymentResult.invoiceId,
          referenceId: paymentResult.referenceId || referenceId,
          amount: paymentResult.amount || amount,
          provider: provider
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment failed',
        errorCode: paymentResult.errorCode
      });
    }
  } catch (error) {
    console.error('Direct payment processing error:', error);
    next(error);
  }
});

/**
 * POST /api/customer/payments/process
 * Process payment for an order using WaafiPay
 */
router.post('/process', authenticate, async (req, res, next) => {
  const client = await require('../../config/database').pool.connect();
  
  try {
    const userId = req.user.id;
    const { orderId, phoneNumber } = req.body;

    // Validate input
    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required'
      });
    }

    // Get order details
    const orderResult = await client.query(
      `SELECT o.*, 
              (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o 
       WHERE o.id = $1 AND o.user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    // Check if order is already paid
    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Check if order is cancelled
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot process payment for cancelled order'
      });
    }

    await client.query('BEGIN');

    // Update order with payment attempt
    await client.query(
      `UPDATE orders 
       SET payment_status = 'processing',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [orderId]
    );

    // Process payment with WaafiPay
    const paymentResult = await waafipayService.purchase({
      phoneNumber,
      amount: order.total,
      currency: 'USD',
      referenceId: order.order_number,
      description: `Payment for order #${order.order_number}`
    });

    if (paymentResult.success) {
      // Payment successful - update order
      await client.query(
        `UPDATE orders 
         SET payment_status = 'paid',
             payment_transaction_id = $1,
             status = 'processing',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [paymentResult.transactionId, orderId]
      );

      // Log payment in order status history
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
         VALUES ($1, 'processing', $2, $3)`,
        [orderId, `Payment received via WaafiPay. Transaction ID: ${paymentResult.transactionId}`, 'Customer']
      );

      // Create transaction record
      await client.query(
        `INSERT INTO transactions (
          order_id, user_id, type, amount, currency, status,
          payment_method, transaction_reference, provider_response
        ) VALUES ($1, $2, 'payment', $3, 'USD', 'completed', 'waafipay', $4, $5)`,
        [
          orderId,
          userId,
          order.total,
          paymentResult.transactionId,
          JSON.stringify(paymentResult)
        ]
      );

      await client.query('COMMIT');

      return res.json({
        success: true,
        message: 'Payment successful',
        data: {
          orderId,
          orderNumber: order.order_number,
          transactionId: paymentResult.transactionId,
          amount: order.total,
          status: 'paid'
        }
      });
    } else {
      // Payment failed - update order
      await client.query(
        `UPDATE orders 
         SET payment_status = 'failed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      // Log failed payment attempt
      await client.query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
         VALUES ($1, 'pending', $2, $3)`,
        [orderId, `Payment failed: ${paymentResult.message}`, 'Customer']
      );

      await client.query('COMMIT');

      return res.status(400).json({
        success: false,
        message: paymentResult.message || 'Payment failed',
        errorCode: paymentResult.errorCode
      });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Payment processing error:', error);
    next(error);
  } finally {
    client.release();
  }
});

/**
 * POST /api/customer/payments/hpp/initiate
 * Initiate HPP (Hosted Payment Page) payment - opens WaafiPay's secure page
 * This bypasses the pre-balance check issue
 */
router.post('/hpp/initiate', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId, phoneNumber } = req.body;

    if (!orderId || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Order ID and phone number are required'
      });
    }

    // Get order details
    const orderResult = await query(
      `SELECT * FROM orders WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = orderResult.rows[0];

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Order is already paid'
      });
    }

    // Get base URL for callbacks
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    
    // Initiate HPP
    const hppResult = await waafipayService.initiateHPP({
      phoneNumber,
      amount: order.total,
      currency: 'USD',
      referenceId: order.order_number,
      description: `Payment for order #${order.order_number}`,
      successUrl: `${baseUrl}/api/customer/payments/hpp/success?orderId=${orderId}`,
      failureUrl: `${baseUrl}/api/customer/payments/hpp/failure?orderId=${orderId}`
    });

    if (hppResult.success) {
      // Update order with HPP order ID
      await query(
        `UPDATE orders 
         SET payment_status = 'processing',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      return res.json({
        success: true,
        message: 'HPP initiated successfully',
        data: {
          hppUrl: hppResult.hppUrl,
          directPaymentLink: hppResult.directPaymentLink,
          waafipayOrderId: hppResult.orderId
        }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: hppResult.message || 'Failed to initiate payment page',
        errorCode: hppResult.errorCode
      });
    }
  } catch (error) {
    console.error('HPP initiation error:', error);
    next(error);
  }
});

/**
 * GET /api/customer/payments/hpp/success
 * HPP success callback - WaafiPay redirects here after successful payment
 */
router.get('/hpp/success', async (req, res, next) => {
  const client = await require('../../config/database').pool.connect();
  
  try {
    const { orderId, transactionId, referenceId } = req.query;

    if (!orderId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?message=Invalid callback`);
    }

    await client.query('BEGIN');

    // Update order as paid
    await client.query(
      `UPDATE orders 
       SET payment_status = 'paid',
           payment_transaction_id = $1,
           status = 'processing',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [transactionId || 'HPP_SUCCESS', orderId]
    );

    // Log in order history
    await client.query(
      `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
       VALUES ($1, 'processing', $2, $3)`,
      [orderId, `Payment received via WaafiPay HPP. Transaction: ${transactionId || 'N/A'}`, 'System']
    );

    await client.query('COMMIT');

    // Redirect to success page in app
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/success?orderId=${orderId}`);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('HPP success callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/error?message=Processing error`);
  } finally {
    client.release();
  }
});

/**
 * GET /api/customer/payments/hpp/failure
 * HPP failure callback - WaafiPay redirects here after failed payment
 */
router.get('/hpp/failure', async (req, res, next) => {
  try {
    const { orderId, errorCode, errorMessage } = req.query;

    if (orderId) {
      await query(
        `UPDATE orders 
         SET payment_status = 'failed',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [orderId]
      );

      await query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
         VALUES ($1, 'pending', $2, $3)`,
        [orderId, `Payment failed via HPP: ${errorMessage || errorCode || 'Unknown error'}`, 'System']
      );
    }

    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed?orderId=${orderId}&error=${encodeURIComponent(errorMessage || 'Payment failed')}`);
  } catch (error) {
    console.error('HPP failure callback error:', error);
    return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/failed`);
  }
});

/**
 * GET /api/customer/payments/status/:orderId
 * Get payment status for an order
 */
router.get('/status/:orderId', authenticate, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const result = await query(
      `SELECT id, order_number, total, payment_status, payment_method, 
              payment_transaction_id, status, created_at
       FROM orders 
       WHERE id = $1 AND user_id = $2`,
      [orderId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = result.rows[0];

    return res.json({
      success: true,
      data: {
        orderId: order.id,
        orderNumber: order.order_number,
        total: order.total,
        paymentStatus: order.payment_status,
        paymentMethod: order.payment_method,
        transactionId: order.payment_transaction_id,
        orderStatus: order.status
      }
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    next(error);
  }
});

module.exports = router;
