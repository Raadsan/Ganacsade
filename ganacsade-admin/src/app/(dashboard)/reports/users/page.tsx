"use client"

import { useEffect, useState, useCallback } from "react"
import { usersApi, User } from "@/lib/api/users"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Download, Users as UsersIcon, UserCheck, UserX, ShieldCheck } from "lucide-react"
import { toast } from "sonner"

export default function UsersReportPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const res: any = await usersApi.getUsers({ limit: "all" })
      const data = res?.data || res || []
      setUsers(Array.isArray(data) ? data.map((u: any) => ({
        ...u,
        name: u.display_name || `${u.first_name || ""} ${u.last_name || ""}`.trim(),
        phone: u.phone_number,
      })) : [])
    } catch {
      toast.error("Failed to load users report")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    if (!users.length) { toast.error("No data to export"); return }
    const rows = users.map((u) => ({
      Name: u.name || u.display_name || "",
      Email: u.email,
      Phone: u.phone || u.phone_number || "",
      Role: u.roleModel?.name || u.role || "",
      Status: u.status,
      Verified: u.is_verified ? "Yes" : "No",
      Joined: u.created_at ? new Date(u.created_at).toLocaleDateString() : "",
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `users-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = users.filter(u => u.status === "active").length
  const inactiveCount = users.filter(u => u.status === "inactive").length
  const verifiedCount = users.filter(u => u.is_verified).length

  const statCards = [
    { label: "Total Users", value: users.length, icon: UsersIcon },
    { label: "Active", value: activeCount, icon: UserCheck },
    { label: "Inactive / Suspended", value: inactiveCount + users.filter(u => u.status === "suspended").length, icon: UserX },
    { label: "Verified", value: verifiedCount, icon: ShieldCheck },
  ]

  // Role distribution — normalize to lowercase key to prevent "Staf"/"staff" duplicates
  const roleMapNormalized: Record<string, { display: string; count: number }> = {}
  users.forEach(u => {
    const rawRole = u.roleModel?.name || u.role || "Unknown"
    const key = rawRole.toLowerCase().trim()
    if (!roleMapNormalized[key]) {
      roleMapNormalized[key] = { display: rawRole, count: 0 }
    }
    roleMapNormalized[key].count += 1
  })
  const roleMap = roleMapNormalized

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users Report</h1>
          <p className="text-muted-foreground">User registrations, activity and role distribution.</p>
        </div>
        <Button onClick={handleExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <Card key={s.label} className="p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-2xl font-bold">{loading ? "…" : s.value}</p>
            </Card>
          )
        })}
      </div>

      {/* Role distribution */}
      {!loading && Object.keys(roleMap).length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-4">Role Distribution</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(roleMap)
              .sort((a, b) => b[1].count - a[1].count)
              .map(([key, { display, count }]) => (
                <div key={key} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                  <span className="font-medium capitalize">{display}</span>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
          </div>
        </Card>
      )}

      {/* Users table */}
      <Card>
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-lg">All Users</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Verified</TableHead>
              <TableHead>Joined</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : users.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No users found.</TableCell></TableRow>
            ) : (
              users.slice(0, 100).map((u, idx) => (
                <TableRow key={u.id || idx}>
                  <TableCell className="font-medium">{u.name || u.display_name || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{u.roleModel?.name || u.role || "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.status === "active" ? "success" : u.status === "suspended" ? "destructive" : "secondary"}>
                      {u.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.is_verified
                      ? <Badge variant="success">Verified</Badge>
                      : <Badge variant="secondary">No</Badge>
                    }
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
