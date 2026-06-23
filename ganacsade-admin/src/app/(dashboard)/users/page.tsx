"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, Ban, CheckCircle, Download, Users as UsersIcon } from "lucide-react"
import { User, usersApi } from "@/lib/api/users"
import { rbacApi, type Role } from "@/lib/api/rbac"
import { toast } from "sonner"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("")
  const [appliedStatusFilter, setAppliedStatusFilter] = useState<string>("all")
  const [appliedRoleFilter, setAppliedRoleFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const rolesResponse = await rbacApi.getRoles()
        setRoles(rolesResponse?.data || [])
      } catch {
        toast.error("Failed to load roles from server")
      }
      await fetchUsers()
    }
    init()
  }, [])

  const fetchUsers = async (filters?: {
    search?: string
    status?: string
    roleId?: number
  }) => {
    try {
      setLoading(true)
      const response: any = await usersApi.getUsers({
        search: filters?.search || undefined,
        status: filters?.status && filters.status !== "all" ? filters.status : undefined,
        roleId: filters?.roleId,
      })
      if (response.success && response.data) {
        const mappedUsers = response.data.map((user: any) => ({
          ...user,
          name: user.display_name || `${user.first_name || ""} ${user.last_name || ""}`.trim(),
          phone: user.phone_number,
        }))
        setUsers(mappedUsers)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      toast.error("Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      !appliedSearchQuery ||
      (user.name && user.name.toLowerCase().includes(appliedSearchQuery.toLowerCase())) ||
      (user.display_name && user.display_name.toLowerCase().includes(appliedSearchQuery.toLowerCase())) ||
      user.email?.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(appliedSearchQuery.toLowerCase()))

    const matchesStatus = appliedStatusFilter === "all" || user.status === appliedStatusFilter

    const userRoleId = user.role_id ?? user.roleModel?.id
    const matchesRole =
      appliedRoleFilter === "all" || String(userRoleId) === appliedRoleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const handleApplyFilters = async () => {
    setAppliedSearchQuery(searchQuery)
    setAppliedStatusFilter(statusFilter)
    setAppliedRoleFilter(roleFilter)
    await fetchUsers({
      search: searchQuery.trim() || undefined,
      status: statusFilter,
      roleId: roleFilter === "all" ? undefined : Number(roleFilter),
    })
  }

  const handleResetFilters = async () => {
    setSearchQuery("")
    setStatusFilter("all")
    setRoleFilter("all")
    setAppliedSearchQuery("")
    setAppliedStatusFilter("all")
    setAppliedRoleFilter("all")
    await fetchUsers()
  }

  const handleExportUsers = () => {
    if (!filteredUsers.length) {
      toast.error("No users to export")
      return
    }

    const rows = filteredUsers.map((user) => ({
      Name: user.name || user.display_name || `${user.first_name} ${user.last_name}`.trim(),
      Email: user.email || "",
      Phone: user.phone || user.phone_number || "",
      Role: user.roleModel?.name || user.role || "",
      Status: user.status || "",
      Verified: user.is_verified ? "Yes" : "No",
      Joined: user.created_at ? new Date(user.created_at).toISOString() : "",
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
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response: any = await usersApi.updateStatus(userId, newStatus)
      if (response.success) {
        toast.success(`User status updated to ${newStatus}`)
        await fetchUsers({
          search: appliedSearchQuery || undefined,
          status: appliedStatusFilter,
          roleId: appliedRoleFilter === "all" ? undefined : Number(appliedRoleFilter),
        })
      }
    } catch (error) {
      console.error("Error updating user status:", error)
      toast.error("Failed to update user status")
    }
  }

  const getRoleBadgeVariant = (roleName: string) => {
    const name = roleName.toLowerCase()
    if (name.includes("admin")) return "default"
    if (name.includes("delivery")) return "warning"
    if (name.includes("customer")) return "secondary"
    return "outline"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">
            All users from database — customer, delivery, admin, and staff ({filteredUsers.length})
          </p>
        </div>
        <Button onClick={handleExportUsers}>
          <Download className="mr-2 h-4 w-4" />
          Export Users
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-4">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search users by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.id} value={String(role.id)}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleApplyFilters}>Filter</Button>
          <Button variant="outline" onClick={handleResetFilters}>Reset</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Verification</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    <p className="text-muted-foreground">Loading users...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <UsersIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">No Users Found</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        No users match your current filters.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const roleName = user.roleModel?.name || user.role || "—"
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-sm font-semibold text-primary">
                            {(user.name || user.display_name || user.first_name || "?")
                              .charAt(0)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.name ||
                              user.display_name ||
                              `${user.first_name} ${user.last_name}`.trim()}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{user.email}</p>
                        {user.phone ? (
                          <p className="text-sm text-muted-foreground">{user.phone}</p>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(roleName)}>{roleName}</Badge>
                    </TableCell>
                    <TableCell>
                      {user.is_verified ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Verified</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {user.status === "active" ? (
                            <DropdownMenuItem
                              onClick={() => handleStatusChange(user.id, "suspended")}
                              className="text-destructive"
                            >
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusChange(user.id, "active")}>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
