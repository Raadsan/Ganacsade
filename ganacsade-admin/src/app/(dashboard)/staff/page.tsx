"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  KeyRound,
  UserCog,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react"
import {
  staffApi,
  StaffMember,
  CreateStaffDto,
  UpdateStaffDto,
  StaffRole,
} from "@/lib/api/staff"
import { toast } from "sonner"

// ─── helpers ────────────────────────────────────────────────────────────────

function RoleBadge({ role }: { role: StaffRole }) {
  return role === "admin" ? (
    <Badge variant="default" className="gap-1">
      <ShieldCheck className="h-3 w-3" /> Admin
    </Badge>
  ) : (
    <Badge variant="secondary" className="gap-1">
      <ShieldAlert className="h-3 w-3" /> Staff
    </Badge>
  )
}

function StatusBadge({ status }: { status: string }) {
  if (status === "active")
    return <Badge variant="success">Active</Badge>
  if (status === "suspended")
    return <Badge variant="destructive">Suspended</Badge>
  return <Badge variant="secondary">Inactive</Badge>
}

const emptyCreate: CreateStaffDto = {
  firstName: "",
  lastName: "",
  email: "",
  phoneNumber: "",
  password: "",
  role: "staff",
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function StaffPage() {
  const [members, setMembers] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  // create dialog
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateStaffDto>(emptyCreate)
  const [creating, setCreating] = useState(false)

  // edit dialog
  const [editTarget, setEditTarget] = useState<StaffMember | null>(null)
  const [editForm, setEditForm] = useState<UpdateStaffDto>({})
  const [editing, setEditing] = useState(false)

  // password reset dialog
  const [pwTarget, setPwTarget] = useState<StaffMember | null>(null)
  const [newPassword, setNewPassword] = useState("")
  const [resetting, setResetting] = useState(false)

  // delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null)
  const [deleting, setDeleting] = useState(false)

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await staffApi.getAll({
        search: search || undefined,
        role: (roleFilter !== "all" ? roleFilter : undefined) as StaffRole | undefined,
      })
      if (res.success) setMembers(res.data)
    } catch {
      toast.error("Failed to load staff members")
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  // ── create ──────────────────────────────────────────────────────────────────

  const handleCreate = async () => {
    if (!createForm.firstName || !createForm.lastName || !createForm.email ||
        !createForm.phoneNumber || !createForm.password) {
      toast.error("All fields are required")
      return
    }
    try {
      setCreating(true)
      const res = await staffApi.create(createForm)
      if (res.success) {
        toast.success(res.message || "Staff member created")
        setCreateOpen(false)
        setCreateForm(emptyCreate)
        fetchMembers()
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || "Failed to create staff member"
      toast.error(msg)
    } finally {
      setCreating(false)
    }
  }

  // ── edit ────────────────────────────────────────────────────────────────────

  const openEdit = (m: StaffMember) => {
    setEditTarget(m)
    setEditForm({
      firstName: m.first_name,
      lastName: m.last_name,
      email: m.email,
      phoneNumber: m.phone_number,
      role: m.role,
      status: m.status,
    })
  }

  const handleEdit = async () => {
    if (!editTarget) return
    try {
      setEditing(true)
      const res = await staffApi.update(editTarget.id, editForm)
      if (res.success) {
        toast.success("Staff member updated")
        setEditTarget(null)
        fetchMembers()
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to update staff member")
    } finally {
      setEditing(false)
    }
  }

  // ── password reset ───────────────────────────────────────────────────────────

  const handlePasswordReset = async () => {
    if (!pwTarget) return
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setResetting(true)
      const res = await staffApi.resetPassword(pwTarget.id, newPassword)
      if (res.success) {
        toast.success("Password reset successfully")
        setPwTarget(null)
        setNewPassword("")
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to reset password")
    } finally {
      setResetting(false)
    }
  }

  // ── delete ───────────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      setDeleting(true)
      const res = await staffApi.remove(deleteTarget.id)
      if (res.success) {
        toast.success("Staff member removed")
        setDeleteTarget(null)
        fetchMembers()
      }
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed to remove staff member")
    } finally {
      setDeleting(false)
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Staff</h1>
          <p className="text-muted-foreground">
            Manage admin and staff accounts
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Staff Member
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead>Added</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
                    <p className="text-muted-foreground">Loading...</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                      <UserCog className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">No staff members found</p>
                      <p className="text-sm text-muted-foreground">
                        Add your first staff member to get started.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              members.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <span className="text-sm font-semibold text-primary">
                          {m.first_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">
                        {m.first_name} {m.last_name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{m.email}</TableCell>
                  <TableCell className="text-muted-foreground">{m.phone_number}</TableCell>
                  <TableCell><RoleBadge role={m.role} /></TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {m.last_login_at
                      ? new Date(m.last_login_at).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(m.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(m)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => { setPwTarget(m); setNewPassword("") }}>
                          <KeyRound className="mr-2 h-4 w-4" />
                          Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteTarget(m)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ── Create Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input
                  value={createForm.firstName}
                  onChange={(e) => setCreateForm({ ...createForm, firstName: e.target.value })}
                  placeholder="John"
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  value={createForm.lastName}
                  onChange={(e) => setCreateForm({ ...createForm, lastName: e.target.value })}
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input
                value={createForm.phoneNumber}
                onChange={(e) => setCreateForm({ ...createForm, phoneNumber: e.target.value })}
                placeholder="+252612345678"
              />
            </div>
            <div className="space-y-1">
              <Label>Password</Label>
              <Input
                type="password"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min. 6 characters"
              />
            </div>
            <div className="space-y-1">
              <Label>Role</Label>
              <Select
                value={createForm.role}
                onValueChange={(v) => setCreateForm({ ...createForm, role: v as StaffRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="staff">Staff — limited access</SelectItem>
                  <SelectItem value="admin">Admin — full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ───────────────────────────────────────────────────────── */}
      <Dialog open={Boolean(editTarget)} onOpenChange={(o) => !o && setEditTarget(null)}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Edit Staff Member</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input
                  value={editForm.firstName ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  value={editForm.lastName ?? ""}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                type="email"
                value={editForm.email ?? ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <Input
                value={editForm.phoneNumber ?? ""}
                onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Role</Label>
                <Select
                  value={editForm.role ?? "staff"}
                  onValueChange={(v) => setEditForm({ ...editForm, role: v as StaffRole })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <Select
                  value={editForm.status ?? "active"}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as any })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>Cancel</Button>
            <Button onClick={handleEdit} disabled={editing}>
              {editing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset Password Dialog ─────────────────────────────────────────────── */}
      <Dialog open={Boolean(pwTarget)} onOpenChange={(o) => !o && setPwTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Set a new password for{" "}
            <strong>{pwTarget?.first_name} {pwTarget?.last_name}</strong>.
          </p>
          <div className="space-y-1 py-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPwTarget(null)}>Cancel</Button>
            <Button onClick={handlePasswordReset} disabled={resetting}>
              {resetting ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      <Dialog open={Boolean(deleteTarget)} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Remove Staff Member</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove{" "}
            <strong>{deleteTarget?.first_name} {deleteTarget?.last_name}</strong>? Their account
            will be deactivated and they will no longer be able to log in.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Removing..." : "Remove"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
