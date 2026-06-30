const DATA_PACKAGE_SKU = 'SYS-DATA-PACKAGE';

export function parseDataPackageNotes(customerNotes) {
  if (!customerNotes) return null;

  try {
    const parsed = typeof customerNotes === 'string'
      ? JSON.parse(customerNotes)
      : customerNotes;

    if (parsed?.type !== 'data_package') return null;
    return parsed;
  } catch {
    return null;
  }
}

export function extractDataPackageFields(order) {
  const firstItem = order.order_items?.[0] || null;
  const notes = parseDataPackageNotes(order.customer_notes);

  return {
    package_name: firstItem?.package_name || notes?.packageName || null,
    provider_name: firstItem?.provider_name || notes?.providerName || null,
    recipient_phone: firstItem?.recipient_phone
      || notes?.recipientPhone
      || order.shipping_address?.recipientPhone
      || null,
    package_duration: firstItem?.package_duration || notes?.packageDuration || null,
    package_data: firstItem?.package_data || notes?.packageData || null,
  };
}

export async function getOrCreateDataPackageProductId(tx) {
  const existing = await tx.products.findFirst({
    where: { sku: DATA_PACKAGE_SKU, deleted_at: null },
    select: { id: true },
  });

  if (existing) return existing.id;

  const category = await tx.categories.findFirst({
    where: {
      OR: [
        { name_en: { contains: 'Internet', mode: 'insensitive' } },
        { is_active: true },
      ],
    },
    select: { id: true },
    orderBy: { display_order: 'asc' },
  });

  if (!category) {
    throw new Error('No category available to create data package product');
  }

  const product = await tx.products.create({
    data: {
      name_en: 'Data Package',
      name_so: 'Xirmada Xogta',
      name_ar: 'باقة البيانات',
      description_en: 'System product for data package orders',
      category_id: category.id,
      price: 0,
      sku: DATA_PACKAGE_SKU,
      stock_quantity: 999999,
      status: 'active',
    },
    select: { id: true },
  });

  return product.id;
}

export function normalizePaymentMethod(paymentMethod, paymentPhone, transactionId) {
  const methodValue = typeof paymentMethod === 'string'
    ? paymentMethod
    : paymentMethod?.method || 'mobile_money';

  return {
    method: methodValue,
    phone: paymentPhone || paymentMethod?.phone || null,
    transactionId: transactionId || paymentMethod?.transactionId || null,
  };
}
