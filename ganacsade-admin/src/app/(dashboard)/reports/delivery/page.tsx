"use client"

import { useEffect, useState, useCallback } from "react"
import { deliveryPersonsApi, DeliveryPerson } from "@/lib/api/delivery-persons"
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
import { Download, Truck, CheckCircle, Star, Users } from "lucide-react"
import { toast } from "sonner"

// Combined row for display — may come from delivery_persons profile OR just a users row
interface DeliveryRow {
  id: string
  name: string
  email: string
  phone: string
  vehicle_type?: string | null
  total_deliveries?: number
  rating?: number | null
  is_available?: boolean
  is_active: boolean
  hasProfile: boolean // true if they have a delivery_persons profile
}

export default function DeliveryReportPage() {
  const [rows, setRows] = useState<DeliveryRow[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      // Fetch both sources in parallel
      const [profilesRes, usersRes] = await Promise.allSettled([
        deliveryPersonsApi.getAll({ limit: 100 } as any),
        usersApi.getUsers({ roleName: "delivery", limit: "all" }),
      ])

      // --- Profiles from delivery_persons table ---
      const profilesData: DeliveryPerson[] =
        profilesRes.status === "fulfilled"
          ? Array.isArray((profilesRes.value as any)?.data)
            ? (profilesRes.value as any).data
            : []
          : []

      // Build a set of user_ids that have a profile
      const profileUserIds = new Set(
        profilesData.map((p) => p.user_id).filter(Boolean)
      )

      // Map profiles → DeliveryRow
      const profileRows: DeliveryRow[] = profilesData.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        phone: p.phone,
        vehicle_type: p.vehicle_type,
        total_deliveries: p.total_deliveries ?? 0,
        rating: p.rating,
        is_available: p.is_available ?? false,
        is_active: p.is_active !== false && (p.users?.status === "active" || !p.users),
        hasProfile: true,
      }))

      // --- Users with delivery role (no profile yet) ---
      const usersData: User[] =
        usersRes.status === "fulfilled"
          ? Array.isArray((usersRes.value as any)?.data)
            ? (usersRes.value as any).data
            : []
          : []

      const userOnlyRows: DeliveryRow[] = usersData
        .filter((u) => !profileUserIds.has(u.id)) // skip those already in profiles
        .map((u) => ({
          id: u.id,
          name:
            u.display_name ||
            `${u.first_name || ""} ${u.last_name || ""}`.trim() ||
            u.email,
          email: u.email,
          phone: u.phone_number || u.phone || "",
          vehicle_type: null,
          total_deliveries: 0,
          rating: null,
          is_available: false,
          is_active: u.status === "active",
          hasProfile: false,
        }))

      setRows([...profileRows, ...userOnlyRows])
    } catch {
      toast.error("Failed to load delivery report")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = () => {
    if (!rows.length) {
      toast.error("No data to export")
      return
    }
    const exportRows = rows.map((d) => ({
      Name: d.name,
      Email: d.email,
      Phone: d.phone,
      Vehicle: d.vehicle_type || "",
      "Total Deliveries": d.total_deliveries ?? 0,
      Rating: d.rating ?? "—",
      Available: d.is_available ? "Yes" : "No",
      Active: d.is_active ? "Yes" : "No",
      "Has Profile": d.hasProfile ? "Yes" : "No",
    }))
    const headers = Object.keys(exportRows[0])
    const csv = [
      headers.join(","),
      ...exportRows.map((r) =>
        headers
          .map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `delivery-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeCount = rows.filter((d) => d.is_active).length
  const availableCount = rows.filter((d) => d.is_available).length
  const totalDeliveries = rows.reduce((sum, d) => sum + (d.total_deliveries ?? 0), 0)
  const ratedRows = rows.filter((d) => d.rating != null)
  const avgRating =
    ratedRows.length > 0
      ? (ratedRows.reduce((s, d) => s + (d.rating ?? 0), 0) / ratedRows.length).toFixed(1)
      : "—"

  const statCards = [
    { label: "Total Delivery Staff", value: rows.length, icon: Users },
    { label: "Active", value: activeCount, icon: CheckCircle },
    { label: "Available Now", value: availableCount, icon: Truck },
    { label: "Total Deliveries", value: totalDeliveries, icon: Star },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Report</h1>
          <p className="text-muted-foreground">
            All delivery staff — profiles and role-based users combined.
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Download className="mr-2 h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* Stat cards */}
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

      {/* Average rating */}
      {!loading && avgRating !== "—" && (
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Star className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Average Rating (profiled staff)</p>
            <p className="text-2xl font-bold">{avgRating} / 5</p>
          </div>
        </Card>
      )}

      {/* Table */}
      <Card>
        <div className="px-5 pt-5 pb-3 border-b flex items-center justify-between">
          <h2 className="font-semibold text-lg">Delivery Personnel</h2>
          <div className="flex gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-primary inline-block" /> Has Profile
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-muted-foreground/40 inline-block" /> Role only
            </span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Deliveries</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Available</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                  No delivery staff found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((d, idx) => (
                <TableRow key={d.id || idx}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: d.hasProfile
                            ? "hsl(var(--primary))"
                            : "hsl(var(--muted-foreground) / 0.4)",
                        }}
                      />
                      <span className="font-medium">{d.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm">{d.email}</p>
                    {d.phone && (
                      <p className="text-xs text-muted-foreground">{d.phone}</p>
                    )}
                  </TableCell>
                  <TableCell className="capitalize text-sm">
                    {d.vehicle_type || (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{d.total_deliveries ?? 0}</TableCell>
                  <TableCell>
                    {d.rating != null ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {d.rating}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {d.hasProfile ? (
                      d.is_available ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="secondary">Unavailable</Badge>
                      )
                    ) : (
                      <span className="text-muted-foreground text-xs">No profile</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={d.is_active ? "success" : "secondary"}>
                      {d.is_active ? "Active" : "Inactive"}
                    </Badge>
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
