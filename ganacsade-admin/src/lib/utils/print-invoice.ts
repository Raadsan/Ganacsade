import { Order } from "@/types"
import { formatCurrency, formatDate } from "./format"

export function printInvoice(order: Order) {
  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  
  if (!printWindow) {
    alert("Please allow popups to print the invoice")
    return
  }

  // Generate invoice HTML
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice #${order.orderNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            padding: 40px;
            color: #333;
            line-height: 1.6;
          }
          
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
          }
          
          .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #2E7D32;
          }
          
          .company-info h1 {
            color: #2E7D32;
            font-size: 32px;
            margin-bottom: 5px;
          }
          
          .company-info p {
            color: #666;
            font-size: 14px;
          }
          
          .invoice-title {
            text-align: right;
          }
          
          .invoice-title h2 {
            font-size: 36px;
            color: #2E7D32;
            margin-bottom: 10px;
          }
          
          .invoice-title p {
            font-size: 14px;
            color: #666;
          }
          
          .invoice-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          
          .detail-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
          }
          
          .detail-section h3 {
            font-size: 14px;
            color: #2E7D32;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          
          .detail-section p {
            font-size: 14px;
            margin-bottom: 5px;
          }
          
          .detail-section .label {
            color: #666;
            display: inline-block;
            width: 120px;
          }
          
          .detail-section .value {
            font-weight: 600;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .items-table thead {
            background: #2E7D32;
            color: white;
          }
          
          .items-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .items-table td {
            padding: 15px 12px;
            border-bottom: 1px solid #e0e0e0;
            font-size: 14px;
          }
          
          .items-table tbody tr:hover {
            background: #f8f9fa;
          }
          
          .item-description {
            color: #666;
            font-size: 12px;
            margin-top: 5px;
            line-height: 1.4;
          }
          
          .item-meta {
            color: #999;
            font-size: 11px;
            margin-top: 5px;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          .summary-table {
            width: 300px;
            margin-left: auto;
            margin-bottom: 40px;
          }
          
          .summary-table tr {
            border-bottom: 1px solid #e0e0e0;
          }
          
          .summary-table td {
            padding: 10px 0;
            font-size: 14px;
          }
          
          .summary-table .label {
            color: #666;
          }
          
          .summary-table .value {
            text-align: right;
            font-weight: 600;
          }
          
          .summary-table .discount {
            color: #2E7D32;
          }
          
          .summary-table .total-row {
            border-top: 2px solid #2E7D32;
            border-bottom: 2px solid #2E7D32;
          }
          
          .summary-table .total-row td {
            padding: 15px 0;
            font-size: 18px;
            font-weight: bold;
            color: #2E7D32;
          }
          
          .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 2px solid #e0e0e0;
            text-align: center;
          }
          
          .footer p {
            color: #666;
            font-size: 12px;
            margin-bottom: 5px;
          }
          
          .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          
          .status-completed {
            background: #d4edda;
            color: #155724;
          }
          
          .status-pending {
            background: #fff3cd;
            color: #856404;
          }
          
          .status-processing {
            background: #cce5ff;
            color: #004085;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <!-- Header -->
          <div class="invoice-header">
            <div class="company-info">
              <h1>GANACSADE</h1>
              <p>Premium Somali E-commerce Platform</p>
              <p>Mogadishu, Somalia</p>
              <p>Phone: +252 61 234 5678</p>
              <p>Email: info@ganacsade.com</p>
            </div>
            <div class="invoice-title">
              <h2>INVOICE</h2>
              <p><strong>Invoice #:</strong> ${order.orderNumber}</p>
              <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><span class="status-badge status-${order.paymentStatus}">${order.paymentStatus.toUpperCase()}</span></p>
            </div>
          </div>
          
          <!-- Invoice Details -->
          <div class="invoice-details">
            <div class="detail-section">
              <h3>Bill To</h3>
              <p><strong>${order.shippingAddress.fullName}</strong></p>
              <p>${order.shippingAddress.phoneNumber}</p>
              <p>${order.shippingAddress.addressLine1}</p>
              ${order.shippingAddress.addressLine2 ? `<p>${order.shippingAddress.addressLine2}</p>` : ''}
              <p>${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}</p>
              <p>${order.shippingAddress.country}</p>
            </div>
            
            <div class="detail-section">
              <h3>Payment Information</h3>
              <p><span class="label">Payment Method:</span> <span class="value">${order.paymentMethod.displayName}</span></p>
              <p><span class="label">Payment Status:</span> <span class="value">${order.paymentStatus.toUpperCase()}</span></p>
              <p><span class="label">Order Status:</span> <span class="value">${order.status.replace(/_/g, ' ').toUpperCase()}</span></p>
              ${order.trackingNumber ? `<p><span class="label">Tracking #:</span> <span class="value">${order.trackingNumber}</span></p>` : ''}
            </div>
          </div>
          
          <!-- Items Table -->
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50%">Item Description</th>
                <th class="text-center" style="width: 10%">Qty</th>
                <th class="text-right" style="width: 15%">Unit Price</th>
                <th class="text-right" style="width: 10%">Discount</th>
                <th class="text-right" style="width: 15%">Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <div>
                      <strong>${item.product.name}</strong>
                      <div class="item-description">${item.product.description}</div>
                      <div class="item-meta">
                        SKU: ${item.product.sku}
                        ${item.product.brand ? ` | Brand: ${item.product.brand}` : ''}
                        ${item.variant ? ` | Variant: ${item.variant.name}` : ''}
                      </div>
                    </div>
                  </td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                  <td class="text-right">${item.discountAmount > 0 ? formatCurrency(item.discountAmount) : '-'}</td>
                  <td class="text-right"><strong>${formatCurrency(item.unitPrice * item.quantity - item.discountAmount)}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Summary -->
          <table class="summary-table">
            <tr>
              <td class="label">Subtotal:</td>
              <td class="value">${formatCurrency(order.subtotal)}</td>
            </tr>
            ${order.discount > 0 ? `
              <tr>
                <td class="label">Discount:</td>
                <td class="value discount">-${formatCurrency(order.discount)}</td>
              </tr>
            ` : ''}
            <tr>
              <td class="label">Tax:</td>
              <td class="value">${formatCurrency(order.tax)}</td>
            </tr>
            <tr>
              <td class="label">Shipping:</td>
              <td class="value">${formatCurrency(order.shipping)}</td>
            </tr>
            <tr class="total-row">
              <td>TOTAL:</td>
              <td class="value">${formatCurrency(order.total)}</td>
            </tr>
          </table>
          
          ${order.notes ? `
            <div class="detail-section" style="margin-bottom: 40px;">
              <h3>Order Notes</h3>
              <p>${order.notes}</p>
            </div>
          ` : ''}
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Thank you for your business!</strong></p>
            <p>For any questions about this invoice, please contact us at support@ganacsade.com</p>
            <p style="margin-top: 20px; color: #999; font-size: 11px;">
              This is a computer-generated invoice and does not require a signature.
            </p>
          </div>
        </div>
        
        <script>
          // Auto print when page loads
          window.onload = function() {
            window.print();
          }
          
          // Close window after printing
          window.onafterprint = function() {
            window.close();
          }
        </script>
      </body>
    </html>
  `

  // Write to the new window and trigger print
  printWindow.document.write(invoiceHTML)
  printWindow.document.close()
}
