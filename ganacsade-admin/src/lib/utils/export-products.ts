import { Product } from "@/types"
import { formatCurrency } from "./format"

export function exportProductsToCSV(products: Product[], filename: string = "products-export.csv") {
  // Define CSV headers
  const headers = [
    "SKU",
    "Name",
    "Name (Arabic)",
    "Name (Somali)",
    "Brand",
    "Category ID",
    "Price",
    "Discount Price",
    "Stock Quantity",
    "Status",
    "In Stock",
    "Is Featured",
    "Is Halal",
    "Rating",
    "Review Count",
    "Tags",
  ]

  // Convert products to CSV rows
  const rows = products.map(product => [
    product.sku,
    product.name,
    product.nameAr,
    product.nameSo,
    product.brand || 'N/A',
    product.categoryId,
    product.price.toFixed(2),
    product.discountPrice ? product.discountPrice.toFixed(2) : '',
    product.stockQuantity,
    product.status.toUpperCase(),
    product.inStock ? 'Yes' : 'No',
    product.isFeatured ? 'Yes' : 'No',
    product.isHalal ? 'Yes' : 'No',
    product.rating.toFixed(1),
    product.reviewCount,
    product.tags.join('; '),
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
