"use client"

import { useState, useEffect } from "react"
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
import { Search, MoreVertical, Eye, FileText, Download, Filter, X, Clock, Package, CheckCircle } from "lucide-react"
import { formatCurrency, formatDate, printInvoice, exportOrdersToCSV, exportOrdersDetailed } from "@/lib/utils"
import { OrderDetailsDialog } from "@/components/dashboard/order-details-dialog"
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

// Mock data - replace with real API calls
const mockOrders: Order[] = [
  {
    id: "1",
    userId: "user-123",
    orderNumber: "ORD-1001",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        product: {
          id: "prod-1",
          name: "Wireless Headphones Pro",
          nameAr: "سماعات لاسلكية برو",
          nameSo: "Dhagaha Wireless Pro",
          description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and superior sound quality. Perfect for music lovers and professionals.",
          descriptionAr: "سماعات لاسلكية فاخرة مع إلغاء الضوضاء النشط",
          descriptionSo: "Dhagaha wireless oo aad u fiican",
          price: 299.99,
          categoryId: "cat-electronics",
          images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"],
          rating: 4.5,
          reviewCount: 128,
          inStock: true,
          stockQuantity: 45,
          brand: "AudioTech",
          sku: "WH-PRO-001",
          tags: ["electronics", "audio", "wireless"],
          variants: [],
          status: "active" as const,
          isFeatured: true,
          isHalal: false,
          createdAt: new Date("2024-01-15"),
        },
        quantity: 1,
        unitPrice: 299.99,
        discountAmount: 0,
        addedAt: new Date("2024-10-22T10:00:00"),
      },
    ],
    shippingAddress: {
      id: "addr-1",
      label: "Home",
      fullName: "Ahmed Mohamed",
      phoneNumber: "+252 61 234 5678",
      addressLine1: "Maka Al-Mukarama Road",
      addressLine2: "Building 15, Apt 4",
      city: "Mogadishu",
      state: "Banaadir",
      country: "Somalia",
      postalCode: "00000",
      isDefault: true,
      type: "home" as const,
    },
    paymentMethod: {
      id: "pm-1",
      type: "waafi_pay" as const,
      displayName: "WaafiPay",
      isDefault: true,
      isActive: true,
    },
    subtotal: 299.99,
    tax: 0,
    shipping: 5.00,
    discount: 0,
    total: 304.99,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    statusHistory: [
      {
        status: "pending" as const,
        timestamp: new Date("2024-10-22T10:00:00"),
        notes: "Order placed",
        updatedBy: "System",
      },
    ],
    notes: "Please deliver between 2-5 PM",
    trackingNumber: "",
    createdAt: new Date("2024-10-22"),
  },
  {
    id: "2",
    userId: "user-456",
    orderNumber: "ORD-1002",
    items: [
      {
        id: "item-2",
        productId: "prod-2",
        product: {
          id: "prod-2",
          name: "Smart Watch Ultra",
          nameAr: "ساعة ذكية ألترا",
          nameSo: "Saacad Smart Ultra",
          description: "Advanced fitness tracking, heart rate monitoring, GPS, and 7-day battery life. Water-resistant up to 50m.",
          descriptionAr: "ساعة ذكية متقدمة مع تتبع اللياقة البدنية",
          descriptionSo: "Saacad smart ah oo aad u fiican",
          price: 499.99,
          categoryId: "cat-electronics",
          images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
          rating: 4.8,
          reviewCount: 256,
          inStock: true,
          stockQuantity: 28,
          brand: "TechWear",
          sku: "SW-ULTRA-002",
          tags: ["electronics", "smartwatch", "fitness"],
          variants: [],
          status: "active" as const,
          isFeatured: true,
          isHalal: false,
        },
        quantity: 1,
        unitPrice: 499.99,
        discountAmount: 50.00,
      },
      {
        id: "item-3",
        productId: "prod-3",
        product: {
          id: "prod-3",
          name: "Premium Leather Wallet",
          nameAr: "محفظة جلدية فاخرة",
          nameSo: "Boorso Maqaar ah oo Fiican",
          description: "Handcrafted genuine leather wallet with RFID protection. Multiple card slots and bill compartments.",
          descriptionAr: "محفظة جلدية طبيعية مصنوعة يدوياً",
          descriptionSo: "Boorso maqaar dhabta ah",
          price: 149.99,
          categoryId: "cat-mens",
          images: ["https://images.unsplash.com/photo-1627123424574-724758594e93?w=500"],
          rating: 4.3,
          reviewCount: 89,
          inStock: true,
          stockQuantity: 67,
          brand: "LeatherCraft",
          sku: "LW-PREM-003",
          tags: ["accessories", "mens", "wallet"],
          variants: [],
          status: "active" as const,
          isFeatured: false,
          isHalal: false,
        },
        quantity: 1,
        unitPrice: 149.99,
        discountAmount: 0,
      },
    ],
    shippingAddress: {
      id: "addr-2",
      label: "Work",
      fullName: "Fatima Hassan",
      phoneNumber: "+252 61 345 6789",
      addressLine1: "Kilometer 4 Street",
      city: "Mogadishu",
      state: "Banaadir",
      country: "Somalia",
      postalCode: "00000",
      isDefault: false,
      type: "work" as const,
    },
    paymentMethod: {
      id: "pm-2",
      type: "edahab" as const,
      displayName: "E-dahab",
      isDefault: true,
      isActive: true,
    },
    subtotal: 649.98,
    tax: 0,
    shipping: 7.00,
    discount: 50.00,
    total: 606.98,
    status: "processing" as const,
    paymentStatus: "completed" as const,
    statusHistory: [
      {
        status: "pending" as const,
        timestamp: new Date("2024-10-21T09:00:00"),
        notes: "Order placed",
        updatedBy: "System",
      },
      {
        status: "confirmed" as const,
        timestamp: new Date("2024-10-21T09:30:00"),
        notes: "Payment confirmed",
        updatedBy: "Admin",
      },
      {
        status: "processing" as const,
        timestamp: new Date("2024-10-21T10:00:00"),
        notes: "Order is being prepared",
        updatedBy: "Warehouse",
      },
    ],
    notes: "",
    trackingNumber: "TRK-2024-001002",
    estimatedDelivery: new Date("2024-10-24"),
    createdAt: new Date("2024-10-21"),
  },
  {
    id: "3",
    userId: "user-789",
    orderNumber: "ORD-1003",
    items: [
      {
        id: "item-4",
        productId: "prod-4",
        product: {
          id: "prod-4",
          name: "Classic T-Shirt",
          nameAr: "قميص كلاسيكي",
          nameSo: "Shaati Caadi ah",
          description: "100% cotton premium quality t-shirt. Comfortable fit, available in multiple colors.",
          descriptionAr: "قميص قطني عالي الجودة",
          descriptionSo: "Shaati cudbi ah oo tayada sare",
          price: 29.99,
          categoryId: "cat-mens",
          images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"],
          rating: 4.1,
          reviewCount: 145,
          inStock: true,
          stockQuantity: 234,
          brand: "FashionFit",
          sku: "TS-CLAS-004",
          tags: ["clothing", "mens", "t-shirt"],
          variants: [
            {
              id: "var-1",
              name: "Blue - Large",
              nameAr: "أزرق - كبير",
              nameSo: "Buluug - Weyn",
              price: 29.99,
              inStock: true,
              stockQuantity: 45,
              sku: "TS-CLAS-004-BL-L",
              attributes: { color: "Blue", size: "L" },
            },
          ],
          status: "active" as const,
          isFeatured: false,
          isHalal: false,
        },
        quantity: 3,
        unitPrice: 29.99,
        discountAmount: 0,
        variantId: "var-1",
        variant: {
          id: "var-1",
          name: "Blue - Large",
          nameAr: "أزرق - كبير",
          nameSo: "Buluug - Weyn",
          price: 29.99,
          inStock: true,
          stockQuantity: 45,
          sku: "TS-CLAS-004-BL-L",
          attributes: { color: "Blue", size: "L" },
        },
      },
    ],
    shippingAddress: {
      id: "addr-3",
      label: "Home",
      fullName: "Omar Ali",
      phoneNumber: "+252 61 456 7890",
      addressLine1: "Taleh Street",
      city: "Hargeisa",
      state: "Woqooyi Galbeed",
      country: "Somalia",
      postalCode: "00000",
      isDefault: true,
      type: "home" as const,
    },
    paymentMethod: {
      id: "pm-3",
      type: "cash_on_delivery" as const,
      displayName: "Cash on Delivery",
      isDefault: false,
      isActive: true,
    },
    subtotal: 89.97,
    tax: 0,
    shipping: 5.00,
    discount: 0,
    total: 94.97,
    status: "delivered" as const,
    paymentStatus: "completed" as const,
    statusHistory: [
      {
        status: "pending" as const,
        timestamp: new Date("2024-10-20T08:00:00"),
        notes: "Order placed",
        updatedBy: "System",
      },
      {
        status: "confirmed" as const,
        timestamp: new Date("2024-10-20T09:00:00"),
        notes: "Order confirmed",
        updatedBy: "Admin",
      },
      {
        status: "processing" as const,
        timestamp: new Date("2024-10-20T10:00:00"),
        notes: "Order is being prepared",
        updatedBy: "Warehouse",
      },
      {
        status: "out_for_delivery" as const,
        timestamp: new Date("2024-10-20T14:00:00"),
        notes: "Out for delivery",
        updatedBy: "Delivery",
      },
      {
        status: "delivered" as const,
        timestamp: new Date("2024-10-20T17:30:00"),
        notes: "Delivered successfully",
        updatedBy: "Delivery",
      },
    ],
    notes: "",
    trackingNumber: "TRK-2024-001003",
    estimatedDelivery: new Date("2024-10-20"),
    actualDelivery: new Date("2024-10-20T17:30:00"),
    createdAt: new Date("2024-10-20"),
  },
]

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState<string>("")
  const [dateTo, setDateTo] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch orders from API
  useEffect(() => {
    async function fetchOrders() {
      try {
        setLoading(true)
        const response = await ordersApi.getOrders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
        if (response.success && response.data) {
          setOrders(response.data)
        }
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast.error('Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [statusFilter, searchQuery, dateFrom, dateTo])

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
    setDateFrom("")
    setDateTo("")
    setSearchQuery("")
    toast.info("Filters cleared")
  }

  const handleStatusUpdate = async (order: any, newStatus: "pending" | "processing" | "delivered") => {
    try {
      const response = await ordersApi.updateOrderStatus({
        orderId: order.id,
        status: newStatus,
        notes: `Status updated to ${newStatus}`,
      })
      
      if (response.success) {
        const statusLabels = {
          pending: "Pending",
          processing: "Processing",
          delivered: "Completed"
        }
        toast.success(`Order ${order.order_number} status updated to ${statusLabels[newStatus]}`)
        
        // Refresh orders
        const ordersResponse = await ordersApi.getOrders({
          status: statusFilter !== 'all' ? statusFilter : undefined,
          search: searchQuery || undefined,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        })
        if (ordersResponse.success && ordersResponse.data) {
          setOrders(ordersResponse.data)
        }
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('Failed to update order status')
    }
  }

  const hasActiveFilters = statusFilter !== "all" || dateFrom || dateTo || searchQuery

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
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground">
            Manage and track customer orders ({filteredOrders.length} {filteredOrders.length === 1 ? 'order' : 'orders'})
          </p>
        </div>
        <div className="flex gap-2">
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
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={showFilters ? "bg-accent" : ""}
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="ghost" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid gap-4 pt-4 border-t md:grid-cols-3">
              {/* Status Filter */}
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

              {/* Date From */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>
          )}
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
              <TableHead>Date</TableHead>
              <TableHead>Status Actions</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
              <TableRow key={order.id}>
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
                  {formatDate(order.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant={order.status === "pending" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(order, "pending")}
                      className="h-8 px-2"
                      title="Mark as Pending"
                    >
                      <Clock className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={order.status === "processing" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(order, "processing")}
                      className="h-8 px-2"
                      title="Mark as Processing"
                    >
                      <Package className="h-3 w-3" />
                    </Button>
                    <Button
                      variant={order.status === "delivered" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleStatusUpdate(order, "delivered")}
                      className="h-8 px-2"
                      title="Mark as Completed"
                    >
                      <CheckCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
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
    </div>
  )
}
