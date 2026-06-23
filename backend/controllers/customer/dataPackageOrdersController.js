import prisma from '../../lib/config/prisma.js';

function generateDataPackageOrderNumber() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `DP${timestamp}${random}`;
}

export const createDataPackageOrder = async (req, res) => {
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

    if (!packageId || !packageName || !providerId || !providerName || !amount || !recipientPhone) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
      });
    }

    const orderNumber = generateDataPackageOrderNumber();

    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.orders.create({
        data: {
          user_id: userId,
          order_number: orderNumber,
          subtotal: amount,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: amount,
          status: 'delivered',
          payment_status: 'completed',
          payment_transaction_id: transactionId || null,
          shipping_address: { recipientPhone },
          payment_method: { method: paymentMethod || 'mobile_money', phone: paymentPhone || null },
          customer_notes: JSON.stringify({
            type: 'data_package',
            packageId,
            packageName,
            providerId,
            providerName,
            recipientPhone,
            paymentPhone: paymentPhone || null,
            packageDuration: packageDuration || null,
            packageData: packageData || null,
          }),
          notes: `Data package: ${packageName} for ${recipientPhone}`,
          order_type: 'data_package',
        },
      });

      await tx.order_status_history.create({
        data: {
          order_id: createdOrder.id,
          status: 'delivered',
          notes: 'Data package delivered successfully',
          updated_by_name: 'System',
        },
      });

      return createdOrder;
    });

    return res.status(201).json({
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
    return res.status(500).json({
      success: false,
      message: 'Failed to create data package order',
      error: error.message,
    });
  }
};
