import type { Metadata } from "next"
import { Suspense } from "react"
import { notFound } from "next/navigation"
import { Loader2 } from "lucide-react"
import { ProductDetailView } from "@/components/website/product-detail-view"
import {
  fetchAdvertisements,
  fetchProductBySlug,
  fetchProductReviews,
  fetchProducts,
  getProductName,
} from "@/lib/api/storefront"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)
  if (!product) return { title: "Product Not Found" }
  return {
    title: getProductName(product),
    description: product.description_en || undefined,
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const product = await fetchProductBySlug(slug)

  if (!product) notFound()

  const [relatedResult, advertisements, reviewsData] = await Promise.all([
    product.category_id
      ? fetchProducts({ category: product.category_id, limit: 5 })
      : Promise.resolve({ products: [] }),
    fetchAdvertisements("product_page"),
    fetchProductReviews(product.id, 10),
  ])

  const relatedProducts = relatedResult.products.filter((p) => p.id !== product.id).slice(0, 4)

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <ProductDetailView
        product={product}
        relatedProducts={relatedProducts}
        advertisements={advertisements}
        reviews={reviewsData.reviews}
        reviewCount={reviewsData.summary?.totalReviews ?? product.review_count ?? undefined}
      />
    </Suspense>
  )
}
