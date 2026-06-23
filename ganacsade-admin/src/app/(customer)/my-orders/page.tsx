"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  customerOrdersApi,
  type CustomerOrder,
  type CustomerOrderDetail,
} from "@/lib/api/customer-orders"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Eye, Loader2, Package } from "lucide-react"
import { toast } from "sonner"

export default function MyOrdersPage() {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [statusFilter, setStatusFilter] = useState("all")
  const [viewOrder, setViewOrder] = useState<CustomerOrderDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const loadOrders = async (status = statusFilter) => {
    try {
      setLoading(true)
      const response = await customerOrdersApi.getMyOrders({
        status: status === "all" ? undefined : status,
      })
      if (response.success) {
        setOrders(response.data?.orders || [])
      }
    } catch {
      toast.error("Failed to load your orders")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openOrderDetails = async (orderId: string) => {
    try {
      setLoadingDetail(true)
      const response = await customerOrdersApi.getMyOrder(orderId)
      if (response.success && response.data) {
        setViewOrder(response.data as CustomerOrderDetail)
      }
    } catch {
      toast.error("Failed to load order details")
    } finally {
      setLoadingDetail(false)
    }
  }

  const getStatusVariant = (status: string) => {
    if (status === "delivered" || status === "completed") return "default"
    if (status === "cancelled") return "destructive"
    return "secondary"
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="mt-1 text-muted-foreground">
          View everything you have purchased on GANACSADE
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadOrders(statusFilter)}>Filter</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Package className="h-10 w-10" />
                    <p>No orders yet</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>{formatDate(order.created_at)}</TableCell>
                  <TableCell>{order.item_count ?? 0}</TableCell>
                  <TableCell>{formatCurrency(Number(order.total))}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
                      {order.payment_status ? (
                        <Badge variant="outline">{order.payment_status}</Badge>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openOrderDetails(order.id)}
                    >
                      <Eye className="mr-1 h-4 w-4" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!viewOrder || loadingDetail} onOpenChange={(open) => !open && setViewOrder(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
          </DialogHeader>
          {loadingDetail ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : viewOrder ? (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Order Number</p>
                  <p className="font-medium">{viewOrder.order_number}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Placed On</p>
                  <p className="font-medium">{formatDate(viewOrder.created_at)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge variant={getStatusVariant(viewOrder.status)}>{viewOrder.status}</Badge>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="font-medium">{formatCurrency(Number(viewOrder.total))}</p>
                </div>
              </div>

              <div>
                <p className="mb-2 font-semibold">Items</p>
                <div className="space-y-2">
                  {(viewOrder.items || []).map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-md border p-3">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">{formatCurrency(Number(item.total))}</p>
                    </div>
                  ))}
                </div>
              </div>

              {viewOrder.tracking_number ? (
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Tracking Number</p>
                  <p className="font-medium">{viewOrder.tracking_number}</p>
                </div>
              ) : null}
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
