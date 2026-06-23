"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { getPostLoginPath, isCustomerUser } from "@/lib/auth/roles"

const PUBLIC_ROUTES = ["/login", "/register", "/admin/login"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)
    const authenticated = authApi.isAuthenticated()
    const user = authApi.getCurrentUser()

    if (!authenticated && !isPublicRoute) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
      router.replace("/login")
      return
    }

    if (authenticated && user && isCustomerUser(user)) {
      router.replace("/my-orders")
      return
    }

    if (authenticated && isPublicRoute) {
      router.replace(getPostLoginPath(user))
      return
    }

    setChecked(true)
  }, [pathname, router])

  if (!checked && !PUBLIC_ROUTES.includes(pathname)) {
    return null
  }

  return <>{children}</>
}
