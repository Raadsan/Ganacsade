"use client"

import { useEffect, useState, useCallback } from "react"
import { dashboardApi } from "@/lib/api/dashboard"
import { ordersApi } from "@/lib/api/orders"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { Download, TrendingUp, ShoppingCart, DollarSign, Package } from "lucide-react"
import { toast } from "sonner"

interface SalesStat {
  label: string
  value: string | number
  icon: React.ElementType
  sub?: string
}

export default function SalesReportPage() {
  const [stats, setStats] = useState<any>(null)
  const [salesData, setSalesData] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [period, setPeriod] = useState("all")
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [statsRes, salesRes, topRes] = await Promise.all([
        dashboardApi.getStats(),
        dashboardApi.getSalesData(),
        dashboardApi.getTopProducts(10),
      ])
      setStats(statsRes?.data || (statsRes as any) || null)
      const salesArr = (salesRes as any)?.data || salesRes
      setSalesData(Array.isArray(salesArr) ? salesArr : [])
      const topArr = (topRes as any)?.data || topRes
      setTopProducts(Array.isArray(topArr) ? topArr : [])
    } catch {
      toast.error("Failed to load sales report data")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleExport = () => {
    if (!salesData.length && !topProducts.length) {
      toast.error("No data to export")
      return
    }
    const rows = topProducts.map((p: any) => ({
      Product: p.name || p.product_name || "—",
      "Total Sold": p.total_sold ?? p.quantity ?? 0,
      Revenue: p.total_revenue ?? p.revenue ?? 0,
    }))
    const headers = Object.keys(rows[0] || {})
    if (!headers.length) { toast.error("No data"); return }
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sales-report-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statCards: SalesStat[] = [
    {
      label: "Total Revenue",
      value: stats?.totalRevenue != null ? `$${Number(stats.totalRevenue).toLocaleString()}` : "—",
      icon: DollarSign,
      sub: "All time",
    },
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? "—",
      icon: ShoppingCart,
      sub: "All time",
    },
    {
      label: "Products Sold",
      value: stats?.totalProducts ?? "—",
      icon: Package,
      sub: "Active products",
    },
    {
      label: "Avg. Order Value",
      value:
        stats?.totalRevenue && stats?.totalOrders && stats.totalOrders > 0
          ? `$${(Number(stats.totalRevenue) / Number(stats.totalOrders)).toFixed(2)}`
          : "—",
      icon: TrendingUp,
      sub: "Per order",
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sales Report</h1>
          <p className="text-muted-foreground">Revenue, order volume and product performance.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExport} className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
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
              {s.sub && <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>}
            </Card>
          )
        })}
      </div>

      {/* Top selling products table */}
      <Card>
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-lg">Top Selling Products</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Qty Sold</TableHead>
              <TableHead>Revenue</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">Loading…</TableCell>
              </TableRow>
            ) : topProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">No data available.</TableCell>
              </TableRow>
            ) : (
              topProducts.map((p: any, idx) => (
                <TableRow key={p.id || idx}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{p.name || p.product_name || "—"}</TableCell>
                  <TableCell>{p.total_sold ?? p.quantity ?? 0}</TableCell>
                  <TableCell>${Number(p.total_revenue ?? p.revenue ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Sales trend */}
      {salesData.length > 0 && (
        <Card>
          <div className="px-5 pt-5 pb-3 border-b">
            <h2 className="font-semibold text-lg">Sales Trend</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salesData.map((row: any, idx) => (
                <TableRow key={idx}>
                  <TableCell>{row.date || row.period || row.month || "—"}</TableCell>
                  <TableCell>{row.orders ?? row.order_count ?? 0}</TableCell>
                  <TableCell>${Number(row.revenue ?? row.total_revenue ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  )
}
