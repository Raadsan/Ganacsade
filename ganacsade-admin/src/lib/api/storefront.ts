import { parseImageList, resolveImageUrl } from "@/lib/utils/image-url"

export { resolveImageUrl }

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "http://178.18.241.5:5002/api").replace(/\/+$/, "")

export type StoreProduct = {
  id: string
  slug?: string | null
  name_en: string
  name_so?: string
  name_ar?: string
  description_en?: string | null
  description_so?: string | null
  description_ar?: string | null
  price: string | number
  discount_price?: string | number | null
  flash_sale_price?: string | number | null
  flash_original_price?: string | number | null
  is_flash_sale?: boolean
  discount_percentage?: number | string | null
  flash_start_time?: string | null
  flash_end_time?: string | null
  images?: string[] | string | null
  rating?: string | number | null
  review_count?: number | null
  category_id?: string | number | null
  category_name_en?: string | null
  subcategory_name_en?: string | null
  brand?: string | null
  in_stock?: boolean
  stock_quantity?: number | null
  sku?: string | null
  is_halal?: boolean | null
}

export type ProductsPagination = {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export type StoreCategory = {
  id: string
  name_en: string
  name_so?: string
  name_ar?: string
  image_url?: string | null
  icon_path?: string | null
  color?: string | null
  product_count?: number
}

export type StoreAdvertisement = {
  id: string
  title: string
  description?: string | null
  imageUrl?: string | null
  targetUrl?: string | null
  placement?: string | null
}

type ApiResponse<T> = {
  success: boolean
  data?: T
  message?: string
}

async function storefrontFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
    })
    if (!response.ok) return null
    const json = (await response.json()) as ApiResponse<T>
    return json.success ? (json.data ?? null) : null
  } catch {
    return null
  }
}

export function parseProductImages(images?: string[] | string | null): string[] {
  return parseImageList(images)
}

export function getProductName(product: StoreProduct) {
  return product.name_en || product.name_so || product.name_ar || "Product"
}

export function slugifyProductName(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function getProductSlug(product: StoreProduct) {
  if (product.slug) return product.slug
  const fromName = slugifyProductName(getProductName(product))
  return fromName || product.id
}

export function getProductUrl(product: StoreProduct) {
  return `/products/${getProductSlug(product)}`
}

export function getProductDescription(product: StoreProduct) {
  return product.description_en || product.description_so || product.description_ar || ""
}

export function getProductPrice(product: StoreProduct) {
  const base = Number(product.price) || 0
  if (product.is_flash_sale && product.flash_sale_price != null) {
    return {
      price: Number(product.flash_sale_price) || base,
      original: Number(product.flash_original_price) || base,
      onSale: true,
    }
  }
  if (product.discount_price != null && Number(product.discount_price) < base) {
    return {
      price: Number(product.discount_price),
      original: base,
      onSale: true,
    }
  }
  return { price: base, original: base, onSale: false }
}

export async function fetchCategories() {
  const data = await storefrontFetch<{ categories: StoreCategory[] }>("/customer/categories")
  return data?.categories || []
}

export async function fetchFeaturedProducts(limit = 8) {
  const data = await storefrontFetch<{ products: StoreProduct[] }>(
    `/customer/products/featured?limit=${limit}`
  )
  return data?.products || []
}

export async function fetchFlashSaleProducts(limit = 8) {
  const data = await storefrontFetch<{ products: StoreProduct[] }>(
    `/customer/products/flash-sales?limit=${limit}`
  )
  return data?.products || []
}

export async function fetchAdvertisements(placement?: string) {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : ""
  const data = await storefrontFetch<{ advertisements: StoreAdvertisement[] }>(
    `/customer/advertisements${query}`
  )
  return data?.advertisements || []
}

export async function fetchProductCount() {
  const data = await storefrontFetch<{
    products: StoreProduct[]
    pagination: { total: number }
  }>("/customer/products?limit=1&page=1")
  return data?.pagination?.total ?? 0
}

export async function fetchProducts(params?: {
  search?: string
  category?: string | number
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}) {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.category) query.set("category", String(params.category))
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))
  if (params?.sortBy) query.set("sortBy", params.sortBy)
  if (params?.sortOrder) query.set("sortOrder", params.sortOrder)

  const qs = query.toString()
  const data = await storefrontFetch<{
    products: StoreProduct[]
    pagination: ProductsPagination
  }>(`/customer/products${qs ? `?${qs}` : ""}`)

  return {
    products: data?.products || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
  }
}

export async function fetchProductBySlug(slug: string) {
  const data = await storefrontFetch<{ product: StoreProduct }>(`/customer/products/${slug}`)
  return data?.product || null
}

/** @deprecated use fetchProductBySlug */
export async function fetchProductById(id: string) {
  return fetchProductBySlug(id)
}

export type StoreReview = {
  id: string
  rating: number
  title?: string | null
  comment?: string | null
  isVerifiedPurchase?: boolean
  isFeatured?: boolean
  helpfulCount?: number
  createdAt?: string
  user?: {
    displayName?: string
    initials?: string
  }
}

export type ProductReviewsData = {
  reviews: StoreReview[]
  summary?: {
    averageRating?: number
    totalReviews?: number
  }
}

export async function fetchProductReviews(productId: string, limit = 10) {
  const data = await storefrontFetch<ProductReviewsData>(
    `/customer/reviews/product/${productId}?limit=${limit}`
  )
  return {
    reviews: data?.reviews || [],
    summary: data?.summary,
  }
}

export async function fetchHomepageData() {
  const [
    categories,
    featuredProducts,
    flashSaleProducts,
    bannerAds,
    sliderAds,
    productCount,
  ] = await Promise.all([
    fetchCategories(),
    fetchFeaturedProducts(8),
    fetchFlashSaleProducts(8),
    fetchAdvertisements("home_banner"),
    fetchAdvertisements("home_slider"),
    fetchProductCount(),
  ])

  return {
    categories,
    featuredProducts,
    flashSaleProducts,
    advertisements: bannerAds,
    sliderAdvertisements: sliderAds,
    productCount,
    categoryCount: categories.length,
    flashSaleCount: flashSaleProducts.length,
  }
}
