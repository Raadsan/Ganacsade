import type { Metadata } from "next"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { ProductsCatalog } from "@/components/website/products-catalog"
import {
  fetchAdvertisements,
  fetchCategories,
  fetchProducts,
} from "@/lib/api/storefront"

export const metadata: Metadata = {
  title: "Shop — All Products",
  description: "Browse all GANACSADE products by category",
}

export default async function ServicePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>
}) {
  const params = await searchParams
  const category = params.category

  const [categories, { products }, advertisements] = await Promise.all([
    fetchCategories(),
    fetchProducts({
      category: category && category !== "all" ? category : undefined,
      limit: 48,
    }),
    fetchAdvertisements("category_page"),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">All Products</h1>
        <p className="mt-2 text-muted-foreground">
          Browse our full catalog — same products as the mobile app
        </p>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ProductsCatalog
          categories={categories}
          initialProducts={products}
          advertisements={advertisements}
          initialCategory={category}
        />
      </Suspense>
    </div>
  )
}
