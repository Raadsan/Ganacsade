import Image from "next/image"
import type { ReactNode } from "react"
import { isValidImageUrl } from "@/lib/utils/image-url"
import { cn } from "@/lib/utils"

type SafeImageProps = {
  src?: string | null
  alt: string
  className?: string
  fill?: boolean
  width?: number
  height?: number
  priority?: boolean
  fallback?: ReactNode
}

export function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  priority,
  fallback,
}: SafeImageProps) {
  if (!src || !isValidImageUrl(src)) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-muted text-xs text-muted-foreground",
          fill ? "absolute inset-0" : "",
          className
        )}
      >
        {fallback ?? "No image"}
      </div>
    )
  }

  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        priority={priority}
        unoptimized
      />
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 40}
      height={height || 40}
      className={className}
      priority={priority}
      unoptimized
    />
  )
}
