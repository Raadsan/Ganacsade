"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Package,
  CheckCircle,
  Clock,
  Truck,
  Star,
  History,
  ArrowRight,
  Loader2,
} from "lucide-react"
import { ordersApi } from "@/lib/api/orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { toast } from "sonner"

type DeliveryStats = {
  activeCount: number
  deliveredCount: number
  totalAssigned: number
  todayDelivered: number
  processingCount: number
  pendingCount: number
  totalDeliveries: number
  rating: number
  isAvailable: boolean
}

type DeliveryOrder = {
  id: string
  order_number: string
  total: string | number
  status: string
  payment_status: string
  created_at: string
  delivery_delivered_at?: string | null
  customer_name?: string
}

export default function DeliveryDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DeliveryStats>({
    activeCount: 0,
    deliveredCount: 0,
    totalAssigned: 0,
    todayDelivered: 0,
    processingCount: 0,
    pendingCount: 0,
    totalDeliveries: 0,
    rating: 5,
    isAvailable: true,
  })
  const [recentActive, setRecentActive] = useState<DeliveryOrder[]>([])
  const [recentDelivered, setRecentDelivered] = useState<DeliveryOrder[]>([])

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true)
        const response = await ordersApi.getDeliveryDashboard()
        if (response.success && response.data) {
          setStats(response.data.stats)
          setRecentActive(response.data.recentActive || [])
          setRecentDelivered(response.data.recentDelivered || [])
        }
      } catch (error) {
        console.error("Failed to load delivery dashboard:", error)
        toast.error("Failed to load delivery dashboard")
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Dashboard</h1>
          <p className="text-muted-foreground">Overview of your assigned deliveries and performance</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/orders">Active Orders</Link>
          </Button>
          <Button asChild>
            <Link href="/orders/history">View History</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Active Orders"
          value={stats.activeCount}
          description="Orders waiting for delivery"
          icon={<Truck className="h-5 w-5 text-blue-600" />}
        />
        <StatCard
          title="Delivered"
          value={stats.deliveredCount}
          description="Completed deliveries"
          icon={<CheckCircle className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Delivered Today"
          value={stats.todayDelivered}
          description="Completed today"
          icon={<Package className="h-5 w-5 text-emerald-600" />}
        />
        <StatCard
          title="Total Deliveries"
          value={stats.totalDeliveries}
          description={`Rating ${stats.rating.toFixed(1)}`}
          icon={<Star className="h-5 w-5 text-amber-500" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Pending"
          value={stats.pendingCount}
          description="Awaiting action"
          icon={<Clock className="h-5 w-5 text-orange-500" />}
        />
        <StatCard
          title="Processing"
          value={stats.processingCount}
          description="In progress"
          icon={<Package className="h-5 w-5 text-indigo-500" />}
        />
        <StatCard
          title="Availability"
          value={stats.isAvailable ? "Available" : "Unavailable"}
          description="Your current delivery status"
          icon={<Truck className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Assigned Orders</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActive.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active orders right now.</p>
            ) : (
              recentActive.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Recent History
            </CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link href="/orders/history">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentDelivered.length === 0 ? (
              <p className="text-sm text-muted-foreground">No completed deliveries yet.</p>
            ) : (
              recentDelivered.map((order) => (
                <OrderRow key={order.id} order={order} showDeliveredDate />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  description,
  icon,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-6">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-lg bg-muted p-2">{icon}</div>
      </CardContent>
    </Card>
  )
}

function OrderRow({
  order,
  showDeliveredDate = false,
}: {
  order: DeliveryOrder
  showDeliveredDate?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <div>
        <p className="font-medium">{order.order_number}</p>
        <p className="text-sm text-muted-foreground">{order.customer_name || "Customer"}</p>
        <p className="text-xs text-muted-foreground">
          {showDeliveredDate
            ? formatDate(order.delivery_delivered_at || order.created_at)
            : formatDate(order.created_at)}
        </p>
      </div>
      <div className="text-right">
        <p className="font-medium">{formatCurrency(parseFloat(String(order.total)))}</p>
        <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
          {order.status}
        </Badge>
      </div>
    </div>
  )
}
