"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "@/lib/api/auth"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const isPublicRoute = pathname === "/login"
    const authenticated = authApi.isAuthenticated()

    if (!authenticated && !isPublicRoute) {
      // Clear any stale data
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      router.replace("/login")
      return
    }

    if (authenticated && isPublicRoute) {
      router.replace("/")
      return
    }

    setChecked(true)
  }, [pathname, router])

  // Prevent content flash before auth check completes (protected pages only)
  if (!checked && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
