"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/website/product-card"
import { clientFetchProducts } from "@/lib/api/storefront-client"
import { getProductPrice, type StoreCategory, type StoreProduct } from "@/lib/api/storefront"
import { cn } from "@/lib/utils"

function isOnSale(product: StoreProduct) {
  return getProductPrice(product).onSale || product.is_flash_sale
}

const TABS = [
  { id: "featured", label: "Featured" },
  { id: "sale", label: "Best Sellers" },
  { id: "all", label: "Popular" },
] as const

export function HomeFeaturedTabs({
  featuredProducts,
  saleProducts,
  categories = [],
}: {
  featuredProducts: StoreProduct[]
  saleProducts: StoreProduct[]
  categories?: StoreCategory[]
}) {
  const [active, setActive] = useState<(typeof TABS)[number]["id"]>("featured")
  const [allProducts, setAllProducts] = useState<StoreProduct[]>([])
  const [loading, setLoading] = useState(false)
  const [loadedAll, setLoadedAll] = useState(false)

  const handleTab = async (tab: (typeof TABS)[number]["id"]) => {
    setActive(tab)
    if (tab === "all" && !loadedAll) {
      setLoading(true)
      const result = await clientFetchProducts({ limit: 10 })
      setAllProducts(result.products)
      setLoadedAll(true)
      setLoading(false)
    }
  }

  const products =
    active === "featured"
      ? featuredProducts.slice(0, 6)
      : active === "sale"
        ? saleProducts.slice(0, 6)
        : allProducts.slice(0, 6)

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar categories — like template */}
          {categories.length > 0 ? (
            <aside className="hidden lg:block">
              <CardSidebar categories={categories} />
            </aside>
          ) : null}

          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <h2 className="text-2xl font-bold sm:text-3xl">Featured Products</h2>
              <Button variant="ghost" size="sm" asChild className="gap-1 text-primary">
                <Link href="/service">
                  View All <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="mb-8 inline-flex rounded-full border bg-muted/40 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTab(tab.id)}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-all",
                    active === tab.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge={
                      product.is_flash_sale
                        ? "Flash Sale"
                        : isOnSale(product)
                          ? "Sale"
                          : undefined
                    }
                  />
                ))}
              </div>
            ) : (
              <p className="py-12 text-center text-muted-foreground">No products in this section yet.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function CardSidebar({ categories }: { categories: StoreCategory[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="border-b bg-muted/30 px-4 py-3">
        <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Categories</p>
      </div>
      <nav className="flex flex-col p-2">
        {categories.slice(0, 8).map((cat) => (
          <Link
            key={cat.id}
            href={`/service?category=${cat.id}`}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
          >
            {cat.name_en}
          </Link>
        ))}
      </nav>
      <div className="border-t p-3">
        <Button asChild className="w-full rounded-full" size="sm">
          <Link href="/service">
            Shop Now <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    </div>
  )
}
