import { Order } from "@/types"
import { formatDate, formatFixedNumber, toNumber } from "./format"

type ExportableOrder = Order | Record<string, unknown>

function parseJsonField<T extends Record<string, unknown>>(value: unknown, fallback: T): T {
  if (value == null) return fallback
  if (typeof value === 'object') return value as T
  try {
    return JSON.parse(String(value)) as T
  } catch {
    return fallback
  }
}

function normalizeOrder(order: ExportableOrder) {
  const o = order as Record<string, unknown>
  const shippingAddress = parseJsonField<Record<string, unknown>>(
    o.shippingAddress ?? o.shipping_address,
    {}
  )
  const paymentMethod = parseJsonField<Record<string, unknown>>(
    o.paymentMethod ?? o.payment_method,
    { displayName: 'N/A' }
  )
  const rawItems = (o.items ?? o.order_items ?? []) as Record<string, unknown>[]

  const items = rawItems.map((item) => {
    const product = parseJsonField<Record<string, unknown>>(item.product, {})
    return {
      productName: String(
        product.name ?? item.product_name ?? item.productName ?? 'Product'
      ),
      sku: String(product.sku ?? item.product_sku ?? item.sku ?? 'N/A'),
      brand: String(product.brand ?? product.brand_name ?? item.brand ?? 'N/A'),
      quantity: toNumber(item.quantity, 1),
      unitPrice: toNumber(item.unitPrice ?? item.unit_price),
      discountAmount: toNumber(item.discountAmount ?? item.discount_amount),
    }
  })

  return {
    orderNumber: String(o.orderNumber ?? o.order_number ?? ''),
    customerName: String(
      o.customer_name ??
        shippingAddress.fullName ??
        shippingAddress.full_name ??
        'N/A'
    ),
    phone: String(
      o.customer_phone ??
        shippingAddress.phoneNumber ??
        shippingAddress.phone_number ??
        ''
    ),
    userId: String(o.userId ?? o.user_id ?? ''),
    status: String(o.status ?? ''),
    paymentStatus: String(o.paymentStatus ?? o.payment_status ?? ''),
    paymentMethodDisplay: String(
      paymentMethod.displayName ?? paymentMethod.display_name ?? 'N/A'
    ),
    subtotal: toNumber(o.subtotal),
    tax: toNumber(o.tax),
    shipping: toNumber(o.shipping),
    discount: toNumber(o.discount),
    total: toNumber(o.total),
    items,
    itemsCount: items.length > 0 ? items.length : toNumber(o.item_count ?? o.items_count),
    createdAt: o.createdAt ?? o.created_at,
    city: String(shippingAddress.city ?? ''),
    country: String(shippingAddress.country ?? ''),
    trackingNumber: String(o.trackingNumber ?? o.tracking_number ?? 'N/A'),
  }
}

export function exportOrdersToCSV(orders: ExportableOrder[], filename: string = "orders-export.csv") {
  const headers = [
    "Order Number",
    "Customer Name",
    "Phone",
    "Email/ID",
    "Status",
    "Payment Status",
    "Payment Method",
    "Subtotal",
    "Tax",
    "Shipping",
    "Discount",
    "Total",
    "Items Count",
    "Order Date",
    "City",
    "Country",
    "Tracking Number",
  ]

  const rows = orders.map((order) => {
    const o = normalizeOrder(order)
    return [
      o.orderNumber,
      o.customerName,
      o.phone,
      o.userId,
      o.status.replace(/_/g, ' ').toUpperCase(),
      o.paymentStatus.toUpperCase(),
      o.paymentMethodDisplay,
      formatFixedNumber(o.subtotal),
      formatFixedNumber(o.tax),
      formatFixedNumber(o.shipping),
      formatFixedNumber(o.discount),
      formatFixedNumber(o.total),
      o.itemsCount,
      formatDate(o.createdAt as string | Date | undefined),
      o.city,
      o.country,
      o.trackingNumber,
    ]
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function exportOrdersDetailed(orders: ExportableOrder[], filename: string = "orders-detailed-export.csv") {
  const headers = [
    "Order Number",
    "Order Date",
    "Customer Name",
    "Phone",
    "Status",
    "Payment Status",
    "Payment Method",
    "Product Name",
    "Product SKU",
    "Brand",
    "Quantity",
    "Unit Price",
    "Discount",
    "Line Total",
    "Order Subtotal",
    "Order Tax",
    "Order Shipping",
    "Order Discount",
    "Order Total",
    "Shipping City",
    "Shipping Country",
  ]

  const rows: string[][] = []

  orders.forEach((order) => {
    const o = normalizeOrder(order)
    const lineItems = o.items.length > 0
      ? o.items
      : [{
          productName: 'N/A',
          sku: 'N/A',
          brand: 'N/A',
          quantity: 0,
          unitPrice: 0,
          discountAmount: 0,
        }]

    lineItems.forEach((item, index) => {
      const lineTotal = item.unitPrice * item.quantity - item.discountAmount
      rows.push([
        o.orderNumber,
        formatDate(o.createdAt as string | Date | undefined),
        o.customerName,
        o.phone,
        o.status.replace(/_/g, ' ').toUpperCase(),
        o.paymentStatus.toUpperCase(),
        o.paymentMethodDisplay,
        item.productName,
        item.sku,
        item.brand,
        String(item.quantity),
        formatFixedNumber(item.unitPrice),
        formatFixedNumber(item.discountAmount),
        formatFixedNumber(lineTotal),
        index === 0 ? formatFixedNumber(o.subtotal) : '',
        index === 0 ? formatFixedNumber(o.tax) : '',
        index === 0 ? formatFixedNumber(o.shipping) : '',
        index === 0 ? formatFixedNumber(o.discount) : '',
        index === 0 ? formatFixedNumber(o.total) : '',
        o.city,
        o.country,
      ])
    })
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
