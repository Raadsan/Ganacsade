"use client"

import Link from "next/link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
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
import { useCallback, useEffect, useRef, useState } from "react"

function useAdTracking() {
  const viewed = useRef(new Set<string>())
  const trackView = useCallback((id: string) => {
    if (viewed.current.has(id)) return
    viewed.current.add(id)
    recordAdvertisementView(id)
  }, [])
  const trackClick = useCallback((id: string) => recordAdvertisementClick(id), [])
  return { trackView, trackClick }
}

/** 3 small promo banners below hero */
export function PromoMiniBanners({ advertisements }: { advertisements: StoreAdvertisement[] }) {
  const { trackView, trackClick } = useAdTracking()
  const ads = advertisements.slice(0, 3)
  if (ads.length === 0) return null

  const palettes = [
    { bg: "bg-emerald-50 dark:bg-emerald-950/30", badge: "bg-primary" },
    { bg: "bg-orange-50 dark:bg-orange-950/30", badge: "bg-orange-500" },
    { bg: "bg-sky-50 dark:bg-sky-950/30", badge: "bg-secondary" },
  ]

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-3 sm:px-6">
      {ads.map((ad, i) => (
        <MiniBanner
          key={ad.id}
          ad={ad}
          palette={palettes[i % palettes.length]}
          onView={trackView}
          onClick={trackClick}
        />
      ))}
    </div>
  )
}

function MiniBanner({
  ad,
  palette,
  onView,
  onClick,
}: {
  ad: StoreAdvertisement
  palette: { bg: string; badge: string }
  onView: (id: string) => void
  onClick: (id: string) => void
}) {
  const image = resolveImageUrl(ad.imageUrl)

  useEffect(() => {
    onView(ad.id)
  }, [ad.id, onView])

  const inner = (
    <Card
      className={cn(
        "group relative h-40 overflow-hidden border-0 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg sm:h-44",
        palette.bg
      )}
    >
      <span
        className={cn(
          "absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full text-xs font-bold text-white shadow-md",
          palette.badge
        )}
      >
        Sale
      </span>
      <div className="flex h-full items-center justify-between gap-3 p-5">
        <div className="z-10 min-w-0 flex-1 space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary sm:text-xs">
            Special Offer
          </p>
          <p className="line-clamp-2 text-sm font-bold leading-snug sm:text-base">{ad.title}</p>
          {ad.description ? (
            <p className="line-clamp-1 text-xs text-muted-foreground">{ad.description}</p>
          ) : null}
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary sm:text-sm">
            Shop Now <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
        {image ? (
          <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl shadow-md sm:h-28 sm:w-28">
            <SafeImage src={image} alt={ad.title} fill className="object-cover" />
          </div>
        ) : null}
      </div>
    </Card>
  )

  if (ad.targetUrl) {
    return (
      <a href={ad.targetUrl} target="_blank" rel="noreferrer" onClick={() => onClick(ad.id)} className="block">
        {inner}
      </a>
    )
  }
  return inner
}

