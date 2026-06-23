import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { SafeImage } from "@/components/website/safe-image"
import {
  getProductName,
  getProductPrice,
  getProductUrl,
  parseProductImages,
  type StoreProduct,
} from "@/lib/api/storefront"
import { formatCurrency } from "@/lib/utils"
import { Star } from "lucide-react"

export function ProductCard({
  product,
  badge,
}: {
  product: StoreProduct
  badge?: string
}) {
  const images = parseProductImages(product.images)
  const image = images[0]
  const { price, original, onSale } = getProductPrice(product)
  const name = getProductName(product)
  const rating = Number(product.rating) || 0

  return (
    <Link href={getProductUrl(product)} className="block">
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square bg-muted">
          <SafeImage
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            fallback={<span>No image</span>}
          />
          {badge ? (
            <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
              {badge}
            </Badge>
          ) : null}
          {onSale && !badge ? (
            <Badge className="absolute left-2 top-2 bg-destructive text-destructive-foreground">
              Sale
            </Badge>
          ) : null}
        </div>
        <div className="space-y-2 p-4">
          <p className="line-clamp-2 text-sm font-medium leading-snug">{name}</p>
          {product.brand ? (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          ) : null}
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-primary">{formatCurrency(price)}</span>
            {onSale && original > price ? (
              <span className="text-xs text-muted-foreground line-through">
                {formatCurrency(original)}
              </span>
            ) : null}
          </div>
          {rating > 0 ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{rating.toFixed(1)}</span>
              {product.review_count ? <span>({product.review_count})</span> : null}
            </div>
          ) : null}
        </div>
      </Card>
    </Link>
  )
}
