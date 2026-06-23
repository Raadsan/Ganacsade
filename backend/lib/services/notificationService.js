import prisma from '../config/prisma.js';
import { sendPushToUser } from './fcmService.js';

const parseShippingAddress = (shippingAddress) => {
  if (!shippingAddress) return {};
  if (typeof shippingAddress === 'string') {
    try {
      return JSON.parse(shippingAddress);
    } catch {
      return {};
    }
  }
  return shippingAddress;
};

const formatDateTime = (value) => {
  if (!value) return '';
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const createNotification = async ({
  userId,
  title,
  body,
  type = 'general',
  data = {},
}) => {
  if (!userId || !title || !body) return null;

  try {
    const notification = await prisma.notifications.create({
      data: {
        user_id: userId,
        title,
        body,
        type,
        data,
      },
    });

    await sendPushToUser(userId, { title, body, data: { type, ...data } });

    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error?.message || error);
    return null;
  }
};

export const sendOrderAdvanceNotifications = async ({
  order,
  deliveryPerson,
  pickupTimeStart,
  pickupTimeEnd,
  description,
  newStatus,
}) => {
  const shipping = parseShippingAddress(order.shipping_address);
  const customerName = `${order.users?.first_name || shipping.fullName || ''} ${order.users?.last_name || ''}`.trim()
    || 'Customer';
  const customerPhone = order.users?.phone_number || shipping.phoneNumber || shipping.phone || '';
  const customerEmail = order.users?.email || '';
  const addressLine = [
    shipping.addressLine1 || shipping.address_line1 || shipping.street,
    shipping.city,
    shipping.state,
  ].filter(Boolean).join(', ');
  const pickupWindow = `${formatDateTime(pickupTimeStart)} - ${formatDateTime(pickupTimeEnd)}`;
  const itemsSummary = (order.order_items || [])
    .map((item) => `${item.quantity}x ${item.product_name}`)
    .join(', ');

  const customerLines = [
    `Dalab: ${order.order_number}`,
    `Xaalad: ${newStatus}`,
    deliveryPerson?.name ? `Qofka keenaya: ${deliveryPerson.name}` : null,
    deliveryPerson?.phone ? `Telefoon: ${deliveryPerson.phone}` : null,
    pickupTimeStart && pickupTimeEnd ? `Waqtiga la soo qaado: ${pickupWindow}` : null,
    description ? `Faahfaahin: ${description}` : null,
  ].filter(Boolean);

  await createNotification({
    userId: order.user_id,
    title: 'Dalabkaaga waa la cusbooneysiiyay',
    body: customerLines.join('\n'),
    type: 'order_status',
    data: {
      orderId: order.id,
      orderNumber: order.order_number,
      status: newStatus,
      deliveryPersonName: deliveryPerson?.name || null,
      deliveryPersonPhone: deliveryPerson?.phone || null,
      pickupWindow,
      customerPhone,
      customerEmail,
    },
  });

  if (!deliveryPerson?.user_id) return;

  const deliveryLines = [
    `Dalab: ${order.order_number}`,
    `Macmiil: ${customerName}`,
    customerPhone ? `Wac: ${customerPhone}` : null,
    customerEmail ? `Email: ${customerEmail}` : null,
    addressLine ? `Cinwaan: ${addressLine}` : null,
    itemsSummary ? `Alaabta: ${itemsSummary}` : null,
    `Qiimaha: $${Number(order.total || 0).toFixed(2)}`,
    pickupTimeStart && pickupTimeEnd ? `Waqtiga la soo qaado: ${pickupWindow}` : null,
    description ? `Faahfaahin: ${description}` : null,
  ].filter(Boolean);

  await createNotification({
    userId: deliveryPerson.user_id,
    title: 'Dalab cusub ayaa laguu xilsaaray',
    body: deliveryLines.join('\n'),
    type: 'order_assigned',
    data: {
      orderId: order.id,
      orderNumber: order.order_number,
      status: newStatus,
      customerName,
      customerPhone,
      customerEmail,
      address: addressLine,
      itemsSummary,
      total: Number(order.total || 0),
      pickupWindow,
      description: description || null,
    },
  });
};
