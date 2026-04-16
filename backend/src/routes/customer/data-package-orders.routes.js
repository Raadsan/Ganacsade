const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { authenticate } = require('../../middleware/auth');

/**
 * Generate unique order number for data packages
 */
function generateDataPackageOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DP${timestamp}${random}`;
}

/**
 * @route   POST /api/customer/data-package-orders
 * @desc    Create a new data package order after successful payment
 * @access  Private
 */
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      packageId,
      packageName,
      providerId,
      providerName,
      amount,
      recipientPhone,
      paymentPhone,
      paymentMethod,
      transactionId,
      packageDuration,
      packageData,
    } = req.body;

    // Validate required fields
    if (!packageId || !packageName || !providerId || !providerName || !amount || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const orderNumber = generateDataPackageOrderNumber();

    // Start transaction
    await query('BEGIN');

    try {
      // Create order — store data package details in notes field
      const packageDetails = JSON.stringify({
        type: 'data_package',
        packageId,
        packageName,
        providerId,
        providerName,
        recipientPhone,
        paymentPhone: paymentPhone || null,
        packageDuration: packageDuration || null,
        packageData: packageData || null,
      });

      const orderResult = await query(
        `INSERT INTO orders (
          user_id,
          order_number,
          subtotal,
          tax,
          shipping,
          discount,
          total,
          status,
          payment_status,
          payment_transaction_id,
          shipping_address,
          payment_method,
          customer_notes,
          notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING *`,
        [
          userId,
          orderNumber,
          amount,
          0,
          0,
          0,
          amount,
          'delivered',
          'completed',
          transactionId || null,
          JSON.stringify({ recipientPhone }),
          JSON.stringify({ method: paymentMethod || 'mobile_money', phone: paymentPhone || null }),
          packageDetails,
          `Data package: ${packageName} for ${recipientPhone}`,
        ]
      );

      const order = orderResult.rows[0];

      // Add status history
      await query(
        `INSERT INTO order_status_history (order_id, status, notes, updated_by_name)
         VALUES ($1, $2, $3, $4)`,
        [order.id, 'delivered', 'Data package delivered successfully', 'System']
      );

      // Commit transaction
      await query('COMMIT');

      // Return success response
      res.status(201).json({
        success: true,
        message: 'Data package order created successfully',
        data: {
          orderId: order.id,
          orderNumber: order.order_number,
          packageName,
          providerName,
          recipientPhone,
          amount,
          status: 'completed',
        },
      });

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('Error creating data package order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create data package order',
      error: error.message,
    });
  }
});

module.exports = router;
