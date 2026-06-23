import Link from "next/link"
import { ArrowRight, Flame, LayoutGrid, Package, ShoppingBag, Sparkles } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  AdvertisementBanner,
  AdvertisementSlider,
} from "@/components/website/advertisement-banner"
import { FlashSaleCountdown } from "@/components/website/flash-sale-countdown"
import { ProductCard } from "@/components/website/product-card"
import { SafeImage } from "@/components/website/safe-image"
import {
  fetchHomepageData,
  resolveImageUrl,
  type StoreCategory,
} from "@/lib/api/storefront"

function CategoryChip({ category }: { category: StoreCategory }) {
  const image = resolveImageUrl(category.image_url) || resolveImageUrl(category.icon_path)
  const color = category.color || "#84b833"

  return (
    <Link
      href={`/service?category=${category.id}`}
      className="flex min-w-[100px] flex-col items-center gap-2 transition-opacity hover:opacity-80"
    >
      <div
        className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card"
        style={{ backgroundColor: `${color}22` }}
      >
        {image ? (
          <SafeImage
            src={image}
            alt={category.name_en}
            width={40}
            height={40}
            className="object-contain"
          />
        ) : (
          <LayoutGrid className="h-6 w-6" style={{ color }} />
        )}
      </div>
      <p className="max-w-[90px] truncate text-center text-xs font-medium">{category.name_en}</p>
    </Link>
  )
}

export async function HomeStorefront() {
  const data = await fetchHomepageData()
  const flashEndTime = data.flashSaleProducts[0]?.flash_end_time
  const hasHeroAds = data.sliderAdvertisements.length > 0

  const statsCards = (
    <div className="grid gap-3 sm:grid-cols-3">
      <Card className="p-4 text-center">
        <Package className="mx-auto mb-2 h-6 w-6 text-primary" />
        <p className="text-2xl font-bold">{data.productCount}</p>
        <p className="text-xs text-muted-foreground">Active Products</p>
      </Card>
      <Card className="p-4 text-center">
        <LayoutGrid className="mx-auto mb-2 h-6 w-6 text-primary" />
        <p className="text-2xl font-bold">{data.categoryCount}</p>
        <p className="text-xs text-muted-foreground">Categories</p>
      </Card>
      <Card className="p-4 text-center">
        <Flame className="mx-auto mb-2 h-6 w-6 text-destructive" />
        <p className="text-2xl font-bold">{data.flashSaleCount}</p>
        <p className="text-xs text-muted-foreground">Flash Sale Items</p>
      </Card>
    </div>
  )

  return (
    <>
      <section className="border-b bg-gradient-to-b from-accent/40 to-background">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 md:grid-cols-2 md:items-center">
            <div className="space-y-6">
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Live from GANACSADE store
              </Badge>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                Products, flash sales & more — same as the app
              </h1>
              <p className="text-lg text-muted-foreground">
                Browse real products registered in our system. Shop online or download
                the mobile app for full checkout and delivery tracking.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link href="/service">
                    Shop Now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </div>

            {hasHeroAds ? (
              <AdvertisementSlider advertisements={data.sliderAdvertisements} embedded />
            ) : (
              statsCards
            )}
          </div>

          {hasHeroAds ? <div className="mt-8">{statsCards}</div> : null}
        </div>
      </section>

      {data.categories.length > 0 ? (
        <section className="border-b py-10">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-2xl font-bold">Categories</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/service">View all</Link>
              </Button>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {data.categories.map((category) => (
                <CategoryChip key={category.id} category={category} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.advertisements.length > 0 ? (
        <section className="py-6">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <AdvertisementBanner advertisements={data.advertisements} />
          </div>
        </section>
      ) : null}

      {data.flashSaleProducts.length > 0 ? (
        <section className="border-b bg-destructive/5 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Flame className="h-6 w-6 text-destructive" />
                <h2 className="text-2xl font-bold">Flash Sales</h2>
                <Badge variant="destructive">Live now</Badge>
              </div>
              <div className="flex items-center gap-4">
                <FlashSaleCountdown endTime={flashEndTime} />
                <Button variant="outline" size="sm" asChild>
                  <Link href="/service">View all</Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.flashSaleProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  badge={
                    product.discount_percentage
                      ? `-${Math.round(Number(product.discount_percentage))}%`
                      : "Flash Sale"
                  }
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.featuredProducts.length > 0 ? (
        <section className="py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Featured Products</h2>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/service">View all</Link>
              </Button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {data.productCount === 0 &&
      data.featuredProducts.length === 0 &&
      data.flashSaleProducts.length === 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-lg px-4 text-center text-muted-foreground">
            <Package className="mx-auto mb-4 h-12 w-12" />
            <p className="text-lg font-medium text-foreground">No products listed yet</p>
            <p className="mt-2 text-sm">
              Products added in the admin dashboard will appear here automatically.
            </p>
          </div>
        </section>
      ) : null}

      <section className="border-t bg-muted/30 py-12">
        <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold">Ready to shop?</h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Browse products on the web or use the GANACSADE mobile app for wishlist,
            data packages, and order tracking.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link href="/service">Browse Products</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
