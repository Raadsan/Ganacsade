"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SafeImage } from "@/components/website/safe-image"
import {
  recordAdvertisementClick,
  recordAdvertisementView,
  type StoreAdvertisement,
} from "@/lib/api/storefront-client"
import { resolveImageUrl } from "@/lib/api/storefront"
import { cn } from "@/lib/utils"

function useAdTracking() {
  const viewed = useRef(new Set<string>())

  const trackView = useCallback((id: string) => {
    if (viewed.current.has(id)) return
    viewed.current.add(id)
    recordAdvertisementView(id)
  }, [])

  const trackClick = useCallback((id: string) => {
    recordAdvertisementClick(id)
  }, [])

  return { trackView, trackClick }
}

function AdSlide({
  ad,
  showTitle,
  className,
  onView,
  onClick,
}: {
  ad: StoreAdvertisement
  showTitle?: boolean
  className?: string
  onView: (id: string) => void
  onClick: (id: string, url?: string | null) => void
}) {
  const image = resolveImageUrl(ad.imageUrl)

  useEffect(() => {
    onView(ad.id)
  }, [ad.id, onView])

  const content = (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {image ? (
        <SafeImage src={image} alt={ad.title} fill className="object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-primary/10 p-6">
          <div className="text-center">
            <p className="text-lg font-bold">{ad.title}</p>
            {ad.description ? (
              <p className="mt-1 text-sm text-muted-foreground">{ad.description}</p>
            ) : null}
          </div>
        </div>
      )}
      {showTitle && image ? (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="truncate font-semibold text-white">{ad.title}</p>
          {ad.description ? (
            <p className="truncate text-sm text-white/90">{ad.description}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  if (ad.targetUrl) {
    return (
      <a
        href={ad.targetUrl}
        target="_blank"
        rel="noreferrer"
        className="block h-full w-full"
        onClick={() => onClick(ad.id, ad.targetUrl)}
      >
        {content}
      </a>
    )
  }

  return content
}

/** Horizontal carousel for home_slider placement */
export function AdvertisementSlider({
  advertisements,
  className,
  embedded = false,
}: {
  advertisements: StoreAdvertisement[]
  className?: string
  embedded?: boolean
}) {
  const { trackView, trackClick } = useAdTracking()
  const [index, setIndex] = useState(0)
  const ads = advertisements.filter((ad) => resolveImageUrl(ad.imageUrl) || ad.title)

  useEffect(() => {
    if (ads.length <= 1) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % ads.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [ads.length])

  if (ads.length === 0) return null

  const handleClick = (id: string) => trackClick(id)
  const slideHeight = embedded ? "h-56 sm:h-64 md:h-72" : "h-44 sm:h-52"

  const sliderCard = (
    <Card className={cn("relative overflow-hidden shadow-md", slideHeight)}>
      <div
        className="flex h-full transition-transform duration-500 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {(ads.length === 1 ? [ads[0]] : ads).map((ad) => (
          <div key={ad.id} className="h-full min-w-full">
            <AdSlide ad={ad} showTitle onView={trackView} onClick={handleClick} />
          </div>
        ))}
      </div>
      {ads.length > 1 ? (
        <>
          <Button
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-80"
            onClick={() => setIndex((prev) => (prev - 1 + ads.length) % ads.length)}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 rounded-full opacity-80"
            onClick={() => setIndex((prev) => (prev + 1) % ads.length)}
            aria-label="Next slide"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {ads.map((ad, i) => (
              <button
                key={ad.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                className={cn(
                  "h-2 w-2 rounded-full transition-colors",
                  i === index ? "bg-white" : "bg-white/50"
                )}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      ) : null}
    </Card>
  )

  if (embedded) {
    return <div className={className}>{sliderCard}</div>
  }

  return (
    <section className={cn("py-6", className)}>
      <div className="mx-auto max-w-6xl px-4 sm:px-6">{sliderCard}</div>
    </section>
  )
}

/** Single or scrollable banner for home_banner, category_page, product_page */
export function AdvertisementBanner({
  advertisements,
  height = "h-32 sm:h-40",
  showTitle = true,
  compact = false,
}: {
  advertisements: StoreAdvertisement[]
  height?: string
  showTitle?: boolean
  compact?: boolean
}) {
  const { trackView, trackClick } = useAdTracking()
  const ads = advertisements.filter((ad) => resolveImageUrl(ad.imageUrl) || ad.title)

  if (ads.length === 0) return null

  const handleClick = (id: string) => trackClick(id)

  if (compact) {
    const ad = ads[0]
    const image = resolveImageUrl(ad.imageUrl)
    return (
      <div
        className="flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3"
        onClick={() => {
          trackClick(ad.id)
          if (ad.targetUrl) window.open(ad.targetUrl, "_blank")
        }}
        role={ad.targetUrl ? "button" : undefined}
      >
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
          {image ? (
            <SafeImage src={image} alt={ad.title} fill className="object-cover" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{ad.title}</p>
          {ad.description ? (
            <p className="truncate text-xs text-muted-foreground">{ad.description}</p>
          ) : null}
        </div>
      </div>
    )
  }

  if (ads.length === 1) {
    return (
      <Card className={cn("overflow-hidden", height)}>
        <AdSlide ad={ads[0]} showTitle={showTitle} onView={trackView} onClick={handleClick} />
      </Card>
    )
  }

  return (
    <div className={cn("flex gap-3 overflow-x-auto pb-1", height)}>
      {ads.map((ad) => (
        <Card key={ad.id} className={cn("min-w-[80%] shrink-0 overflow-hidden sm:min-w-[60%]", height)}>
          <AdSlide ad={ad} showTitle={showTitle} onView={trackView} onClick={handleClick} />
        </Card>
      ))}
    </div>
  )
}
