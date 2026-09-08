"use client"

import { useEffect, useState, useCallback } from "react"
import { ordersApi } from "@/lib/api/orders"
import { dashboardApi } from "@/lib/api/dashboard"
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
import { Download, ShoppingCart, Clock, CheckCircle, XCircle } from "lucide-react"
import { toast } from "sonner"

const STATUS_COLORS: Record<string, string> = {
  pending: "secondary",
  processing: "warning",
  delivered: "success",
  cancelled: "destructive",
  refunded: "outline",
}

export default function OrdersReportPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [ordersRes, statusRes] = await Promise.all([
        ordersApi.getOrders({ limit: 100 } as any),
        dashboardApi.getOrdersByStatus(),
      ])
      const ordersData = ordersRes?.data || ordersRes || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
      const statusData = statusRes?.data || statusRes || []
      setStatusBreakdown(Array.isArray(statusData) ? statusData : [])
    } catch {
      toast.error("Failed to load orders report")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    if (!orders.length) { toast.error("No data to export"); return }
    const rows = orders.map((o: any) => ({
      "Order #": o.order_number || o.id,
      Customer: o.customer_name || o.user?.name || "—",
      Status: o.status || "—",
      Total: o.total_amount ?? o.total ?? 0,
      Date: o.created_at ? new Date(o.created_at).toLocaleDateString() : "—",
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `orders-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  const statCards = [
    { label: "Total Orders", value: orders.length, icon: ShoppingCart },
    { label: "Pending", value: orders.filter(o => o.status === "pending").length, icon: Clock },
    { label: "Delivered", value: orders.filter(o => o.status === "delivered").length, icon: CheckCircle },
    { label: "Cancelled", value: orders.filter(o => o.status === "cancelled").length, icon: XCircle },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders Report</h1>
          <p className="text-muted-foreground">Order volume, status breakdown and recent orders.</p>
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

      {/* Status breakdown */}
      {statusBreakdown.length > 0 && (
        <Card>
          <div className="px-5 pt-5 pb-3 border-b">
            <h2 className="font-semibold text-lg">Orders by Status</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {statusBreakdown.map((row: any, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Badge variant={(STATUS_COLORS[row.status] as any) || "outline"}>
                      {row.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{row.count ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Recent orders table */}
      <Card>
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-lg">Recent Orders</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : orders.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="py-10 text-center text-muted-foreground">No orders found.</TableCell></TableRow>
            ) : (
              orders.slice(0, 50).map((o: any, idx) => (
                <TableRow key={o.id || idx}>
                  <TableCell className="font-mono text-xs">{o.order_number || o.id}</TableCell>
                  <TableCell>{o.customer_name || o.user?.name || o.user?.display_name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant={(STATUS_COLORS[o.status] as any) || "outline"}>{o.status || "—"}</Badge>
                  </TableCell>
                  <TableCell>${Number(o.total_amount ?? o.total ?? 0).toLocaleString()}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
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
