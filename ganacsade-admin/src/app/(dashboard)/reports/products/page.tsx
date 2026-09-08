"use client"

import { useEffect, useState, useCallback } from "react"
import { productsApi } from "@/lib/api/products"
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
import { Download, Package, Star, TrendingUp, Tag } from "lucide-react"
import { toast } from "sonner"

export default function ProductsReportPage() {
  const [products, setProducts] = useState<any[]>([])
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prodRes, topRes] = await Promise.all([
        productsApi.getProducts({ limit: 100 } as any),
        dashboardApi.getTopProducts(10),
      ])
      const prodData = prodRes?.data || prodRes || []
      setProducts(Array.isArray(prodData) ? prodData : [])
      const topData = topRes?.data || topRes || []
      setTopProducts(Array.isArray(topData) ? topData : [])
    } catch {
      toast.error("Failed to load products report")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const handleExport = () => {
    if (!products.length) { toast.error("No data to export"); return }
    const rows = products.map((p: any) => ({
      Name: p.name || p.name_en || "",
      Category: p.category?.name || "",
      Price: p.price ?? 0,
      Stock: p.stock ?? p.quantity ?? 0,
      Featured: p.is_featured ? "Yes" : "No",
      Active: p.is_active !== false ? "Yes" : "No",
    }))
    const headers = Object.keys(rows[0])
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String(r[h as keyof typeof r] ?? "").replace(/"/g, '""')}"`).join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a"); a.href = url; a.download = `products-report-${new Date().toISOString().slice(0, 10)}.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  // Category distribution
  const catMap: Record<string, number> = {}
  products.forEach(p => {
    const cat = p.category?.name || "Uncategorized"
    catMap[cat] = (catMap[cat] || 0) + 1
  })

  const featuredCount = products.filter(p => p.is_featured).length
  const activeCount = products.filter(p => p.is_active !== false).length

  const statCards = [
    { label: "Total Products", value: products.length, icon: Package },
    { label: "Featured", value: featuredCount, icon: Star },
    { label: "Active", value: activeCount, icon: TrendingUp },
    { label: "Categories", value: Object.keys(catMap).length, icon: Tag },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products Report</h1>
          <p className="text-muted-foreground">Product inventory, top sellers and category overview.</p>
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

      {/* Category breakdown */}
      {!loading && Object.keys(catMap).length > 0 && (
        <Card className="p-5">
          <h2 className="font-semibold text-lg mb-4">Products by Category</h2>
          <div className="flex flex-wrap gap-3">
            {Object.entries(catMap).sort((a, b) => b[1] - a[1]).map(([cat, count]) => (
              <div key={cat} className="flex items-center gap-2 rounded-lg border px-4 py-2">
                <span className="font-medium text-sm">{cat}</span>
                <Badge variant="secondary">{count}</Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Top selling products */}
      {topProducts.length > 0 && (
        <Card>
          <div className="px-5 pt-5 pb-3 border-b">
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
              {topProducts.map((p: any, idx) => (
                <TableRow key={p.id || idx}>
                  <TableCell className="text-muted-foreground">{idx + 1}</TableCell>
                  <TableCell className="font-medium">{p.name || p.product_name || "—"}</TableCell>
                  <TableCell>{p.total_sold ?? p.quantity ?? 0}</TableCell>
                  <TableCell>${Number(p.total_revenue ?? p.revenue ?? 0).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* All products */}
      <Card>
        <div className="px-5 pt-5 pb-3 border-b">
          <h2 className="font-semibold text-lg">All Products</h2>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Featured</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">Loading…</TableCell></TableRow>
            ) : products.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="py-10 text-center text-muted-foreground">No products found.</TableCell></TableRow>
            ) : (
              products.slice(0, 100).map((p: any, idx) => (
                <TableRow key={p.id || idx}>
                  <TableCell className="font-medium">{p.name || p.name_en || "—"}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.category?.name || "—"}</TableCell>
                  <TableCell>${Number(p.price ?? 0).toLocaleString()}</TableCell>
                  <TableCell>{p.stock ?? p.quantity ?? "—"}</TableCell>
                  <TableCell>
                    {p.is_featured ? <Badge variant="warning">Featured</Badge> : <Badge variant="outline">No</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active !== false ? "success" : "secondary"}>
                      {p.is_active !== false ? "Active" : "Inactive"}
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
