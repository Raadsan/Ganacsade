"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { User, LogOut, Settings as SettingsIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authApi } from "@/lib/api/auth"
import { rbacApi } from "@/lib/api/rbac"
import { toast } from "sonner"

export function Header() {
  const router = useRouter()
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null)
  const [accountPath, setAccountPath] = useState("/settings")
  const [accountLabel, setAccountLabel] = useState("Account Settings")

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user")
      if (raw) {
        const u = JSON.parse(raw)
        const first = u.firstName || u.first_name || ""
        const last = u.lastName || u.last_name || ""
        const name = `${first} ${last}`.trim() || u.email || "Admin"
        setUserInfo({ name, email: u.email || "" })
      }
    } catch {
      // ignore
    }

    const loadAccountMenu = async () => {
      try {
        const response = await rbacApi.getMyMenus()
        const menus = response?.data || []
        const profileMenu = menus.find((menu) => menu.url === "/profile")
        if (profileMenu) {
          setAccountPath("/profile")
          setAccountLabel("My Profile")
          return
        }
        const settingsMenu = menus.find((menu) => menu.url === "/settings")
        if (settingsMenu) {
          setAccountPath("/settings")
          setAccountLabel("Account Settings")
        }
      } catch {
        // keep defaults
      }
    }
    loadAccountMenu()
  }, [])

  const handleLogout = async () => {
    await authApi.logout()
    toast.success("Logged out")
    router.push("/login")
  }

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-card px-6">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <User className="h-5 w-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="font-medium">{userInfo?.name || "My Account"}</span>
              {userInfo?.email && (
                <span className="truncate text-xs font-normal text-muted-foreground">
                  {userInfo.email}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(accountPath)}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            {accountLabel}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
