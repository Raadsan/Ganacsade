"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AdvertisementBanner } from "@/components/website/advertisement-banner"
import { FlashSaleCountdown } from "@/components/website/flash-sale-countdown"
import { ProductCard } from "@/components/website/product-card"
import { ProductPurchaseDialog } from "@/components/website/product-purchase-dialog"
import { ProductReviewsSection } from "@/components/website/product-reviews"
import { SafeImage } from "@/components/website/safe-image"
import { authApi } from "@/lib/api/auth"
import {
  getProductDescription,
  getProductName,
  getProductPrice,
  getProductUrl,
  parseProductImages,
  type StoreAdvertisement,
  type StoreProduct,
  type StoreReview,
} from "@/lib/api/storefront"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

export function ProductDetailView({
  product,
  relatedProducts,
  advertisements,
  reviews,
  reviewCount,
}: {
  product: StoreProduct
  relatedProducts: StoreProduct[]
  advertisements: StoreAdvertisement[]
  reviews: StoreReview[]
  reviewCount?: number
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const images = parseProductImages(product.images)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [purchaseOpen, setPurchaseOpen] = useState(false)

  const name = getProductName(product)
  const description = getProductDescription(product)
  const { price, original, onSale } = getProductPrice(product)
  const rating = Number(product.rating) || 0
  const maxQty = product.stock_quantity ?? 99
  const inStock = product.in_stock !== false
  const totalReviews = reviewCount ?? product.review_count ?? reviews.length

  useEffect(() => {
    if (searchParams.get("buy") !== "1") return
    if (!authApi.isAuthenticated()) return

    setPurchaseOpen(true)
    router.replace(getProductUrl(product), { scroll: false })
  }, [searchParams, product, router])

  const handleBuyNow = () => {
    if (!authApi.isAuthenticated()) {
      const returnUrl = `${getProductUrl(product)}?buy=1`
      router.push(`/login?redirect=${encodeURIComponent(returnUrl)}`)
      return
    }
    setPurchaseOpen(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" asChild className="mb-6 -ml-2">
        <Link href="/service">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-3">
          <Card className="relative aspect-square overflow-hidden">
            <SafeImage
              src={images[activeImage]}
              alt={name}
              fill
              className="object-cover"
              fallback={<span className="text-muted-foreground">No image</span>}
            />
            {product.is_flash_sale ? (
              <Badge className="absolute left-3 top-3 bg-destructive">Flash Sale</Badge>
            ) : null}
          </Card>
          {images.length > 1 ? (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2",
                    i === activeImage ? "border-primary" : "border-transparent"
                  )}
                >
                  <SafeImage src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="space-y-5">
          {product.category_name_en ? (
            <p className="text-sm font-medium text-primary">{product.category_name_en}</p>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
          {product.brand ? (
            <p className="text-muted-foreground">Brand: {product.brand}</p>
          ) : null}

          {rating > 0 || totalReviews > 0 ? (
            <div className="flex items-center gap-1 text-sm">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-medium">{rating > 0 ? rating.toFixed(1) : "—"}</span>
              {totalReviews > 0 ? (
                <span className="text-muted-foreground">({totalReviews} reviews)</span>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-3xl font-bold text-primary">{formatCurrency(price)}</span>
            {onSale && original > price ? (
              <span className="text-lg text-muted-foreground line-through">
                {formatCurrency(original)}
              </span>
            ) : null}
            {product.discount_percentage ? (
              <Badge variant="destructive">
                -{Math.round(Number(product.discount_percentage))}% OFF
              </Badge>
            ) : null}
          </div>

          {product.is_flash_sale && product.flash_end_time ? (
            <FlashSaleCountdown endTime={product.flash_end_time} />
          ) : null}

          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                inStock ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"
              )}
            >
              {inStock ? "In Stock" : "Out of Stock"}
            </span>
            {product.sku ? (
              <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
            ) : null}
          </div>

          {description ? (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold">Description</h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>
          ) : null}

          {advertisements.length > 0 ? (
            <AdvertisementBanner advertisements={advertisements} height="h-20" showTitle={false} />
          ) : null}

          <div className="flex flex-wrap items-center gap-4 border-t pt-5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Qty</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-3.5 w-3.5" />
              </Button>
              <span className="w-6 text-center font-semibold">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >
                <Plus className="h-3.5 w-3.5" />
              </Button>
            </div>

            <Button
              size="lg"
              className="flex-1 sm:flex-none"
              disabled={!inStock}
              onClick={handleBuyNow}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <ProductReviewsSection reviews={reviews} totalCount={totalReviews} />

      {relatedProducts.length > 0 ? (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold">Related Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}

      <ProductPurchaseDialog
        product={product}
        open={purchaseOpen}
        onOpenChange={setPurchaseOpen}
        initialQuantity={quantity}
      />
    </div>
  )
}
