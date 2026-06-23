"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Menu, X, LogOut } from "lucide-react"
import { ThemeToggle } from "@/components/website/theme-toggle"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { websiteNav } from "@/lib/website/nav"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api/auth"
import { isCustomerUser } from "@/lib/auth/roles"
import type { LoggedInUser } from "@/lib/api/auth"

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<LoggedInUser | null>(null)

  useEffect(() => {
    const syncUser = () => {
      if (authApi.isAuthenticated()) {
        setUser(authApi.getCurrentUser())
      } else {
        setUser(null)
      }
    }
    syncUser()
    window.addEventListener("storage", syncUser)
    return () => window.removeEventListener("storage", syncUser)
  }, [pathname])

  const customerLoggedIn = user && isCustomerUser(user)

  const handleLogout = async () => {
    await authApi.logout()
    setUser(null)
    router.push("/")
    router.refresh()
  }

  const authButtons = customerLoggedIn ? (
    <>
      <Button variant="ghost" asChild>
        <Link href="/my-orders">My Orders</Link>
      </Button>
      <Button variant="outline" onClick={handleLogout}>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </Button>
    </>
  ) : (
    <>
      <Button variant="ghost" asChild>
        <Link href="/login">Sign In</Link>
      </Button>
    </>
  )

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm text-primary-foreground">
            G
          </span>
          <span>GANACSADE</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {websiteNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.title}
            </Link>
          ))}
          {customerLoggedIn ? (
            <Link
              href="/my-orders"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === "/my-orders" ? "text-primary" : "text-muted-foreground"
              )}
            >
              My Orders
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          {authButtons}
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {open ? (
        <div className="border-t px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            {websiteNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "text-sm font-medium",
                  pathname === item.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {item.title}
              </Link>
            ))}
            {customerLoggedIn ? (
              <Link
                href="/my-orders"
                onClick={() => setOpen(false)}
                className="text-sm font-medium text-muted-foreground"
              >
                My Orders
              </Link>
            ) : null}
            <div className="mt-2 flex flex-col gap-2">
              <div className="flex justify-start">
                <ThemeToggle />
              </div>
              {customerLoggedIn ? (
                <Button variant="outline" onClick={() => { setOpen(false); handleLogout() }}>
                  Logout
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="w-full">
                    <Link href="/login" onClick={() => setOpen(false)}>Sign In</Link>
                  </Button>
                  <Button asChild className="w-full">
                    <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
