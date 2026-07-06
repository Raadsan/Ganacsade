import { Product } from "@/types"
import { formatFixedNumber, toNumber } from "./format"

type ExportableProduct = Product | Record<string, unknown>

function normalizeProduct(product: ExportableProduct) {
  const p = product as Record<string, unknown>

  return {
    sku: String(p.sku ?? ''),
    name: String(p.name ?? p.name_en ?? ''),
    nameAr: String(p.nameAr ?? p.name_ar ?? ''),
    nameSo: String(p.nameSo ?? p.name_so ?? ''),
    brand: String(p.brand ?? p.brand_name ?? 'N/A'),
    categoryId: String(p.categoryId ?? p.category_id ?? ''),
    price: toNumber(p.price),
    discountPrice:
      p.discountPrice !== undefined && p.discountPrice !== null
        ? toNumber(p.discountPrice)
        : p.discount_price !== undefined && p.discount_price !== null
          ? toNumber(p.discount_price)
          : null,
    stockQuantity: toNumber(p.stockQuantity ?? p.stock_quantity),
    status: String(p.status ?? 'active'),
    inStock: p.inStock !== undefined ? Boolean(p.inStock) : p.in_stock !== false,
    isFeatured: Boolean(p.isFeatured ?? p.is_featured),
    isHalal: Boolean(p.isHalal ?? p.is_halal),
    rating: toNumber(p.rating),
    reviewCount: toNumber(p.reviewCount ?? p.review_count),
    tags: Array.isArray(p.tags) ? (p.tags as string[]) : [],
  }
}

export function exportProductsToCSV(products: ExportableProduct[], filename: string = "products-export.csv") {
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

  const rows = products.map((product) => {
    const p = normalizeProduct(product)
    return [
      p.sku,
      p.name,
      p.nameAr,
      p.nameSo,
      p.brand,
      p.categoryId,
      formatFixedNumber(p.price),
      p.discountPrice !== null ? formatFixedNumber(p.discountPrice) : '',
      p.stockQuantity,
      p.status.toUpperCase(),
      p.inStock ? 'Yes' : 'No',
      p.isFeatured ? 'Yes' : 'No',
      p.isHalal ? 'Yes' : 'No',
      formatFixedNumber(p.rating, 1),
      p.reviewCount,
      p.tags.join('; '),
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
