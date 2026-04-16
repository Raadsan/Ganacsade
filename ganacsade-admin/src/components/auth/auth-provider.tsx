"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're on a public route (login page)
    const isPublicRoute = pathname === "/login"

    // Get token from localStorage
    const token = localStorage.getItem("token")

    // If no token and not on login page, redirect to login
    if (!token && !isPublicRoute) {
      router.push("/login")
    }

    // If has token and on login page, redirect to dashboard
    if (token && isPublicRoute) {
      router.push("/")
    }
  }, [pathname, router])

  return <>{children}</>
}
