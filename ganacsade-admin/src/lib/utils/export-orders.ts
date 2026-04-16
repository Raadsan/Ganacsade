import { Order } from "@/types"
import { formatCurrency, formatDate } from "./format"

export function exportOrdersToCSV(orders: Order[], filename: string = "orders-export.csv") {
  // Define CSV headers
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

  // Convert orders to CSV rows
  const rows = orders.map(order => [
    order.orderNumber,
    order.shippingAddress.fullName,
    order.shippingAddress.phoneNumber,
    order.userId,
    order.status.replace(/_/g, ' ').toUpperCase(),
    order.paymentStatus.toUpperCase(),
    order.paymentMethod.displayName,
    order.subtotal.toFixed(2),
    order.tax.toFixed(2),
    order.shipping.toFixed(2),
    order.discount.toFixed(2),
    order.total.toFixed(2),
    order.items.length,
    formatDate(order.createdAt),
    order.shippingAddress.city,
    order.shippingAddress.country,
    order.trackingNumber || 'N/A',
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape cells that contain commas or quotes
      const cellStr = String(cell)
      if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
        return `"${cellStr.replace(/"/g, '""')}"`
      }
      return cellStr
    }).join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function exportOrdersDetailed(orders: Order[], filename: string = "orders-detailed-export.csv") {
  // Define CSV headers for detailed export (with line items)
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

  // Create rows with one row per order item
  const rows: string[][] = []
  
  orders.forEach(order => {
    order.items.forEach((item, index) => {
      rows.push([
        order.orderNumber,
        formatDate(order.createdAt),
        order.shippingAddress.fullName,
        order.shippingAddress.phoneNumber,
        order.status.replace(/_/g, ' ').toUpperCase(),
        order.paymentStatus.toUpperCase(),
        order.paymentMethod.displayName,
        item.product.name,
        item.product.sku,
        item.product.brand || 'N/A',
        item.quantity.toString(),
        item.unitPrice.toFixed(2),
        item.discountAmount.toFixed(2),
        (item.unitPrice * item.quantity - item.discountAmount).toFixed(2),
        // Only show order totals on first item
        index === 0 ? order.subtotal.toFixed(2) : '',
        index === 0 ? order.tax.toFixed(2) : '',
        index === 0 ? order.shipping.toFixed(2) : '',
        index === 0 ? order.discount.toFixed(2) : '',
        index === 0 ? order.total.toFixed(2) : '',
        order.shippingAddress.city,
        order.shippingAddress.country,
      ])
    })
  })

  // Combine headers and rows
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

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
