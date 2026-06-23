"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ordersApi } from "@/lib/api/orders"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Search, MoreVertical, Eye, FileText, Download, X, Clock, Package, CheckCircle } from "lucide-react"
import { formatCurrency, formatDate, printInvoice, exportOrdersToCSV, exportOrdersDetailed } from "@/lib/utils"
import { OrderDetailsDialog } from "@/components/dashboard/order-details-dialog"
import { OrderStatusAdvanceDialog, type OrderDeliveredAssignPayload } from "@/components/dashboard/order-status-advance-dialog"
import { Order } from "@/types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

const ORDER_STATUS_FLOW = ["pending", "processing", "delivered"] as const

const getStatusStep = (status: string) => {
  const normalized = String(status || "pending").toLowerCase()
  return ORDER_STATUS_FLOW.indexOf(normalized as (typeof ORDER_STATUS_FLOW)[number])
}

const getNextStatus = (status: string) => {
  const step = getStatusStep(status)
  if (step < 0 || step >= ORDER_STATUS_FLOW.length - 1) return null
  return ORDER_STATUS_FLOW[step + 1]
}

export default function OrdersPage() {
  const pathname = usePathname()
  const deliveryHistoryView = pathname === "/orders/history"
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [assignmentFilter, setAssignmentFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [deliveryUsers, setDeliveryUsers] = useState<any[]>([])
  const [assignedOnlyView, setAssignedOnlyView] = useState(false)
  const [canAssignOrders, setCanAssignOrders] = useState(false)
  const [canUpdateOrders, setCanUpdateOrders] = useState(false)
  const [canDeleteOrders, setCanDeleteOrders] = useState(false)
  const [canWriteOrders, setCanWriteOrders] = useState(false)
  const [highlightedOrderId, setHighlightedOrderId] = useState<string | null>(null)
  const [advanceDialogOpen, setAdvanceDialogOpen] = useState(false)
  const [advanceOrder, setAdvanceOrder] = useState<any | null>(null)
  const [advanceSaving, setAdvanceSaving] = useState(false)
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const scrollToOrderRow = useCallback((orderId: string) => {
    requestAnimationFrame(() => {
      const row = document.getElementById(`order-row-${orderId}`)
      row?.scrollIntoView({ block: "nearest", behavior: "smooth" })
      setHighlightedOrderId(orderId)
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current)
      }
      highlightTimeoutRef.current = setTimeout(() => setHighlightedOrderId(null), 2500)
    })
  }, [])

  const fetchOrders = useCallback(async (options?: { silent?: boolean; highlightOrderId?: string }) => {
    const silent = options?.silent ?? false
    try {
      if (!silent) {
        setLoading(true)
      }
      const response = await (assignedOnlyView || deliveryHistoryView
        ? ordersApi.getMyAssignedOrders({
            status: deliveryHistoryView
              ? 'delivered'
              : statusFilter !== 'all'
                ? statusFilter
                : undefined,
            excludeStatus:
              !deliveryHistoryView && assignedOnlyView && statusFilter === 'all'
                ? 'delivered'
                : undefined,
            search: searchQuery || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            assignmentFilter,
          })
        : ordersApi.getOrders({
            status: statusFilter !== 'all' ? statusFilter : undefined,
            search: searchQuery || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
            assignmentFilter,
          }))
      if (response.success && response.data) {
        setOrders(response.data)
        setAssignedOnlyView(Boolean(response?.meta?.assignedOnly))
        setCanAssignOrders(Boolean(response?.meta?.canAssign))
        setCanUpdateOrders(Boolean(response?.meta?.canEdit))
        setCanDeleteOrders(Boolean(response?.meta?.canDelete))
        setCanWriteOrders(Boolean(response?.meta?.canAdd))
        if (options?.highlightOrderId) {
          scrollToOrderRow(options.highlightOrderId)
        }
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (!silent) {
        toast.error('Failed to load orders')
      }
    } finally {
      if (!silent) {
        setLoading(false)
      }
    }
  }, [
    assignedOnlyView,
    deliveryHistoryView,
    statusFilter,
    assignmentFilter,
    searchQuery,
    dateFrom,
    dateTo,
    scrollToOrderRow,
  ])

  const fetchDeliveryUsers = async () => {
    try {
      const response = await ordersApi.getDeliveryUsers()
      if (response.success && response.data) {
        setDeliveryUsers(response.data)
      }
    } catch (error) {
      console.error("Error fetching delivery users:", error)
    }
  }

  const getDeliveryUserLabel = (deliveryUser: any) =>
    deliveryUser.deliveryPersonName
    || deliveryUser.display_name
    || `${deliveryUser.first_name || ""} ${deliveryUser.last_name || ""}`.trim()
    || deliveryUser.email

  const handleAssignDelivery = async (order: any, deliveryPersonId: string) => {
    if (!deliveryPersonId) return

    const previous = {
      delivery_person_id: order.delivery_person_id,
      delivery_person_name: order.delivery_person_name,
      status: order.status,
    }
    const selectedDelivery = deliveryUsers.find(
      (deliveryUser) => (deliveryUser.deliveryPersonId || deliveryUser.id) === deliveryPersonId
    )
    const nextStatus =
      order.status === "delivered" || order.status === "pending" ? "processing" : order.status

    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id
          ? {
              ...item,
              delivery_person_id: deliveryPersonId,
              delivery_person_name: selectedDelivery
                ? getDeliveryUserLabel(selectedDelivery)
                : item.delivery_person_name,
              status: nextStatus,
            }
          : item
      )
    )

    try {
      const response = await ordersApi.assignDelivery(order.id, deliveryPersonId)
      if (response.success) {
        toast.success(`Order ${order.order_number} assigned to delivery`)
        await fetchOrders({ silent: true, highlightOrderId: order.id })
      } else {
        setOrders((prev) =>
          prev.map((item) => (item.id === order.id ? { ...item, ...previous } : item))
        )
      }
    } catch (error) {
      setOrders((prev) =>
        prev.map((item) => (item.id === order.id ? { ...item, ...previous } : item))
      )
      console.error("Error assigning delivery:", error)
      toast.error("Failed to assign delivery")
    }
  }

  const handleMarkDeliveredByDelivery = async (order: any) => {
    const previousStatus = order.status
    setOrders((prev) =>
      prev.map((item) =>
        item.id === order.id ? { ...item, status: "delivered" } : item
      )
    )

    try {
      const response = await ordersApi.markDeliveredByDelivery(
        order.id,
        "Delivered by assigned delivery person"
      )
      if (response.success) {
        toast.success(`Order ${order.order_number} marked delivered`)
        await fetchOrders({ silent: true, highlightOrderId: order.id })
      } else {
        setOrders((prev) =>
          prev.map((item) =>
            item.id === order.id ? { ...item, status: previousStatus } : item
          )
        )
      }
    } catch (error) {
      setOrders((prev) =>
        prev.map((item) =>
          item.id === order.id ? { ...item, status: previousStatus } : item
        )
      )
      console.error("Error marking delivered:", error)
      toast.error("Failed to mark order as delivered")
    }
  }

  useEffect(() => {
    if (canAssignOrders) {
      fetchDeliveryUsers()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canAssignOrders])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // API already handles filtering, so just use orders directly
  const filteredOrders = orders

  const handleViewDetails = async (order: any) => {
    try {
      // Fetch full order details from API
      const response = await ordersApi.getOrder(order.id)
      if (response.success && response.data) {
        const apiOrder: any = response.data
        
        // Transform API data to match Order type expected by dialog
        const transformedOrder: Order = {
          id: apiOrder.id,
          userId: apiOrder.user_id,
          orderNumber: apiOrder.order_number,
          items: (apiOrder.items || []).map((item: any) => ({
            id: item.id,
            productId: item.product_id,
            product: {
              id: item.product_id,
              name: item.product_name || 'Product',
              nameAr: item.product_name || 'Product',
              nameSo: item.product_name || 'Product',
              description: '',
              descriptionAr: '',
              descriptionSo: '',
              price: parseFloat(item.unit_price),
              categoryId: '',
              images: [],
              rating: 0,
              reviewCount: 0,
              inStock: true,
              stockQuantity: 0,
              brand: '',
              sku: '',
              tags: [],
              variants: [],
              status: 'active' as const,
              isFeatured: false,
              isHalal: false,
            },
            quantity: item.quantity,
            unitPrice: parseFloat(item.unit_price),
            discountAmount: parseFloat(item.discount_amount || 0),
          })),
          shippingAddress: typeof apiOrder.shipping_address === 'string' 
            ? JSON.parse(apiOrder.shipping_address)
            : {
                id: '1',
                label: 'Home',
                fullName: apiOrder.customer_name,
                phoneNumber: apiOrder.customer_phone || '',
                addressLine1: 'Address',
                city: 'City',
                state: 'State',
                country: 'Somalia',
                postalCode: '00000',
                isDefault: true,
                type: 'home' as const,
              },
          paymentMethod: typeof apiOrder.payment_method === 'string'
            ? JSON.parse(apiOrder.payment_method)
            : {
                id: '1',
                type: 'cash_on_delivery' as const,
                displayName: 'Cash on Delivery',
                isDefault: true,
                isActive: true,
              },
          subtotal: parseFloat(apiOrder.subtotal),
          tax: parseFloat(apiOrder.tax || 0),
          shipping: parseFloat(apiOrder.shipping || 0),
          discount: parseFloat(apiOrder.discount || 0),
          total: parseFloat(apiOrder.total),
          status: apiOrder.status as any,
          paymentStatus: apiOrder.payment_status as any,
          statusHistory: (apiOrder.statusHistory || []).map((history: any) => ({
            status: history.status as any,
            timestamp: new Date(history.created_at),
            notes: history.notes || '',
            updatedBy: history.updated_by_name || 'System',
          })),
          notes: apiOrder.notes || '',
          trackingNumber: apiOrder.tracking_number || '',
          createdAt: new Date(apiOrder.created_at),
        }
        
        setSelectedOrder(transformedOrder)
        setIsDetailsOpen(true)
      }
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast.error('Failed to load order details')
    }
  }

  const handlePrintInvoice = (order: any) => {
    // Transform API order data for printing
    const transformedOrder: Order = {
      id: order.id,
      userId: order.user_id || order.userId,
      orderNumber: order.order_number || order.orderNumber,
      items: [],
      shippingAddress: typeof order.shipping_address === 'string' 
        ? JSON.parse(order.shipping_address)
        : order.shippingAddress || {
            id: '1',
            label: 'Home',
            fullName: order.customer_name || 'Customer',
            phoneNumber: order.customer_phone || '',
            addressLine1: 'Address',
            city: 'City',
            state: 'State',
            country: 'Somalia',
            postalCode: '00000',
            isDefault: true,
            type: 'home' as const,
          },
      paymentMethod: typeof order.payment_method === 'string'
        ? JSON.parse(order.payment_method)
        : order.paymentMethod || {
            id: '1',
            type: 'cash_on_delivery' as const,
            displayName: 'Cash on Delivery',
            isDefault: true,
            isActive: true,
          },
      subtotal: parseFloat(order.subtotal || 0),
      tax: parseFloat(order.tax || 0),
      shipping: parseFloat(order.shipping || 0),
      discount: parseFloat(order.discount || 0),
      total: parseFloat(order.total || 0),
      status: order.status as any,
      paymentStatus: order.payment_status || order.paymentStatus as any,
      statusHistory: [],
      notes: order.notes || '',
      trackingNumber: order.tracking_number || order.trackingNumber || '',
      createdAt: new Date(order.created_at || order.createdAt),
    }
    
    printInvoice(transformedOrder)
  }

  const handleExportCSV = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export")
      return
    }
    exportOrdersToCSV(filteredOrders)
    toast.success(`Exported ${filteredOrders.length} orders to CSV`)
  }

  const handleExportDetailed = () => {
    if (filteredOrders.length === 0) {
      toast.error("No orders to export")
      return
    }
    exportOrdersDetailed(filteredOrders)
    toast.success(`Exported ${filteredOrders.length} orders (detailed) to CSV`)
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setAssignmentFilter("all")
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
    toast.info("Filters cleared")
  }

  const handleStatusStepClick = (order: any, targetStatus: "pending" | "processing" | "delivered") => {
    if (order.payment_status === "failed") return

    const currentStep = getStatusStep(order.status)
    const targetStep = getStatusStep(targetStatus)

    if (targetStep < 0) return

    if (targetStep < currentStep) {
      toast.info("Step-kan horey ayaad u martay. U gudub step-ka xiga.")
      return
    }

    if (targetStep === currentStep) {
      toast.info("Dalabkani wuxuu hadda ku jiraa step-kan.")
      return
    }

    if (targetStep > currentStep + 1) {
      toast.info("Ma boodi kartid step-kan. Dhammeystir step-ka hore marka hore.")
      return
    }

    if (targetStatus === "delivered") {
      setAdvanceOrder(order)
      setAdvanceDialogOpen(true)
      return
    }

    if (targetStatus === "processing") {
      void handleQuickAdvance(order, "processing")
    }
  }

  const handleQuickAdvance = async (order: any, status: "processing") => {
    setAdvanceSaving(true)
    try {
      const response = await ordersApi.advanceOrderStatus(order.id, { status })
      if (response.success) {
        toast.success(`Order ${order.order_number} status updated to Processing`)
        await fetchOrders({ silent: true, highlightOrderId: order.id })
      }
    } catch (error: any) {
      const message = error?.response?.data?.message || "Failed to update order status"
      toast.error(message)
    } finally {
      setAdvanceSaving(false)
    }
  }

  const handleDeliveredSubmit = async (payload: OrderDeliveredAssignPayload) => {
    if (!advanceOrder) return

    setAdvanceSaving(true)
    try {
      const response = await ordersApi.advanceOrderStatus(advanceOrder.id, {
        status: "delivered",
        ...payload,
      })

      if (response.success) {
        toast.success(`Order ${advanceOrder.order_number} marked as Delivered`)
        setAdvanceDialogOpen(false)
        setAdvanceOrder(null)
        await fetchOrders({ silent: true, highlightOrderId: advanceOrder.id })
      }
    } catch (error: any) {
      console.error("Error marking order delivered:", error)
      const message = error?.response?.data?.message || "Failed to update order status"
      toast.error(message)
    } finally {
      setAdvanceSaving(false)
    }
  }

  const hasActiveFilters =
    statusFilter !== "all" || assignmentFilter !== "all" || dateFrom || dateTo || searchQuery

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      confirmed: { variant: "info", label: "Confirmed" },
      processing: { variant: "warning", label: "Processing" },
      out_for_delivery: { variant: "info", label: "Out for Delivery" },
      delivered: { variant: "success", label: "Delivered" },
      cancelled: { variant: "destructive", label: "Cancelled" },
      returned: { variant: "secondary", label: "Returned" },
      refunded: { variant: "destructive", label: "Refunded" },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const showStatusActions = canUpdateOrders && !deliveryHistoryView
  const showAssignColumn = !assignedOnlyView && canAssignOrders
  const tableColumnCount = 7 + (showStatusActions ? 1 : 0) + (showAssignColumn ? 1 : 0)

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "warning", label: "Pending" },
      processing: { variant: "info", label: "Processing" },
      completed: { variant: "success", label: "Completed" },
      failed: { variant: "destructive", label: "Failed" },
      cancelled: { variant: "secondary", label: "Cancelled" },
      refunded: { variant: "destructive", label: "Refunded" },
    }
    const config = variants[status] || variants.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {deliveryHistoryView
              ? "Delivery History"
              : assignedOnlyView
                ? "My Assigned Orders"
                : "Orders"}
          </h1>
          <p className="text-muted-foreground">
            {deliveryHistoryView
              ? `Completed deliveries (${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"})`
              : assignedOnlyView
                ? `Track orders assigned to you (${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"})`
                : `Manage and track customer orders (${filteredOrders.length} ${filteredOrders.length === 1 ? "order" : "orders"})`}
          </p>
          {(assignedOnlyView || deliveryHistoryView) ? (
            <div className="mt-3 flex gap-2">
              <Button asChild variant={deliveryHistoryView ? "outline" : "default"} size="sm">
                <Link href="/orders">Active Orders</Link>
              </Button>
              <Button asChild variant={deliveryHistoryView ? "default" : "outline"} size="sm">
                <Link href="/orders/history">History</Link>
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex gap-2">
          {!assignedOnlyView && canWriteOrders ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Export Orders
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportCSV}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV (Summary)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportDetailed}>
                  <FileText className="mr-2 h-4 w-4" />
                  Export as CSV (Detailed)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search orders by number or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          <div className="grid gap-4 pt-4 border-t md:grid-cols-4">
            <div className="space-y-2">
              <Label>Order Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="ready_for_pickup">Ready for Pickup</SelectItem>
                  <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {!assignedOnlyView ? (
              <div className="space-y-2">
                <Label>Assignment</Label>
                <Select value={assignmentFilter} onValueChange={setAssignmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All assignments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="not_assigned">Not Assigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2">
              <Label>From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order Number</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Payment Status</TableHead>
              <TableHead>{deliveryHistoryView ? "Delivered Date" : "Date"}</TableHead>
              {showStatusActions ? (
                <TableHead>{assignedOnlyView ? "Delivery Action" : "Status Actions"}</TableHead>
              ) : null}
              {showAssignColumn ? <TableHead>Assign Delivery</TableHead> : null}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tableColumnCount} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
              (() => {
                const isStatusActionDisabled = order.payment_status === "failed"
                return (
              <TableRow
                key={order.id}
                id={`order-row-${order.id}`}
                className={
                  highlightedOrderId === order.id
                    ? "bg-primary/10 ring-2 ring-inset ring-primary/30 transition-colors"
                    : undefined
                }
              >
                <TableCell className="font-medium">
                  {order.order_number}
                </TableCell>
                <TableCell>{order.customer_name}</TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(parseFloat(order.total))}
                </TableCell>
                <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                <TableCell>{getPaymentStatusBadge(order.payment_status)}</TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(deliveryHistoryView ? (order.delivery_delivered_at || order.created_at) : order.created_at)}
                </TableCell>
                {showStatusActions ? (
                <TableCell>
                  {assignedOnlyView ? (
                    <Button
                      variant={order.status === "delivered" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleMarkDeliveredByDelivery(order)}
                      className="h-8 px-2"
                      disabled={order.status === "delivered"}
                    >
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Delivered
                    </Button>
                  ) : (
                    <div className="flex gap-1">
                      {ORDER_STATUS_FLOW.map((stepStatus) => {
                        const stepIndex = getStatusStep(stepStatus)
                        const currentIndex = getStatusStep(order.status)
                        const isCurrent = currentIndex === stepIndex
                        const isPast = stepIndex < currentIndex
                        const Icon = stepStatus === "pending"
                          ? Clock
                          : stepStatus === "processing"
                            ? Package
                            : CheckCircle

                        return (
                          <Button
                            key={stepStatus}
                            variant={isCurrent ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusStepClick(order, stepStatus)}
                            className={`h-8 px-2 ${isPast ? "opacity-50" : ""}`}
                            title={
                              isStatusActionDisabled
                                ? "Cannot update status when payment failed"
                                : isPast
                                  ? "Statuskan waa la dhaafay"
                                  : `Advance to ${stepStatus}`
                            }
                            disabled={isStatusActionDisabled}
                          >
                            <Icon className="h-3 w-3" />
                          </Button>
                        )
                      })}
                    </div>
                  )}
                </TableCell>
                ) : null}
                {showAssignColumn ? (
                  <TableCell>
                    <Select
                      value={order.delivery_person_id || ""}
                      onValueChange={(value) => handleAssignDelivery(order, value)}
                      disabled={order.payment_status === "failed"}
                    >
                      <SelectTrigger
                        className="h-8"
                        title={
                          order.payment_status === "failed"
                            ? "Cannot assign delivery when payment failed"
                            : undefined
                        }
                      >
                        <SelectValue placeholder="Assign delivery" />
                      </SelectTrigger>
                      <SelectContent>
                        {deliveryUsers.map((deliveryUser) => (
                          <SelectItem
                            key={deliveryUser.deliveryPersonId || deliveryUser.id}
                            value={deliveryUser.deliveryPersonId || ""}
                          >
                            {getDeliveryUserLabel(deliveryUser)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                ) : null}
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handlePrintInvoice(order)}>
                        <FileText className="mr-2 h-4 w-4" />
                        Print Invoice
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
                )
              })()
            ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Order Details Dialog */}
      <OrderDetailsDialog
        order={selectedOrder}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        onPrintInvoice={handlePrintInvoice}
      />

      <OrderStatusAdvanceDialog
        open={advanceDialogOpen}
        order={advanceOrder}
        deliveryUsers={deliveryUsers}
        saving={advanceSaving}
        onOpenChange={(open) => {
          setAdvanceDialogOpen(open)
          if (!open) {
            setAdvanceOrder(null)
          }
        }}
        onSubmit={handleDeliveredSubmit}
      />
    </div>
  )
}
