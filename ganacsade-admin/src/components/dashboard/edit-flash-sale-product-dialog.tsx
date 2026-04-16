"use client"

import { useState, useEffect } from "react"
import { FlashSaleProduct } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface EditFlashSaleProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: FlashSaleProduct | null
  onUpdateProduct: (product: FlashSaleProduct) => void
}

export function EditFlashSaleProductDialog({
  open,
  onOpenChange,
  product,
  onUpdateProduct,
}: EditFlashSaleProductDialogProps) {
  const [formData, setFormData] = useState({
    salePrice: 0,
    stockLimit: 0,
    soldCount: 0,
  })

  useEffect(() => {
    if (product) {
      setFormData({
        salePrice: product.salePrice,
        stockLimit: product.stockLimit,
        soldCount: product.soldCount || 0,
      })
    }
  }, [product])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!product) return

    if (formData.salePrice <= 0) {
      toast.error("Sale price must be greater than 0")
      return
    }

    if (formData.stockLimit <= 0) {
      toast.error("Stock limit must be greater than 0")
      return
    }

    if (formData.salePrice >= product.originalPrice) {
      toast.error("Sale price must be less than original price")
      return
    }

    const discountPercentage = Math.round(
      ((product.originalPrice - formData.salePrice) / product.originalPrice) * 100
    )

    const updatedProduct: FlashSaleProduct = {
      ...product,
      salePrice: formData.salePrice,
      stockLimit: formData.stockLimit,
      soldCount: formData.soldCount,
      discountPercentage,
    }

    onUpdateProduct(updatedProduct)
    onOpenChange(false)
  }

  if (!product) return null

  const discountPercentage = Math.round(
    ((product.originalPrice - formData.salePrice) / product.originalPrice) * 100
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Flash Sale Product</DialogTitle>
          <DialogDescription>
            Update sale price and stock limit for {product.productName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* Product Info */}
            <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
              {product.productImage && (
                <img
                  src={product.productImage}
                  alt={product.productName}
                  className="h-16 w-16 rounded object-cover"
                />
              )}
              <div>
                <p className="font-semibold">{product.productName}</p>
                <p className="text-sm text-muted-foreground">
                  Original Price: ${product.originalPrice.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Sale Price */}
            <div className="space-y-2">
              <Label htmlFor="salePrice">
                Sale Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0.01"
                max={product.originalPrice}
                value={formData.salePrice || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    salePrice: parseFloat(e.target.value) || 0,
                  })
                }
                placeholder="Enter sale price"
                required
              />
              {formData.salePrice > 0 && formData.salePrice < product.originalPrice && (
                <p className="text-sm text-green-600">
                  {discountPercentage}% OFF • Save ${(product.originalPrice - formData.salePrice).toFixed(2)}
                </p>
              )}
              {formData.salePrice >= product.originalPrice && (
                <p className="text-sm text-destructive">
                  Sale price must be less than original price
                </p>
              )}
            </div>

            {/* Stock Limit */}
            <div className="space-y-2">
              <Label htmlFor="stockLimit">
                Stock Limit <span className="text-destructive">*</span>
              </Label>
              <Input
                id="stockLimit"
                type="number"
                min="1"
                value={formData.stockLimit || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    stockLimit: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Enter stock limit"
                required
              />
              <p className="text-xs text-muted-foreground">
                Maximum quantity available for this flash sale
              </p>
            </div>

            {/* Sold Count */}
            <div className="space-y-2">
              <Label htmlFor="soldCount">Sold Count</Label>
              <Input
                id="soldCount"
                type="number"
                min="0"
                max={formData.stockLimit}
                value={formData.soldCount || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    soldCount: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="Number of items sold"
              />
              <p className="text-xs text-muted-foreground">
                Current number of items sold in this flash sale
              </p>
            </div>

            {/* Stock Status */}
            {formData.stockLimit > 0 && (
              <div className="p-3 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Available:</span>
                  <span className="font-semibold">
                    {formData.stockLimit - formData.soldCount} / {formData.stockLimit}
                  </span>
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(formData.soldCount / formData.stockLimit) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Update Product</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
