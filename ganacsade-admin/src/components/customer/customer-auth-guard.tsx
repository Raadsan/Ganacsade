"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth"
import { isCustomerUser, isDashboardUser } from "@/lib/auth/roles"
import { Loader2 } from "lucide-react"

export function CustomerAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const user = authApi.getCurrentUser()
    const authenticated = authApi.isAuthenticated()

    if (!authenticated) {
      router.replace("/login")
      return
    }

    if (user && isDashboardUser(user)) {
      router.replace("/dashboard/overview")
      return
    }

    if (user && !isCustomerUser(user)) {
      router.replace("/login")
      return
    }

    setReady(true)
  }, [router])

  if (!ready) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return <>{children}</>
}
