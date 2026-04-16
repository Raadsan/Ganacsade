"use client"

import { Order } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import {
  MapPin,
  CreditCard,
  Package,
  Truck,
  Calendar,
  User,
  Phone,
  Mail,
  FileText,
  Printer,
} from "lucide-react"
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils"

interface OrderDetailsDialogProps {
  order: Order | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onPrintInvoice: (order: Order) => void
}

export function OrderDetailsDialog({
  order,
  open,
  onOpenChange,
  onPrintInvoice,
}: OrderDetailsDialogProps) {
  if (!order) return null

  const getOrderStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: "secondary", label: "Pending" },
      confirmed: { variant: "info", label: "Confirmed" },
      processing: { variant: "warning", label: "Processing" },
      ready_for_pickup: { variant: "info", label: "Ready for Pickup" },
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-2xl">Order Details</DialogTitle>
              <DialogDescription>
                Order #{order.orderNumber} • {formatDate(order.createdAt)}
              </DialogDescription>
            </div>
            <Button
              variant="outline"
              onClick={() => onPrintInvoice(order)}
              className="gap-2"
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Status */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Order Status
                  </p>
                  {getOrderStatusBadge(order.status)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Payment Status
                  </p>
                  {getPaymentStatusBadge(order.paymentStatus)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Customer Information
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">
                    {order.shippingAddress.fullName}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{order.shippingAddress.phoneNumber}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Shipping Address
              </h3>
              <div className="space-y-1 text-sm">
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && (
                  <p>{order.shippingAddress.addressLine2}</p>
                )}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.postalCode}
                </p>
                <p className="font-medium">{order.shippingAddress.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h3>
              <p className="text-sm">{order.paymentMethod.displayName}</p>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Package className="h-4 w-4" />
                Order Items ({order.items.length})
              </h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-0"
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-lg border bg-muted flex items-center justify-center overflow-hidden">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = ""
                              e.currentTarget.style.display = "none"
                            }}
                          />
                        ) : (
                          <Package className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-1">{item.product.name}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {item.product.description}
                      </p>
                      {item.variant && (
                        <p className="text-sm text-muted-foreground">
                          Variant: {item.variant.name}
                          {item.variant.attributes &&
                            Object.entries(item.variant.attributes).length >
                              0 && (
                              <span className="ml-2">
                                (
                                {Object.entries(item.variant.attributes)
                                  .map(([key, value]) => `${key}: ${value}`)
                                  .join(", ")}
                                )
                              </span>
                            )}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-muted-foreground">
                          SKU: {item.product.sku}
                        </span>
                        {item.product.brand && (
                          <span className="text-muted-foreground">
                            Brand: {item.product.brand}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantity and Price */}
                    <div className="flex-shrink-0 text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.unitPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      {item.discountAmount > 0 && (
                        <p className="text-sm text-green-600">
                          -{formatCurrency(item.discountAmount)}
                        </p>
                      )}
                      <p className="font-bold mt-2">
                        {formatCurrency(item.unitPrice * item.quantity - item.discountAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-green-600">
                      -{formatCurrency(order.discount)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.trackingNumber && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Tracking Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">
                      Tracking Number:
                    </span>
                    <span className="font-mono font-medium">
                      {order.trackingNumber}
                    </span>
                  </div>
                  {order.estimatedDelivery && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Estimated Delivery:
                      </span>
                      <span>{formatDate(order.estimatedDelivery)}</span>
                    </div>
                  )}
                  {order.actualDelivery && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        Delivered On:
                      </span>
                      <span className="font-medium">
                        {formatDate(order.actualDelivery)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Notes */}
          {order.notes && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Order Notes
                </h3>
                <p className="text-sm text-muted-foreground">{order.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Status History */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Status History</h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, index) => (
                    <div
                      key={index}
                      className="flex gap-4 pb-3 border-b last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getOrderStatusBadge(history.status)}
                          <span className="text-sm text-muted-foreground">
                            by {history.updatedBy}
                          </span>
                        </div>
                        {history.notes && (
                          <p className="text-sm text-muted-foreground">
                            {history.notes}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground text-right">
                        <p>{formatDate(history.timestamp)}</p>
                        <p className="text-xs">
                          {formatRelativeTime(history.timestamp)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
