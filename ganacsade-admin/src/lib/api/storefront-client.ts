import type { StoreAdvertisement, StoreProduct, ProductsPagination } from "./storefront"
import { getApiUrl } from "./url"

async function clientFetch<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${getApiUrl()}${path}`)
    if (!response.ok) return null
    const json = await response.json()
    return json.success ? (json.data ?? null) : null
  } catch {
    return null
  }
}

export async function clientFetchProducts(params?: {
  search?: string
  category?: string | number
  page?: number
  limit?: number
}) {
  const query = new URLSearchParams()
  if (params?.search) query.set("search", params.search)
  if (params?.category) query.set("category", String(params.category))
  if (params?.page) query.set("page", String(params.page))
  if (params?.limit) query.set("limit", String(params.limit))

  const qs = query.toString()
  const data = await clientFetch<{
    products: StoreProduct[]
    pagination: ProductsPagination
  }>(`/customer/products${qs ? `?${qs}` : ""}`)

  return {
    products: data?.products || [],
    pagination: data?.pagination || { page: 1, limit: 20, total: 0, totalPages: 0, hasMore: false },
  }
}

export async function recordAdvertisementView(id: string) {
  try {
    await fetch(`${getApiUrl()}/customer/advertisements/${id}/view`, { method: "POST" })
  } catch {
    // non-blocking
  }
}

export async function recordAdvertisementClick(id: string) {
  try {
    await fetch(`${getApiUrl()}/customer/advertisements/${id}/click`, { method: "POST" })
  } catch {
    // non-blocking
  }
}

export type { StoreAdvertisement, StoreProduct }
