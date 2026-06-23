"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { rbacApi, type Menu, type Role, type RoleMenuPermission } from "@/lib/api/rbac"
import { usersApi, type User } from "@/lib/api/users"
import { toast } from "sonner"
import { ArrowDown, ArrowUp, Eye, Loader2, Pencil, Trash2 } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

type PermissionKey = "canView" | "canAdd" | "canEdit" | "canDelete" | "canAssign"
type OrderScopeKey = "canViewAllOrders" | "canViewByRole"
type MenuPermissionKey = PermissionKey | OrderScopeKey

type PermissionRow = {
  menuId: number
  canView: boolean
  canAdd: boolean
  canEdit: boolean
  canDelete: boolean
  canAssign: boolean
  canViewAllOrders: boolean
  canViewByRole: boolean
  subMenus: Array<{
    subMenuId: number
    canView: boolean
    canAdd: boolean
    canEdit: boolean
    canDelete: boolean
    canAssign: boolean
  }>
}

type RolePermissionsApi = {
  menus?: Array<{
    menuId: number
    canView?: boolean
    canAdd?: boolean
    canEdit?: boolean
    canDelete?: boolean
    canAssign?: boolean
    canViewAllOrders?: boolean
    canViewByRole?: boolean
    subMenus?: Array<{
      subMenuId: number
      canView?: boolean
      canAdd?: boolean
      canEdit?: boolean
      canDelete?: boolean
    }>
  }>
}

type PermissionsSection = "roles" | "menus" | "users" | "customers" | "role-permissions"

const FLAG_COLUMNS: PermissionKey[] = ["canView", "canAdd", "canEdit", "canDelete", "canAssign"]
const ORDER_SCOPE_COLUMNS: OrderScopeKey[] = ["canViewAllOrders", "canViewByRole"]
const FLAG_LABELS: Record<MenuPermissionKey, string> = {
  canView: "Can View",
  canAdd: "Write",
  canEdit: "Update",
  canDelete: "Delete",
  canAssign: "Assign",
  canViewAllOrders: "All Orders",
  canViewByRole: "Order By Role",
}

const getUserContact = (user: User) =>
  user.email || user.phone_number || user.phone || "—"

const getUserDisplayName = (user: User) => {
  const name =
    user.display_name?.trim()
    || `${user.first_name || ""} ${user.last_name || ""}`.trim()
  if (name) return name
  const contact = getUserContact(user)
  return contact === "—" ? "User" : contact
}

type UserOrderItem = {
  id: string
  product_name: string
  quantity: number
  unit_price: string | number
  total: string | number
  package_name?: string | null
  provider_name?: string | null
}

type UserOrder = {
  id: string
  order_number: string
  order_type?: string | null
  total: string | number
  status: string
  payment_status?: string | null
  created_at: string
  order_items?: UserOrderItem[]
}

type UserAddress = {
  id: number
  title: string
  full_name: string
  phone_number: string
  street: string
  city: string
  state?: string | null
  country: string
  postal_code?: string | null
  is_default?: boolean | null
}

type UserFullDetails = User & {
  profile_image_url?: string | null
  gender?: string | null
  date_of_birth?: string | null
  preferred_language?: string | null
  preferred_currency?: string | null
  is_phone_verified?: boolean | null
  user_addresses?: UserAddress[]
  orders?: UserOrder[]
  stats?: {
    totalOrders: number
    totalSpent: number
    deliveredOrders: number
    pendingOrders: number
  }
}

const createEmptyRow = (menu: Menu): PermissionRow => ({
  menuId: menu.id,
  canView: false,
  canAdd: false,
  canEdit: false,
  canDelete: false,
  canAssign: false,
  canViewAllOrders: false,
  canViewByRole: false,
  subMenus: (menu.subMenus || []).map((sub) => ({
    subMenuId: sub.id,
    canView: false,
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canAssign: false,
  })),
})

const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === "string"
  ) {
    return (error as { response?: { data?: { message?: string } } }).response?.data?.message as string
  }
  return fallback
}

