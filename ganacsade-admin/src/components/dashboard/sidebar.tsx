"use client"

import Link from "next/link"
import NextImage from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api/auth"
import { rbacApi, type Menu } from "@/lib/api/rbac"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FolderTree,
  Tag,
  Star,
  Zap,
  Image,
  CreditCard,
  Settings,
  LogOut,
  Store,
  Wifi,
  UserCog,
  ShieldCheck,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const iconMap = {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  FolderTree,
  Tag,
  Star,
  Zap,
  Image,
  CreditCard,
  Store,
  Settings,
  Wifi,
  UserCog,
  ShieldCheck,
} as const

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [items, setItems] = useState<Menu[]>([])
  const [openGroups, setOpenGroups] = useState<Record<number, boolean>>({})

  const handleLogout = async () => {
    await authApi.logout()
    router.push("/login")
  }

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const response = await rbacApi.getMyMenus()
        if (response?.success && Array.isArray(response?.data)) {
          setItems(response.data)
        }
      } catch {
        setItems([])
      }
    }
    loadMenus()
  }, [])

  useEffect(() => {
    const initialGroups: Record<number, boolean> = {}
    for (const item of items) {
      const hasChildren = Array.isArray(item.subMenus) && item.subMenus.length > 0
      if (!hasChildren) continue
      const groupContainsPath = item.subMenus?.some((sub) => pathname === (sub.url || ""))
      if (groupContainsPath) initialGroups[item.id] = true
    }
    if (Object.keys(initialGroups).length > 0) {
      setOpenGroups((prev) => ({ ...prev, ...initialGroups }))
    }
  }, [items, pathname])

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard/overview" className="flex items-center gap-2">
          <NextImage
            src="/logo.png"
            alt="Ganacsade"
            width={140}
            height={48}
            className="object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {items.map((item) => {
          const href = item.url || "/"
          const isActive = pathname === href
          const Icon =
            item.icon && item.icon in iconMap
              ? iconMap[item.icon as keyof typeof iconMap]
              : LayoutDashboard
          const hasChildren = Array.isArray(item.subMenus) && item.subMenus.length > 0
          const isOpen = !!openGroups[item.id]

          return (
            <div key={item.id} className="space-y-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() =>
                    setOpenGroups((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isOpen
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.title || "Menu"}</span>
                  <span className="text-xs">{isOpen ? "▾" : "▸"}</span>
                </button>
              ) : (
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.title || "Menu"}
                </Link>
              )}

              {hasChildren && isOpen && (
                <div className="ml-7 space-y-1">
                  {item.subMenus?.map((sub) => {
                    const subHref = sub.url || "#"
                    const subActive = pathname === subHref
                    return (
                      <Link
                        key={sub.id}
                        href={subHref}
                        className={cn(
                          "block rounded-md px-2 py-1 text-sm transition-colors",
                          subActive
                            ? "bg-primary/15 text-primary"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                        )}
                      >
                        {sub.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}

        {items.length > 0 && <Separator className="my-4" />}
      </nav>

      {/* User Section */}
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-accent-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  )
}
