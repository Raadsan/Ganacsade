"use client"

import { useCallback, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Loader2, Package, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvertisementBanner } from "@/components/website/advertisement-banner"
import { ProductCard } from "@/components/website/product-card"
import { clientFetchProducts } from "@/lib/api/storefront-client"
import type { StoreAdvertisement, StoreCategory, StoreProduct } from "@/lib/api/storefront"

export function ProductsCatalog({
  categories,
  initialProducts,
  advertisements,
  initialCategory,
}: {
  categories: StoreCategory[]
  initialProducts: StoreProduct[]
  advertisements: StoreAdvertisement[]
  initialCategory?: string
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeCategory, setActiveCategory] = useState(initialCategory || "all")
  const [products, setProducts] = useState(initialProducts)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")

  const loadProducts = useCallback(
    async (category: string, query?: string) => {
      setLoading(true)
      const result = await clientFetchProducts({
        category: category === "all" ? undefined : category,
        search: query || undefined,
        limit: 48,
      })
      setProducts(result.products)
      setLoading(false)
    },
    []
  )

  useEffect(() => {
    const cat = searchParams.get("category") || "all"
    setActiveCategory(cat)
    loadProducts(cat, search)
  }, [searchParams, search, loadProducts])

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }
    router.replace(`/service${params.toString() ? `?${params.toString()}` : ""}`, {
      scroll: false,
    })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput.trim())
  }

  return (
    <div className="space-y-8">
      {advertisements.length > 0 ? (
        <AdvertisementBanner advertisements={advertisements} />
      ) : null}

      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="pl-9"
        />
      </form>

      <Tabs value={activeCategory} onValueChange={handleCategoryChange}>
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
          <TabsTrigger
            value="all"
            className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            All
          </TabsTrigger>
          {categories.map((cat) => (
            <TabsTrigger
              key={cat.id}
              value={String(cat.id)}
              className="rounded-full border data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              {cat.name_en}
              {cat.product_count != null ? ` (${cat.product_count})` : ""}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : products.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              badge={
                product.is_flash_sale
                  ? product.discount_percentage
                    ? `-${Math.round(Number(product.discount_percentage))}%`
                    : "Flash Sale"
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-muted-foreground">
          <Package className="mx-auto mb-4 h-12 w-12" />
          <p className="font-medium text-foreground">No products found</p>
          <p className="mt-1 text-sm">Try a different category or search term.</p>
        </div>
      )}
    </div>
  )
}