const parseOrder = (value: string | number | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function PermissionsCenter({ section }: { section: PermissionsSection }) {
  const [roles, setRoles] = useState<Role[]>([])
  const [menus, setMenus] = useState<Menu[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null)
  const [rows, setRows] = useState<PermissionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [newMenuTitle, setNewMenuTitle] = useState("")
  const [newMenuUrl, setNewMenuUrl] = useState("")
  const [newMenuOrder, setNewMenuOrder] = useState("0")
  const [newSubMenuMenuId, setNewSubMenuMenuId] = useState<number | null>(null)
  const [newSubMenuTitle, setNewSubMenuTitle] = useState("")
  const [newSubMenuUrl, setNewSubMenuUrl] = useState("")
  const [newSubMenuOrder, setNewSubMenuOrder] = useState("0")
  const [showCreateMenuForm, setShowCreateMenuForm] = useState(false)
  const [showCreateSubMenuForm, setShowCreateSubMenuForm] = useState(false)
  const [editingRoleId, setEditingRoleId] = useState<number | null>(null)
  const [editingRoleName, setEditingRoleName] = useState("")
  const [editingRoleDescription, setEditingRoleDescription] = useState("")
  const [editingMenuId, setEditingMenuId] = useState<number | null>(null)
  const [editingMenuTitle, setEditingMenuTitle] = useState("")
  const [editingMenuUrl, setEditingMenuUrl] = useState("")
  const [editingMenuOrder, setEditingMenuOrder] = useState("0")
  const [editingSubMenuId, setEditingSubMenuId] = useState<number | null>(null)
  const [editingSubMenuTitle, setEditingSubMenuTitle] = useState("")
  const [editingSubMenuUrl, setEditingSubMenuUrl] = useState("")
  const [editingSubMenuOrder, setEditingSubMenuOrder] = useState("0")
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editingUserName, setEditingUserName] = useState("")
  const [editingUserEmail, setEditingUserEmail] = useState("")
  const [editingUserPhone, setEditingUserPhone] = useState("")
  const [editingUserRoleId, setEditingUserRoleId] = useState<number | null>(null)
  const [editingUserStatus, setEditingUserStatus] = useState("")
  const [newUserPassword, setNewUserPassword] = useState("")
  const [isUserFormOpen, setIsUserFormOpen] = useState(false)
  const [userFormMode, setUserFormMode] = useState<"create" | "edit">("create")
  const [viewRoleId, setViewRoleId] = useState<number | null>(null)
  const [viewMenuId, setViewMenuId] = useState<number | null>(null)
  const [viewUserId, setViewUserId] = useState<string | null>(null)
  const [viewedUserDetails, setViewedUserDetails] = useState<UserFullDetails | null>(null)
  const [loadingUserDetails, setLoadingUserDetails] = useState(false)
  const [userSearch, setUserSearch] = useState("")
  const [userRoleFilter, setUserRoleFilter] = useState("all")
  const [userStatusFilter, setUserStatusFilter] = useState("all")

  const selectedRole = useMemo(
    () => roles.find((role) => role.id === selectedRoleId) || null,
    [roles, selectedRoleId]
  )
  const viewedRole = useMemo(() => roles.find((role) => role.id === viewRoleId) || null, [roles, viewRoleId])
  const viewedMenu = useMemo(() => menus.find((menu) => menu.id === viewMenuId) || null, [menus, viewMenuId])
  const viewedUser = useMemo(() => users.find((user) => user.id === viewUserId) || null, [users, viewUserId])

  useEffect(() => {
    if (!viewUserId) {
      setViewedUserDetails(null)
      return
    }

    const loadUserDetails = async () => {
      try {
        setLoadingUserDetails(true)
        const response = await usersApi.getUser(viewUserId)
        if (response.success && response.data) {
          setViewedUserDetails(response.data as UserFullDetails)
        } else {
          toast.error(response.message || "Failed to load user details")
        }
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load user details"))
      } finally {
        setLoadingUserDetails(false)
      }
    }

    loadUserDetails()
  }, [viewUserId])

  const buildRowsFromApi = (menusData: Menu[], permissions: RolePermissionsApi | null): PermissionRow[] => {
    const map = new Map<number, NonNullable<RolePermissionsApi["menus"]>[number]>()
    for (const m of permissions?.menus || []) {
      map.set(m.menuId, m)
    }

    return menusData.map((menu) => {
      const existing = map.get(menu.id)
      if (!existing) return createEmptyRow(menu)

      const subMap = new Map<number, NonNullable<NonNullable<RolePermissionsApi["menus"]>[number]["subMenus"]>[number]>()
      for (const s of existing.subMenus || []) {
        subMap.set(s.subMenuId, s)
      }

      return {
        menuId: menu.id,
        canView: !!existing.canView,
        canAdd: !!existing.canAdd,
        canEdit: !!existing.canEdit,
        canDelete: !!existing.canDelete,
        canAssign: !!existing.canAssign,
        canViewAllOrders: !!existing.canViewAllOrders,
        canViewByRole: !!existing.canViewByRole,
        subMenus: (menu.subMenus || []).map((sub) => {
          const hit = subMap.get(sub.id)
          return {
            subMenuId: sub.id,
            canView: !!hit?.canView,
            canAdd: !!hit?.canAdd,
            canEdit: !!hit?.canEdit,
            canDelete: !!hit?.canDelete,
            canAssign: false,
          }
        }),
      }
    })
  }

  const fetchRoles = async () => {
    const response = await rbacApi.getRoles()
    const rolesData: Role[] = response?.data || []
    setRoles(rolesData)
    if (!selectedRoleId && rolesData.length > 0) {
      setSelectedRoleId(rolesData[0].id)
    }
  }

  const fetchMenus = async () => {
    const response = await rbacApi.getMenus()
    const menusData: Menu[] = response?.data || []
    setMenus(menusData)
  }

  const fetchUsers = async (filters?: {
    search?: string
    roleId?: number
    status?: string
    role?: string
    roleName?: string
    excludeRole?: string
    excludeRoleNames?: string
  }) => {
    const response = await usersApi.getUsers({
      search: filters?.search || undefined,
      roleId: filters?.roleId || undefined,
      status: filters?.status || undefined,
      role: filters?.role || undefined,
      roleName: filters?.roleName || undefined,
      excludeRole: filters?.excludeRole || undefined,
      excludeRoleNames: filters?.excludeRoleNames || undefined,
    })
    const usersData: User[] = response?.data || []
    setUsers(usersData)
  }

  const fetchRolePermissions = async (roleId: number, menusData: Menu[]) => {
    const response = await rbacApi.getRolePermissions(roleId)
    const permissions = (response?.data?.permissions || null) as RolePermissionsApi | null
    setRows(buildRowsFromApi(menusData, permissions))
  }

  const isDeliveryRole = (role: Role) => {
    const name = role.name?.toLowerCase() || ""
    return name.includes("delivery")
  }

  const staffRoles = useMemo(
    () => roles.filter((role) => role.name.toLowerCase() !== "customer" && !isDeliveryRole(role)),
    [roles]
  )

  const loadUsersBySection = async () => {
    if (section === "customers") {
      await fetchUsers({ roleName: "customer" })
      return
    }
    if (section === "users") {
      await fetchUsers({ excludeRoleNames: "customer,delivery" })
      return
    }
    await fetchUsers({})
  }

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        if (section === "users" || section === "customers") {
          await fetchRoles()
          await loadUsersBySection()
          return
        }
        if (section === "roles") {
          await fetchRoles()
          return
        }
        if (section === "menus") {
          await fetchMenus()
          return
        }
        await Promise.all([fetchRoles(), fetchMenus()])
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Failed to load data"))
      } finally {
        setLoading(false)
      }
    }
    init()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section])

  useEffect(() => {
    if (section !== "role-permissions") return
    if (!selectedRoleId || menus.length === 0) return
    fetchRolePermissions(selectedRoleId, menus).catch(() => {
      setRows(menus.map((menu) => createEmptyRow(menu)))
      toast.error("Failed to load role permissions")
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section, selectedRoleId, menus.length])

  const toggleMenuFlag = (menuId: number, key: MenuPermissionKey) => {
    setRows((prev) =>
      prev.map((row) => {
        if (row.menuId !== menuId) return row
        const nextValue = !row[key]
        if (key === "canViewAllOrders" && nextValue) {
          return { ...row, canViewAllOrders: true, canViewByRole: false }
        }
        if (key === "canViewByRole" && nextValue) {
          return { ...row, canViewByRole: true, canViewAllOrders: false }
        }
        return { ...row, [key]: nextValue }
      })
    )
  }

  const toggleSubMenuFlag = (menuId: number, subMenuId: number, key: PermissionKey) => {
    setRows((prev) =>
      prev.map((row) =>
        row.menuId !== menuId
          ? row
          : {
              ...row,
              subMenus: row.subMenus.map((sub) =>
                sub.subMenuId === subMenuId ? { ...sub, [key]: !sub[key] } : sub
              ),
            }
      )
    )
  }

  const handleCreateRole = async () => {
    if (!newRoleName.trim()) {
      toast.error("Role name is required")
      return
    }
    try {
      await rbacApi.createRole({
        name: newRoleName.trim(),
        description: newRoleDescription.trim(),
      })
      toast.success("Role created")
      setNewRoleName("")
      setNewRoleDescription("")
      await fetchRoles()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create role"))
    }
  }

  const handleCreateMenu = async () => {
    if (!newMenuTitle.trim()) {
      toast.error("Menu title is required")
      return
    }
    try {
      await rbacApi.createMenu({
        title: newMenuTitle.trim(),
        url: newMenuUrl.trim() || undefined,
        order: parseOrder(newMenuOrder),
      })
      toast.success("Menu created")
      setNewMenuTitle("")
      setNewMenuUrl("")
      setNewMenuOrder("0")
      setShowCreateMenuForm(false)
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create menu"))
    }
  }

  const handleCreateSubMenu = async () => {
    if (!newSubMenuMenuId) {
      toast.error("Select parent menu")
      return
    }
    if (!newSubMenuTitle.trim() || !newSubMenuUrl.trim()) {
      toast.error("Submenu title and url are required")
      return
    }
    try {
      await rbacApi.createSubMenu({
        menuId: newSubMenuMenuId,
        title: newSubMenuTitle.trim(),
        url: newSubMenuUrl.trim(),
        order: parseOrder(newSubMenuOrder),
      })
      toast.success("Submenu created")
      setNewSubMenuMenuId(null)
      setNewSubMenuTitle("")
      setNewSubMenuUrl("")
      setNewSubMenuOrder("0")
      setShowCreateSubMenuForm(false)
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create submenu"))
    }
  }

  const startEditRole = (role: Role) => {
    setEditingRoleId(role.id)
    setEditingRoleName(role.name || "")
    setEditingRoleDescription(role.description || "")
  }

  const cancelEditRole = () => {
    setEditingRoleId(null)
    setEditingRoleName("")
    setEditingRoleDescription("")
  }

  const handleUpdateRole = async () => {
    if (!editingRoleId) return
    if (!editingRoleName.trim()) {
      toast.error("Role name is required")
      return
    }
    try {
      await rbacApi.updateRole(editingRoleId, {
        name: editingRoleName.trim(),
        description: editingRoleDescription.trim(),
      })
      toast.success("Role updated")
      cancelEditRole()
      await fetchRoles()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update role"))
    }
  }

  const handleDeleteRole = async (roleId: number) => {
    if (!window.confirm("Delete this role?")) return
    try {
      await rbacApi.deleteRole(roleId)
      toast.success("Role deleted")
      if (selectedRoleId === roleId) {
        setSelectedRoleId(null)
      }
      await fetchRoles()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete role"))
    }
  }

  const startEditMenu = (menu: Menu) => {
    setEditingMenuId(menu.id)
    setEditingMenuTitle(menu.title || "")
    setEditingMenuUrl(menu.url || "")
    setEditingMenuOrder(String(menu.order ?? 0))
  }

  const cancelEditMenu = () => {
    setEditingMenuId(null)
    setEditingMenuTitle("")
    setEditingMenuUrl("")
    setEditingMenuOrder("0")
  }

  const handleUpdateMenu = async () => {
    if (!editingMenuId) return
    if (!editingMenuTitle.trim()) {
      toast.error("Menu title is required")
      return
    }
    try {
      await rbacApi.updateMenu(editingMenuId, {
        title: editingMenuTitle.trim(),
        url: editingMenuUrl.trim() || undefined,
        order: parseOrder(editingMenuOrder),
      })
      toast.success("Menu updated")
      cancelEditMenu()
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update menu"))
    }
  }

  const handleDeleteMenu = async (menuId: number) => {
    if (!window.confirm("Delete this menu?")) return
    try {
      await rbacApi.deleteMenu(menuId)
      toast.success("Menu deleted")
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete menu"))
    }
  }

  const startEditSubMenu = (subMenu: { id: number; title: string; url: string; order?: number }) => {
    setEditingSubMenuId(subMenu.id)
    setEditingSubMenuTitle(subMenu.title || "")
    setEditingSubMenuUrl(subMenu.url || "")
    setEditingSubMenuOrder(String(subMenu.order ?? 0))
  }

  const cancelEditSubMenu = () => {
    setEditingSubMenuId(null)
    setEditingSubMenuTitle("")
    setEditingSubMenuUrl("")
    setEditingSubMenuOrder("0")
  }

  const handleUpdateSubMenu = async (menuId: number) => {
    if (!editingSubMenuId) return
    if (!editingSubMenuTitle.trim() || !editingSubMenuUrl.trim()) {
      toast.error("Submenu title and url are required")
      return
    }
    try {
      await rbacApi.updateSubMenu(editingSubMenuId, {
        menuId,
        title: editingSubMenuTitle.trim(),
        url: editingSubMenuUrl.trim(),
        order: parseOrder(editingSubMenuOrder),
      })
      toast.success("Submenu updated")
      cancelEditSubMenu()
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update submenu"))
    }
  }

  const handleDeleteSubMenu = async (subMenuId: number) => {
    if (!window.confirm("Delete this submenu?")) return
    try {
      await rbacApi.deleteSubMenu(subMenuId)
      toast.success("Submenu deleted")
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete submenu"))
    }
  }

  const handleMoveMenu = async (menuId: number, direction: "up" | "down") => {
    const orderedMenus = [...menus].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id)
    const currentIndex = orderedMenus.findIndex((menu) => menu.id === menuId)
    if (currentIndex === -1) return

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= orderedMenus.length) return

    const next = [...orderedMenus]
    ;[next[currentIndex], next[swapIndex]] = [next[swapIndex], next[currentIndex]]

    try {
      await Promise.all(
        next.map((menu, index) =>
          rbacApi.updateMenu(menu.id, {
            order: index + 1,
          })
        )
      )
      toast.success("Menu order updated")
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reorder menu"))
    }
  }

  const handleMoveSubMenu = async (menuId: number, subMenuId: number, direction: "up" | "down") => {
    const parentMenu = menus.find((menu) => menu.id === menuId)
    const orderedSubMenus = [...(parentMenu?.subMenus || [])].sort(
      (a, b) => (a.order ?? 0) - (b.order ?? 0) || a.id - b.id
    )
    const currentIndex = orderedSubMenus.findIndex((subMenu) => subMenu.id === subMenuId)
    if (currentIndex === -1) return

    const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    if (swapIndex < 0 || swapIndex >= orderedSubMenus.length) return

    const next = [...orderedSubMenus]
    ;[next[currentIndex], next[swapIndex]] = [next[swapIndex], next[currentIndex]]

    try {
      await Promise.all(
        next.map((subMenu, index) =>
          rbacApi.updateSubMenu(subMenu.id, {
            menuId,
            order: index + 1,
          })
        )
      )
      toast.success("Submenu order updated")
      await fetchMenus()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reorder submenu"))
    }
  }

  const openCreateUserForm = () => {
    if (staffRoles.length === 0) {
      toast.error("No staff roles available. Create a role first.")
      return
    }
    setUserFormMode("create")
    setEditingUserId(null)
    setEditingUserName("")
    setEditingUserEmail("")
    setEditingUserPhone("")
    setEditingUserRoleId(staffRoles[0]?.id || null)
    setEditingUserStatus("active")
    setNewUserPassword("")
    setIsUserFormOpen(true)
  }

  const startEditUser = (user: User) => {
    setUserFormMode("edit")
    setEditingUserId(user.id)
    setEditingUserName(user.display_name || `${user.first_name} ${user.last_name}`.trim())
    setEditingUserEmail(user.email || "")
    setEditingUserPhone(user.phone_number || "")
    const mappedRoleId =
      user.role_id ??
      user.roleModel?.id ??
      roles.find((role) => role.name?.toLowerCase() === String(user.role || "").toLowerCase())?.id ??
      null
    setEditingUserRoleId(mappedRoleId)
    setEditingUserStatus(user.status || "active")
    setNewUserPassword("")
    setIsUserFormOpen(true)
  }

  const closeUserForm = () => {
    setEditingUserId(null)
    setEditingUserName("")
    setEditingUserEmail("")
    setEditingUserPhone("")
    setEditingUserRoleId(null)
    setEditingUserStatus("")
    setNewUserPassword("")
    setIsUserFormOpen(false)
    setUserFormMode("create")
  }

  const handleCreateUser = async () => {
    if (!editingUserName.trim() || !editingUserEmail.trim() || !newUserPassword.trim()) {
      toast.error("Name, email and password are required")
      return
    }
    if (!editingUserRoleId) {
      toast.error("Please select role")
      return
    }
    try {
      await usersApi.createUser({
        name: editingUserName.trim(),
        email: editingUserEmail.trim(),
        phone: editingUserPhone.trim() || undefined,
        password: newUserPassword.trim(),
        roleId: editingUserRoleId,
      })
      toast.success("User created")
      closeUserForm()
      await loadUsersBySection()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to create user"))
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUserId) return
    if (!editingUserName.trim() || !editingUserEmail.trim()) {
      toast.error("Name and email are required")
      return
    }
    if (!editingUserRoleId) {
      toast.error("Please select role")
      return
    }
    try {
      await usersApi.updateUser(editingUserId, {
        name: editingUserName.trim(),
        email: editingUserEmail.trim(),
        phone: editingUserPhone.trim(),
        roleId: editingUserRoleId,
        status: editingUserStatus,
      })
      toast.success("User updated")
      closeUserForm()
      await loadUsersBySection()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to update user"))
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await usersApi.deleteUser(userId)
      toast.success("User deleted")
      await loadUsersBySection()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to delete user"))
    }
  }

  const handleApplyUserFilters = async () => {
    try {
      setLoading(true)
      const roleFilterValue =
        section === "customers"
          ? undefined
          : userRoleFilter === "all"
            ? undefined
            : Number(userRoleFilter)

      await fetchUsers({
        search: userSearch.trim() || undefined,
        roleId: roleFilterValue,
        status: userStatusFilter === "all" ? undefined : userStatusFilter,
        ...(section === "customers" ? { roleName: "customer" } : {}),
        ...(section === "users" ? { excludeRoleNames: "customer,delivery" } : {}),
      })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to apply user filters"))
    } finally {
      setLoading(false)
    }
  }

  const handleResetUserFilters = async () => {
    setUserSearch("")
    setUserRoleFilter("all")
    setUserStatusFilter("all")
    try {
      setLoading(true)
      await loadUsersBySection()
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to reset user filters"))
    } finally {
      setLoading(false)
    }
  }

  const handleExportUsers = () => {
    if (!users.length) {
      toast.error("No data to export")
      return
    }

    const rows = users.map((user) => ({
      Name: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim() || "User",
      Contact: getUserContact(user) === "—" ? "" : getUserContact(user),
      Email: user.email || "",
      Phone: user.phone_number || user.phone || "",
      Role: user.roleModel?.name || user.role || "",
      Status: user.status || "",
      CreatedAt: user.created_at ? new Date(user.created_at).toISOString() : "",
    }))

    const headers = Object.keys(rows[0])
    const csv = [
      headers.join(","),
      ...rows.map((row) =>
        headers
          .map((header) => {
            const cell = String(row[header as keyof typeof row] ?? "")
            return `"${cell.replace(/"/g, '""')}"`
          })
          .join(",")
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${section}-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleSavePermissions = async () => {
    if (!selectedRoleId) {
      toast.error("Please select a role")
      return
    }

    setSaving(true)
    try {
      const payload: RoleMenuPermission[] = rows.map((row) => ({
        menuId: row.menuId,
        canView: row.canView,
        canAdd: row.canAdd,
        canEdit: row.canEdit,
        canDelete: row.canDelete,
        canAssign: row.canAssign,
        canViewAllOrders: row.canViewAllOrders,
        canViewByRole: row.canViewByRole,
        subMenus: row.subMenus.map((sub) => ({
          subMenuId: sub.subMenuId,
          canView: sub.canView,
          canAdd: sub.canAdd,
          canEdit: sub.canEdit,
          canDelete: sub.canDelete,
          canAssign: false,
        })),
      }))

      await rbacApi.updateRolePermissions(selectedRoleId, payload)
      toast.success("Permissions updated successfully")
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save permissions"))
    } finally {
      setSaving(false)
    }
  }

  const titleMap: Record<PermissionsSection, string> = {
    roles: "Roles",
    menus: "Menus",
    users: "Users",
    customers: "Customers",
    "role-permissions": "Role Permissions",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{titleMap[section]}</h1>
        <p className="text-muted-foreground">Permission module section: {titleMap[section]}</p>
      </div>

      {loading ? (
        <Card className="p-4 text-sm text-muted-foreground">Loading...</Card>
      ) : null}

      {section === "roles" && (
        <>
          <Card className="p-4 space-y-4">
            <h2 className="font-semibold">Create New Role</h2>
            <div className="grid gap-3 md:grid-cols-3">
              <Input
                placeholder="Role name (e.g. manager)"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <Input
                placeholder="Description (optional)"
                value={newRoleDescription}
                onChange={(e) => setNewRoleDescription(e.target.value)}
              />
              <Button onClick={handleCreateRole}>Create Role</Button>
            </div>
          </Card>
          <Card className="p-4 space-y-2">
            <h2 className="font-semibold">Existing Roles</h2>
            <div className="rounded border">
              <div className="grid grid-cols-12 border-b bg-muted/30 px-3 py-2 text-xs font-medium">
                <div className="col-span-4">Role</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Users</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {roles.map((role) => (
                <div key={role.id} className="border-b last:border-b-0">
                  <div className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                    <div className="col-span-4 text-sm font-medium">{role.name}</div>
                    <div className="col-span-4 text-xs text-muted-foreground">
                      {role.description || "No description"}
                    </div>
                    <div className="col-span-2">
                      <Badge variant="secondary">users: {role.usersCount || 0}</Badge>
                    </div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setViewRoleId(viewRoleId === role.id ? null : role.id)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => startEditRole(role)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {editingRoleId === role.id && (
                    <div className="grid gap-2 border-t bg-muted/20 px-3 py-2 md:grid-cols-4">
                      <Input value={editingRoleName} onChange={(e) => setEditingRoleName(e.target.value)} />
                      <Input
                        value={editingRoleDescription}
                        onChange={(e) => setEditingRoleDescription(e.target.value)}
                        placeholder="Description"
                      />
                      <Button onClick={handleUpdateRole}>Update</Button>
                      <Button variant="outline" onClick={cancelEditRole}>
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {section === "menus" && (
        <>
          <Card className="p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Create Menu</h2>
              <Button
                variant={showCreateMenuForm ? "outline" : "default"}
                onClick={() => setShowCreateMenuForm((prev) => !prev)}
              >
                {showCreateMenuForm ? "Close Form" : "Create Menu"}
              </Button>
            </div>
            {showCreateMenuForm && (
              <div className="grid gap-3 md:grid-cols-4">
                <Input
                  placeholder="Menu title"
                  value={newMenuTitle}
                  onChange={(e) => setNewMenuTitle(e.target.value)}
                />
                <Input
                  placeholder="Menu url (optional)"
                  value={newMenuUrl}
                  onChange={(e) => setNewMenuUrl(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Order ID"
                  value={newMenuOrder}
                  onChange={(e) => setNewMenuOrder(e.target.value)}
                />
                <Button onClick={handleCreateMenu}>Save Menu</Button>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-semibold">Create Submenu</h2>
              <Button
                variant={showCreateSubMenuForm ? "outline" : "default"}
                onClick={() => setShowCreateSubMenuForm((prev) => !prev)}
              >
                {showCreateSubMenuForm ? "Close Form" : "Create Submenu"}
              </Button>
            </div>
            {showCreateSubMenuForm && (
              <div className="grid gap-3 md:grid-cols-5">
                <Select
                  value={newSubMenuMenuId ? String(newSubMenuMenuId) : ""}
                  onValueChange={(value) => setNewSubMenuMenuId(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent menu" />
                  </SelectTrigger>
                  <SelectContent>
                    {menus.map((menu) => (
                      <SelectItem key={menu.id} value={String(menu.id)}>
                        {menu.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Submenu title"
                  value={newSubMenuTitle}
                  onChange={(e) => setNewSubMenuTitle(e.target.value)}
                />
                <Input
                  placeholder="Submenu url"
                  value={newSubMenuUrl}
                  onChange={(e) => setNewSubMenuUrl(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Order ID"
                  value={newSubMenuOrder}
                  onChange={(e) => setNewSubMenuOrder(e.target.value)}
                />
                <Button onClick={handleCreateSubMenu}>Save Submenu</Button>
              </div>
            )}
          </Card>

          <Card className="p-4 space-y-2">
            <h2 className="font-semibold">Existing Menus</h2>
            <div className="rounded border">
              <div className="grid grid-cols-12 border-b bg-muted/30 px-3 py-2 text-xs font-medium">
                <div className="col-span-3">Menu</div>
                <div className="col-span-4">URL</div>
                <div className="col-span-1">Order</div>
                <div className="col-span-2">Submenus</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              {menus.map((menu) => (
                <div key={menu.id} className="border-b last:border-b-0">
                  <div className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                    <div className="col-span-3 text-sm font-medium">{menu.title}</div>
                    <div className="col-span-4 text-xs text-muted-foreground">{menu.url || "No direct url"}</div>
                    <div className="col-span-1 text-xs">{menu.order ?? 0}</div>
                    <div className="col-span-2 text-xs">{menu.subMenus?.length || 0} items</div>
                    <div className="col-span-2 flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMoveMenu(menu.id, "up")}
                        title="Move up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleMoveMenu(menu.id, "down")}
                        title="Move down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => setViewMenuId(viewMenuId === menu.id ? null : menu.id)}
                      >
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => startEditMenu(menu)}
                      >
                        <Pencil className="mr-1 h-3.5 w-3.5" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                        onClick={() => handleDeleteMenu(menu.id)}
                      >
                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                        Delete
                      </Button>
                    </div>
                  </div>

                  {editingMenuId === menu.id && (
                    <div className="grid gap-2 border-t bg-muted/20 px-3 py-2 md:grid-cols-5">
                      <Input value={editingMenuTitle} onChange={(e) => setEditingMenuTitle(e.target.value)} />
                      <Input
                        value={editingMenuUrl}
                        onChange={(e) => setEditingMenuUrl(e.target.value)}
                        placeholder="Menu url"
                      />
                      <Input
                        type="number"
                        value={editingMenuOrder}
                        onChange={(e) => setEditingMenuOrder(e.target.value)}
                        placeholder="Order ID"
                      />
                      <Button onClick={handleUpdateMenu}>Update</Button>
                      <Button variant="outline" onClick={cancelEditMenu}>
                        Cancel
                      </Button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </Card>
        </>
      )}

      {(section === "users" || section === "customers") && (
        <Card className="p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-semibold">{section === "customers" ? "Customers" : "Staff Users"}</h2>
              <p className="text-xs text-muted-foreground">
                {section === "customers"
                  ? `Manage customer accounts (${users.length})`
                  : `Admin and staff accounts only — customer and delivery are excluded (${users.length})`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleExportUsers}>
                Export Excel
              </Button>
              {section === "users" ? <Button onClick={openCreateUserForm}>Add User</Button> : null}
            </div>
          </div>
          <div className="grid gap-2 rounded-md border bg-muted/20 p-3 md:grid-cols-5">
            <Input
              placeholder="Search by name/email/phone"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="md:col-span-2"
            />
            {section === "users" ? (
              <Select value={userRoleFilter} onValueChange={setUserRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All roles</SelectItem>
                  {staffRoles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div />
            )}
            <Select value={userStatusFilter} onValueChange={setUserStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All status</SelectItem>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
                <SelectItem value="suspended">suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button onClick={handleApplyUserFilters}>Filter</Button>
              <Button variant="outline" onClick={handleResetUserFilters}>
                Reset
              </Button>
            </div>
          </div>
          <div className="rounded border">
            <div className="grid grid-cols-12 border-b bg-muted/30 px-3 py-2 text-xs font-medium">
              <div className="col-span-3">Name</div>
              <div className="col-span-3">Contact</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2 text-right">Actions</div>
            </div>
            {users.map((user) => (
              <div key={user.id} className="border-b last:border-b-0">
                <div className="grid grid-cols-12 items-center gap-2 px-3 py-2">
                  <div className="col-span-3 text-sm font-medium">
                    {getUserDisplayName(user)}
                  </div>
                  <div className="col-span-3 text-xs text-muted-foreground">{getUserContact(user)}</div>
                  <div className="col-span-2 text-xs">{user.roleModel?.name || user.role}</div>
                  <div className="col-span-2">
                    <Badge variant="secondary">{user.status}</Badge>
                  </div>
                  <div className="col-span-2 flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => setViewUserId(viewUserId === user.id ? null : user.id)}
                    >
                      <Eye className="mr-1 h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                      onClick={() => startEditUser(user)}
                    >
                      <Pencil className="mr-1 h-3.5 w-3.5" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {section === "role-permissions" && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="w-[260px]">
              <Select
                value={selectedRoleId ? String(selectedRoleId) : ""}
                onValueChange={(v) => setSelectedRoleId(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={String(role.id)}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {selectedRole && <Badge variant="secondary">Role: {selectedRole.name}</Badge>}
            <Button onClick={handleSavePermissions} disabled={saving || !selectedRoleId}>
              {saving ? "Saving..." : "Save Permissions"}
            </Button>
          </div>

          <div className="space-y-4">
            {menus.map((menu) => {
              const row = rows.find((r) => r.menuId === menu.id)
              if (!row) return null
              return (
                <Card key={menu.id} className="p-4">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{menu.title}</p>
                        {menu.url && <p className="text-xs text-muted-foreground">{menu.url}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(menu.url === "/orders" ? FLAG_COLUMNS : FLAG_COLUMNS.filter((flag) => flag !== "canAssign")).map((flag) => (
                          <Button
                            key={`${menu.id}-${flag}`}
                            variant={row[flag] ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleMenuFlag(menu.id, flag)}
                          >
                            {FLAG_LABELS[flag]}
                          </Button>
                        ))}
                        {menu.url === "/orders"
                          ? ORDER_SCOPE_COLUMNS.map((flag) => (
                              <Button
                                key={`${menu.id}-${flag}`}
                                variant={row[flag] ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleMenuFlag(menu.id, flag)}
                              >
                                {FLAG_LABELS[flag]}
                              </Button>
                            ))
                          : null}
                      </div>
                    </div>
                    {(menu.subMenus || []).length > 0 && (
                      <div className="space-y-2 border-t pt-3">
                        {menu.subMenus?.map((sub) => {
                          const subRow = row.subMenus.find((s) => s.subMenuId === sub.id)
                          if (!subRow) return null
                          return (
                            <div
                              key={sub.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-md border p-2"
                            >
                              <div>
                                <p className="text-sm font-medium">{sub.title}</p>
                                <p className="text-xs text-muted-foreground">{sub.url}</p>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {FLAG_COLUMNS.filter((flag) => flag !== "canAssign").map((flag) => (
                                  <Button
                                    key={`${menu.id}-${sub.id}-${flag}`}
                                    variant={subRow[flag] ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleSubMenuFlag(menu.id, sub.id, flag)}
                                  >
                                    {FLAG_LABELS[flag]}
                                  </Button>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </Card>
      )}

      <Dialog open={!!viewRoleId} onOpenChange={(open) => !open && setViewRoleId(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Role Details</DialogTitle>
          </DialogHeader>
          {viewedRole ? (
            <div className="space-y-3 text-sm">
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Role Name</p>
                <p className="font-medium">{viewedRole.name}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Description</p>
                <p>{viewedRole.description || "No description"}</p>
              </div>
              <div className="rounded-md border p-3">
                <p className="text-xs text-muted-foreground">Users Count</p>
                <p>{viewedRole.usersCount || 0}</p>
              </div>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewRoleId(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewMenuId} onOpenChange={(open) => !open && setViewMenuId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Menu Details</DialogTitle>
          </DialogHeader>
          {viewedMenu ? (
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Title</p>
                  <p className="font-medium">{viewedMenu.title}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">URL</p>
                  <p>{viewedMenu.url || "No direct url"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">Submenus</p>
                {(viewedMenu.subMenus || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground">No submenus</p>
                ) : (
                  viewedMenu.subMenus?.map((subMenu) => (
                    <div
                      key={subMenu.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded border p-2"
                    >
                      {editingSubMenuId === subMenu.id ? (
                        <div className="grid w-full gap-2 md:grid-cols-5">
                          <Input
                            value={editingSubMenuTitle}
                            onChange={(e) => setEditingSubMenuTitle(e.target.value)}
                          />
                          <Input
                            value={editingSubMenuUrl}
                            onChange={(e) => setEditingSubMenuUrl(e.target.value)}
                          />
                          <Input
                            type="number"
                            value={editingSubMenuOrder}
                            onChange={(e) => setEditingSubMenuOrder(e.target.value)}
                            placeholder="Order ID"
                          />
                          <Button onClick={() => handleUpdateSubMenu(viewedMenu.id)}>Update</Button>
                          <Button variant="outline" onClick={cancelEditSubMenu}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div>
                            <p className="text-sm font-medium">{subMenu.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {subMenu.url} | order: {subMenu.order ?? 0}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleMoveSubMenu(viewedMenu.id, subMenu.id, "up")}
                              title="Move up"
                            >
                              <ArrowUp className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0"
                              onClick={() => handleMoveSubMenu(viewedMenu.id, subMenu.id, "down")}
                              title="Move down"
                            >
                              <ArrowDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs"
                              onClick={() => startEditSubMenu(subMenu)}
                            >
                              <Pencil className="mr-1 h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs text-destructive hover:text-destructive"
                              onClick={() => handleDeleteSubMenu(subMenu.id)}
                            >
                              <Trash2 className="mr-1 h-3.5 w-3.5" />
                              Delete
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewMenuId(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewUserId} onOpenChange={(open) => !open && setViewUserId(null)}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {section === "customers" ? "Customer Details" : "User Details"}
            </DialogTitle>
          </DialogHeader>

          {loadingUserDetails ? (
            <div className="flex min-h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewedUserDetails ? (
            <div className="space-y-6 text-sm">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Total Orders</p>
                  <p className="text-2xl font-bold">{viewedUserDetails.stats?.totalOrders || 0}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(Number(viewedUserDetails.stats?.totalSpent || 0))}
                  </p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Delivered</p>
                  <p className="text-2xl font-bold">{viewedUserDetails.stats?.deliveredOrders || 0}</p>
                </Card>
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground">Active Orders</p>
                  <p className="text-2xl font-bold">{viewedUserDetails.stats?.pendingOrders || 0}</p>
                </Card>
              </div>

              <div>
                <h3 className="mb-3 font-semibold">Profile Information</h3>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{getUserDisplayName(viewedUserDetails)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Contact</p>
                    <p>{getUserContact(viewedUserDetails)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p>{viewedUserDetails.email || "N/A"}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p>{viewedUserDetails.phone_number || "N/A"}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Role</p>
                    <p>{viewedUserDetails.roleModel?.name || viewedUserDetails.role}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge variant="secondary">{viewedUserDetails.status}</Badge>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Member Since</p>
                    <p>{viewedUserDetails.created_at ? formatDate(viewedUserDetails.created_at) : "N/A"}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Last Login</p>
                    <p>{viewedUserDetails.last_login_at ? formatDate(viewedUserDetails.last_login_at) : "Never"}</p>
                  </div>
                </div>
              </div>

              {(viewedUserDetails.user_addresses || []).length > 0 ? (
                <>
                  <Separator />
                  <div>
                    <h3 className="mb-3 font-semibold">
                      Addresses ({viewedUserDetails.user_addresses?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {viewedUserDetails.user_addresses?.map((address) => (
                        <div key={address.id} className="rounded-md border p-3">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{address.title}</p>
                            {address.is_default ? <Badge variant="default">Default</Badge> : null}
                          </div>
                          <p className="text-muted-foreground">
                            {address.full_name} • {address.phone_number}
                          </p>
                          <p>
                            {address.street}, {address.city}
                            {address.state ? `, ${address.state}` : ""}, {address.country}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : null}

              <Separator />

              <div>
                <h3 className="mb-3 font-semibold">
                  Purchase History ({viewedUserDetails.orders?.length || 0})
                </h3>
                {(viewedUserDetails.orders || []).length === 0 ? (
                  <p className="text-muted-foreground">No purchases yet.</p>
                ) : (
                  <div className="space-y-3">
                    {viewedUserDetails.orders?.map((order) => (
                      <div key={order.id} className="rounded-md border p-3">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{order.order_number}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.created_at ? formatDate(order.created_at) : "—"}
                              {order.order_type ? ` • ${order.order_type}` : ""}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(Number(order.total))}</p>
                            <div className="flex justify-end gap-1">
                              <Badge variant="secondary">{order.status}</Badge>
                              {order.payment_status ? (
                                <Badge variant="outline">{order.payment_status}</Badge>
                              ) : null}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1 border-t pt-2">
                          {(order.order_items || []).map((item) => (
                            <div key={item.id} className="flex items-center justify-between text-xs">
                              <span>
                                {item.product_name || item.package_name || "Item"}
                                {item.provider_name ? ` (${item.provider_name})` : ""}
                                {" "}x{item.quantity}
                              </span>
                              <span>{formatCurrency(Number(item.total))}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : viewedUser ? (
            <p className="text-sm text-muted-foreground">Could not load full user details.</p>
          ) : null}

          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setViewUserId(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserFormOpen} onOpenChange={(open) => !open && closeUserForm()}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{userFormMode === "create" ? "Add User" : "Edit User"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Full name" value={editingUserName} onChange={(e) => setEditingUserName(e.target.value)} />
            <Input placeholder="Email" value={editingUserEmail} onChange={(e) => setEditingUserEmail(e.target.value)} />
            <Input
              placeholder="Phone (optional)"
              value={editingUserPhone}
              onChange={(e) => setEditingUserPhone(e.target.value)}
            />
            {userFormMode === "create" ? (
              <Input
                type="password"
                placeholder="Password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            ) : (
              <div />
            )}
            <Select
              value={editingUserRoleId ? String(editingUserRoleId) : ""}
              onValueChange={(value) => setEditingUserRoleId(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                {staffRoles.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {role.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={editingUserStatus} onValueChange={setEditingUserStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">active</SelectItem>
                <SelectItem value="inactive">inactive</SelectItem>
                <SelectItem value="suspended">suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={closeUserForm}>
              Cancel
            </Button>
            <Button onClick={userFormMode === "create" ? handleCreateUser : handleUpdateUser}>
              {userFormMode === "create" ? "Create User" : "Update User"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
