"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { authApi } from "@/lib/api/auth"
import { customerOrdersApi } from "@/lib/api/customer-orders"
import {
  getProductName,
  getProductPrice,
  getProductUrl,
  parseProductImages,
  type StoreProduct,
} from "@/lib/api/storefront"
import { formatCurrency } from "@/lib/utils"
import { toast } from "sonner"

export function ProductPurchaseDialog({
  product,
  open,
  onOpenChange,
  initialQuantity = 1,
}: {
  product: StoreProduct
  open: boolean
  onOpenChange: (open: boolean) => void
  initialQuantity?: number
}) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(initialQuantity)
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [fullName, setFullName] = useState("")
  const [notes, setNotes] = useState("")

  const { price } = getProductPrice(product)
  const name = getProductName(product)
  const images = parseProductImages(product.images)
  const subtotal = price * quantity
  const maxQty = product.stock_quantity ?? 99

  useEffect(() => {
    if (open) setQuantity(initialQuantity)
  }, [open, initialQuantity])

  const handlePurchase = async () => {
    if (!authApi.isAuthenticated()) {
      toast.error("Please sign in to place an order")
      onOpenChange(false)
      router.push(
        `/login?redirect=${encodeURIComponent(`${getProductUrl(product)}?buy=1`)}`
      )
      return
    }

    if (!phone.trim()) {
      toast.error("Phone number is required")
      return
    }
    if (!address.trim()) {
      toast.error("Delivery address is required")
      return
    }

    try {
      setLoading(true)
      const response = await customerOrdersApi.createOrder({
        items: [
          {
            productId: product.id,
            productName: name,
            productImage: images[0] || null,
            unitPrice: price,
            quantity,
            total: subtotal,
            discountAmount: 0,
          },
        ],
        shippingAddress: {
          fullName: fullName.trim() || undefined,
          phone: phone.trim(),
          address: address.trim(),
        },
        paymentMethod: { method: "cash_on_delivery", label: "Cash on Delivery" },
        subtotal,
        tax: 0,
        shipping: 0,
        discount: 0,
        total: subtotal,
        notes: notes.trim() || undefined,
      })

      if (response.success) {
        toast.success(`Order placed! #${response.data?.orderNumber || ""}`)
        onOpenChange(false)
        router.push("/my-orders")
      }
    } catch {
      // axios interceptor shows error toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Place Order</DialogTitle>
          <DialogDescription>
            {name} — {formatCurrency(price)} × {quantity} = {formatCurrency(subtotal)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Quantity</Label>
            <div className="mt-2 flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                disabled={quantity >= maxQty}
                onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+252..."
              className="mt-1.5"
              required
            />
          </div>

          <div>
            <Label htmlFor="address">Delivery Address *</Label>
            <Textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, district, city..."
              className="mt-1.5"
              rows={2}
              required
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special instructions..."
              className="mt-1.5"
              rows={2}
            />
          </div>

          <div className="rounded-lg bg-muted/50 p-3 text-sm">
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">{formatCurrency(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Payment: Cash on Delivery</p>
          </div>

          <Button className="w-full" size="lg" disabled={loading} onClick={handlePurchase}>
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ShoppingCart className="mr-2 h-4 w-4" />
            )}
            Confirm Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
