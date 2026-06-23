import express from 'express';
import { authenticate } from '../../middlewares/auth.js';
import {
  getPaymentStatus,
  handleHppFailure,
  handleHppSuccess,
  initiateHppPayment,
  processDirectPayment,
  processOrderPayment,
} from '../../controllers/customer/paymentsController.js';

const router = express.Router();

/**
 * POST /api/customer/payments/process-direct
 * Process payment directly without creating order first
 * Payment first, order creation after success
 * Supports: waafipay, edahab
 */
router.post('/process-direct', authenticate, processDirectPayment);

/**
 * POST /api/customer/payments/process
 * Process payment for an order using WaafiPay
 */
router.post('/process', authenticate, processOrderPayment);

/**
 * POST /api/customer/payments/hpp/initiate
 * Initiate HPP (Hosted Payment Page) payment - opens WaafiPay's secure page
 * This bypasses the pre-balance check issue
 */
router.post('/hpp/initiate', authenticate, initiateHppPayment);

/**
 * GET /api/customer/payments/hpp/success
 * HPP success callback - WaafiPay redirects here after successful payment
 */
router.get('/hpp/success', handleHppSuccess);

/**
 * GET /api/customer/payments/hpp/failure
 * HPP failure callback - WaafiPay redirects here after failed payment
 */
router.get('/hpp/failure', handleHppFailure);

/**
 * GET /api/customer/payments/status/:orderId
 * Get payment status for an order
 */
router.get('/status/:orderId', authenticate, getPaymentStatus);

export default router;
