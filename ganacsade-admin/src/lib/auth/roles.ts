import type { LoggedInUser } from "@/lib/api/auth"

export const getRoleName = (user?: LoggedInUser | null) =>
  String(user?.roleModel?.name || user?.role || "").trim().toLowerCase()

export const isCustomerUser = (user?: LoggedInUser | null) => {
  const roleName = getRoleName(user)
  return roleName === "customer" || user?.role === "customer"
}

export const isDeliveryUser = (user?: LoggedInUser | null) => {
  if (!user) return false
  const roleName = getRoleName(user)
  return roleName.includes("delivery") || user.role === "delivery_person"
}

export const isDashboardUser = (user?: LoggedInUser | null) => {
  if (!user) return false
  if (isCustomerUser(user)) return false

  const roleName = getRoleName(user)
  if (
    roleName.includes("admin")
    || roleName.includes("staff")
    || roleName.includes("staf")
    || roleName.includes("delivery")
  ) {
    return true
  }

  return ["admin", "staff", "delivery_person"].includes(String(user.role || ""))
}

export const getPostLoginPath = (user?: LoggedInUser | null) => {
  if (isCustomerUser(user)) return "/my-orders"

  const roleName = getRoleName(user)
  if (roleName.includes("delivery")) {
    return "/delivery-dashboard"
  }

  return "/dashboard/overview"
}