/** Hero — split layout like grocery template */
export function HeroCarousel({ advertisements }: { advertisements: StoreAdvertisement[] }) {
  const { trackView, trackClick } = useAdTracking()
  const [index, setIndex] = useState(0)
  const ads = advertisements.filter((ad) => resolveImageUrl(ad.imageUrl) || ad.title)

  useEffect(() => {
    if (ads.length <= 1) return
    const t = setInterval(() => setIndex((p) => (p + 1) % ads.length), 6000)
    return () => clearInterval(t)
  }, [ads.length])

  useEffect(() => {
    if (ads[index]) trackView(ads[index].id)
  }, [ads, index, trackView])

  if (ads.length === 0) return null

  const ad = ads[index]
  const image = resolveImageUrl(ad.imageUrl)
  const titleWords = ad.title.trim().split(/\s+/)
  const titleLead = titleWords.length > 1 ? titleWords.slice(0, -1).join(" ") : ad.title
  const titleAccent = titleWords.length > 1 ? titleWords[titleWords.length - 1] : null

  return (
    <section className="relative overflow-hidden bg-[#f4f6f4] dark:bg-muted/20">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-1/4 h-48 w-48 rounded-full bg-secondary/5 blur-2xl" />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
          {/* Left content */}
          <div className="relative z-10 space-y-5">
            <span className="inline-flex items-center rounded-full bg-orange-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-sm">
              Special Offer
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              {titleLead}
              {titleAccent ? <span className="text-primary"> {titleAccent}</span> : null}
            </h1>
            {ad.description ? (
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">{ad.description}</p>
            ) : (
              <p className="max-w-md text-base leading-relaxed text-muted-foreground">
                Browse real products, flash sales & fast delivery — same great experience as our mobile app.
              </p>
            )}
            <Button asChild size="lg" className="h-12 rounded-full px-8 text-base shadow-md">
              <Link href="/service">
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            {ads.length > 1 ? (
              <div className="flex items-center gap-3 pt-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIndex((p) => (p - 1 + ads.length) % ads.length)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex gap-2">
                  {ads.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      aria-label={`Slide ${i + 1}`}
                      className={cn(
                        "h-2 rounded-full transition-all",
                        i === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/30"
                      )}
                      onClick={() => setIndex(i)}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIndex((p) => (p + 1) % ads.length)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
          </div>

          {/* Right image with green blob */}
          <div className="relative flex justify-center md:justify-end">
            <div className="absolute -right-8 top-1/2 h-[110%] w-[85%] -translate-y-1/2 rounded-[3rem] bg-primary/90 md:-right-4" />
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl shadow-2xl">
              {image ? (
                ad.targetUrl ? (
                  <a href={ad.targetUrl} target="_blank" rel="noreferrer" onClick={() => trackClick(ad.id)}>
                    <div className="relative aspect-[4/3] sm:aspect-square">
                      <SafeImage src={image} alt={ad.title} fill className="object-cover" priority />
                    </div>
                  </a>
                ) : (
                  <div className="relative aspect-[4/3] sm:aspect-square">
                    <SafeImage src={image} alt={ad.title} fill className="object-cover" priority />
                  </div>
                )
              ) : (
                <div className="flex aspect-square items-center justify-center bg-primary/20 p-8 text-center">
                  <p className="text-lg font-bold">{ad.title}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

/** Two mid-page wide promo banners */
export function PromoWideBanners({ advertisements }: { advertisements: StoreAdvertisement[] }) {
  const ads = advertisements.slice(0, 2)
  if (ads.length === 0) return null

  const styles = [
    "from-primary/90 to-primary/70",
    "from-secondary/90 to-secondary/70",
  ]

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6">
      {ads.map((ad, i) => (
        <WideBanner key={ad.id} ad={ad} gradient={styles[i % styles.length]} />
      ))}
    </div>
  )
}

function WideBanner({ ad, gradient }: { ad: StoreAdvertisement; gradient: string }) {
  const image = resolveImageUrl(ad.imageUrl)
  const content = (
    <Card className={cn("relative h-44 overflow-hidden border-0 sm:h-52", !image && `bg-gradient-to-r ${gradient}`)}>
      {image ? <SafeImage src={image} alt={ad.title} fill className="object-cover" /> : null}
      <div className={cn("absolute inset-0 bg-gradient-to-r", image ? "from-black/70 via-black/40 to-transparent" : gradient)} />
      <div className="absolute inset-0 flex flex-col justify-center p-6 sm:p-8">
        <p className="max-w-xs text-xl font-bold text-white sm:text-2xl">{ad.title}</p>
        {ad.description ? <p className="mt-2 max-w-sm text-sm text-white/90">{ad.description}</p> : null}
        <span className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold text-white backdrop-blur-sm">
          Shop Now <ArrowRight className="h-3.5 w-3.5" />
        </span>
      </div>
    </Card>
  )

  if (ad.targetUrl) {
    return (
      <a href={ad.targetUrl} target="_blank" rel="noreferrer" className="block">
        {content}
      </a>
    )
  }
  return content
}
