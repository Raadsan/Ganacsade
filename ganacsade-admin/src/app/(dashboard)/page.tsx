"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DollarSign, ShoppingCart, Users, Package, TrendingUp, TrendingDown } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { dashboardApi, OrdersByStatus } from "@/lib/api/dashboard"
import { DashboardStats, RecentOrder, SalesData, TopProduct } from "@/types"
import { BACKEND_URL } from "@/lib/api/client"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"

// ─── helpers ────────────────────────────────────────────────────────────────

function ChangeLabel({ value }: { value: number }) {
  const positive = value >= 0
  const Icon = positive ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 ${positive ? "text-green-600" : "text-red-600"}`}>
      <Icon className="h-3 w-3" />
      {positive ? "+" : ""}{value}%
    </span>
  )
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "#f59e0b",
  processing: "#3b82f6",
  confirmed:  "#8b5cf6",
  shipped:    "#06b6d4",
  delivered:  "#10b981",
  cancelled:  "#ef4444",
  refunded:   "#6b7280",
}

function statusLabel(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function orderStatusBadge(status: string) {
  const map: Record<string, "default" | "secondary" | "destructive" | "success"> = {
    delivered: "success",
    cancelled: "destructive",
    pending:   "secondary",
  }
  return <Badge variant={map[status] ?? "default"}>{statusLabel(status)}</Badge>
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0, totalOrders: 0, totalUsers: 0, totalProducts: 0,
    revenueChange: 0, ordersChange: 0, usersChange: 0, productsChange: 0,
  })
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [topProducts, setTopProducts] = useState<TopProduct[]>([])
  const [ordersByStatus, setOrdersByStatus] = useState<OrdersByStatus[]>([])
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [quickStats, setQuickStats] = useState({
    pending_orders: 0, low_stock_products: 0, out_of_stock: 0, new_users_today: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        const [s, sales, top, byStatus, orders, quick] = await Promise.all([
          dashboardApi.getStats(),
          dashboardApi.getSalesData(),
          dashboardApi.getTopProducts(5),
          dashboardApi.getOrdersByStatus(),
          dashboardApi.getRecentOrders(5),
          dashboardApi.getQuickStats(),
        ])
        if (s.success && s.data)             setStats(s.data)
        if (sales.success && sales.data)     setSalesData(sales.data)
        if (top.success && top.data)         setTopProducts(top.data)
        if (byStatus.success && byStatus.data) setOrdersByStatus(byStatus.data)
        if (orders.success && orders.data)   setRecentOrders(orders.data)
        if (quick.success && quick.data)     setQuickStats(quick.data)
      } catch {
        // axios interceptor shows toast on error
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalOrdersForPie = ordersByStatus.reduce((a, b) => a + b.count, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">Welcome back to GANACSADE Admin</p>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────────── */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.totalRevenue)}
          change={stats.revenueChange}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(stats.totalOrders)}
          change={stats.ordersChange}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Users"
          value={formatNumber(stats.totalUsers)}
          change={stats.usersChange}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Products"
          value={formatNumber(stats.totalProducts)}
          change={stats.productsChange}
          icon={<Package className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      {/* ── Revenue chart + Order status ─────────────────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Revenue & Orders over time */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue &amp; Orders — Last 12 Months</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                Loading chart…
              </div>
            ) : salesData.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                No sales data available yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={salesData} margin={{ top: 4, right: 12, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis yAxisId="rev" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v}`} />
                  <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: any, name: string) =>
                      name === "revenue" ? [formatCurrency(value), "Revenue"] : [value, "Orders"]
                    }
                  />
                  <Legend />
                  <Area
                    yAxisId="rev"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                    name="Revenue"
                  />
                  <Area
                    yAxisId="ord"
                    type="monotone"
                    dataKey="orders"
                    stroke="#10b981"
                    fill="url(#colorOrders)"
                    strokeWidth={2}
                    name="Orders"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Order status pie */}
        <Card>
          <CardHeader>
            <CardTitle>Orders by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                Loading…
              </div>
            ) : ordersByStatus.length === 0 ? (
              <div className="flex h-64 items-center justify-center text-muted-foreground text-sm">
                No orders yet
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={2}
                    >
                      {ordersByStatus.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [v, "Orders"]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-2 space-y-1">
                  {ordersByStatus.map((s) => (
                    <div key={s.status} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ background: STATUS_COLORS[s.status] ?? "#94a3b8" }}
                        />
                        {statusLabel(s.status)}
                      </span>
                      <span className="font-medium">
                        {s.count}
                        <span className="ml-1 text-muted-foreground text-xs">
                          ({totalOrdersForPie ? Math.round((s.count / totalOrdersForPie) * 100) : 0}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Top products + Recent orders + Quick stats ──────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">Loading…</div>
            ) : topProducts.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">No products sold yet</div>
            ) : (
              <div className="space-y-3">
                {topProducts.map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                    <div className="h-9 w-9 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      {p.image ? (
                        <img
                          src={p.image.startsWith("http") ? p.image : `${BACKEND_URL}${p.image}`}
                          alt={p.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.totalSold} sold</p>
                    </div>
                    <span className="text-sm font-semibold text-right">{formatCurrency(p.revenue)}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">Loading…</div>
            ) : recentOrders.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">No orders yet</div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((o) => (
                  <div key={o.id} className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">#{o.orderNumber}</p>
                      <p className="text-xs text-muted-foreground truncate">{o.customerName}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-semibold">
                        {formatCurrency(typeof o.total === "string" ? parseFloat(o.total) : o.total)}
                      </p>
                      {orderStatusBadge(o.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuickStatRow
                label="Pending Orders"
                value={quickStats.pending_orders}
                color="text-yellow-600"
              />
              <QuickStatRow
                label="Low Stock Products"
                value={quickStats.low_stock_products}
                color="text-orange-600"
              />
              <QuickStatRow
                label="Out of Stock"
                value={quickStats.out_of_stock}
                color="text-red-600"
              />
              <QuickStatRow
                label="New Users Today"
                value={`+${quickStats.new_users_today}`}
                color="text-green-600"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── sub-components ──────────────────────────────────────────────────────────

function StatCard({
  title, value, change, icon, loading,
}: {
  title: string
  value: string
  change: number
  icon: React.ReactNode
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? <span className="text-muted-foreground">—</span> : value}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {loading ? "Loading…" : <><ChangeLabel value={change} /> from last month</>}
        </p>
      </CardContent>
    </Card>
  )
}

function QuickStatRow({
  label, value, color,
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${color}`}>{value}</span>
    </div>
  )
}
