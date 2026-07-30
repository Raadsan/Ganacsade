const getBackendBaseUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://178.18.241.5:5002/api")
    .replace(/\/api\/?$/, "")
    .replace(/\/+$/, "")

export function isValidImageUrl(url?: string | null): url is string {
  if (!url || typeof url !== "string") return false
  try {
    const parsed = new URL(url)
    return parsed.protocol === "http:" || parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function resolveImageUrl(url?: string | null): string | null {
  if (!url || typeof url !== "string") return null

  const trimmed = url.trim()
  if (!trimmed) return null

  let resolved = trimmed

  if (trimmed.startsWith("//")) {
    resolved = `https:${trimmed}`
  } else if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    // Skip icon names / labels that are not real file paths
    if (!trimmed.includes("/") && !trimmed.includes(".")) {
      return null
    }
    const base = getBackendBaseUrl()
    resolved = `${base}${trimmed.startsWith("/") ? trimmed : `/${trimmed}`}`
  }

  return isValidImageUrl(resolved) ? resolved : null
}

export function parseImageList(images?: string[] | string | null): string[] {
  if (!images) return []

  if (Array.isArray(images)) {
    return images
      .map((img) => resolveImageUrl(String(img)))
      .filter((img): img is string => Boolean(img))
  }

  if (typeof images === "string") {
    try {
      const parsed = JSON.parse(images)
      if (Array.isArray(parsed)) {
        return parsed
          .map((img) => resolveImageUrl(String(img)))
          .filter((img): img is string => Boolean(img))
      }
    } catch {
      const single = resolveImageUrl(images)
      return single ? [single] : []
    }
  }

  return []
}
