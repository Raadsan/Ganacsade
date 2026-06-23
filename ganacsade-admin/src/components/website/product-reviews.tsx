import { BadgeCheck, Star } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { StoreReview } from "@/lib/api/storefront"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
          )}
        />
      ))}
    </div>
  )
}

function ReviewCard({ review }: { review: StoreReview }) {
  const name = review.user?.displayName || "Customer"
  const initials = review.user?.initials || name.charAt(0).toUpperCase()

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium">{name}</span>
            <StarRating rating={review.rating} />
            {review.isVerifiedPurchase ? (
              <Badge variant="secondary" className="gap-1 text-xs">
                <BadgeCheck className="h-3 w-3" />
                Verified
              </Badge>
            ) : null}
          </div>
          {review.title ? <p className="text-sm font-semibold">{review.title}</p> : null}
          {review.comment ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
          ) : null}
          {review.createdAt ? (
            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
          ) : null}
        </div>
      </div>
    </Card>
  )
}

export function ProductReviewsSection({
  reviews,
  totalCount,
}: {
  reviews: StoreReview[]
  totalCount?: number
}) {
  const count = totalCount ?? reviews.length
  if (count === 0) return null

  return (
    <section className="mt-12">
      <h2 className="mb-6 text-2xl font-bold">Reviews ({count})</h2>
      <div className="space-y-4">
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </section>
  )
}
