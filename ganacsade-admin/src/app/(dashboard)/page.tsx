"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, ShoppingCart, Users, Package } from "lucide-react"
import { formatCurrency, formatNumber } from "@/lib/utils"
import { dashboardApi } from "@/lib/api/dashboard"
import { DashboardStats, RecentOrder } from "@/types"

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    revenueChange: 0,
    ordersChange: 0,
    usersChange: 0,
    productsChange: 0,
  })
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [quickStats, setQuickStats] = useState({
    pending_orders: 0,
    low_stock_products: 0,
    out_of_stock: 0,
    new_users_today: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await dashboardApi.getStats()
        if (statsResponse.success) {
          setStats(statsResponse.data)
        }

        // Fetch recent orders
        const ordersResponse = await dashboardApi.getRecentOrders(5)
        if (ordersResponse.success) {
          setRecentOrders(ordersResponse.data)
        }

        // Fetch quick stats
        const quickStatsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/dashboard/quick-stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        })
        const quickStatsData = await quickStatsResponse.json()
        if (quickStatsData.success) {
          setQuickStats(quickStatsData.data)
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to GANACSADE Admin Dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.revenueChange}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalOrders)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.ordersChange}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalUsers)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.usersChange}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(stats.totalProducts)}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{stats.productsChange}%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-sm text-muted-foreground">Loading...</div>
              ) : recentOrders.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground">No recent orders</div>
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Order #{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.customerName}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(typeof order.total === 'string' ? parseFloat(order.total) : order.total)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Pending Orders</span>
                <span className="text-sm font-medium">{quickStats.pending_orders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Low Stock Products</span>
                <span className="text-sm font-medium text-yellow-600">{quickStats.low_stock_products}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Out of Stock</span>
                <span className="text-sm font-medium text-red-600">{quickStats.out_of_stock}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">New Users (Today)</span>
                <span className="text-sm font-medium text-green-600">+{quickStats.new_users_today}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
