const PRODUCTION_API_URL = "http://178.18.241.5:5002/api"
const LOCAL_API_URL = "http://localhost:5002/api"

const trimTrailingSlashes = (url: string) => url.replace(/\/+$/, "")

/**
 * Chooses the backend that belongs to the frontend currently being used.
 * Browser requests from localhost use the local API; deployed requests use
 * NEXT_PUBLIC_API_URL (or the production default).
 */
export function getApiUrl() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname
    if (host === "localhost" || host === "127.0.0.1") {
      return LOCAL_API_URL
    }
  } else if (process.env.NODE_ENV === "development") {
    // Server components rendered by `next dev` must use the local API too.
    return LOCAL_API_URL
  }

  return trimTrailingSlashes(process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL)
}

export function getBackendUrl() {
  return getApiUrl().replace(/\/api$/, "")
}
