"use client"

import { useState } from "react"
import { Product } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import { Search, Star, StarOff, Package } from "lucide-react"

interface AddFeaturedProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableProducts: Product[]
  onAddProduct: (product: Product) => void | Promise<void>
}

export function AddFeaturedProductDialog({
  open,
  onOpenChange,
  availableProducts,
  onAddProduct,
}: AddFeaturedProductDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const filtered = availableProducts.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const notFeatured = filtered.filter((p) => !p.isFeatured)
  const featured = filtered.filter((p) => p.isFeatured)

  const handleToggle = async (product: Product) => {
    setLoadingId(product.id)
    try {
      await onAddProduct(product)
    } finally {
      setLoadingId(null)
    }
  }

  const ProductRow = ({ product }: { product: Product }) => {
    const isLoading = loadingId === product.id
    return (
      <div
        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
          product.isFeatured
            ? "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800"
            : "hover:bg-muted/50"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Product image */}
          <div className="h-12 w-12 rounded-md border bg-muted overflow-hidden flex-shrink-0">
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.style.display = "none"
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="min-w-0">
            <p className="font-medium truncate text-sm">{product.name}</p>
            <p className="text-xs text-muted-foreground">
              {product.sku || "No SKU"} •{" "}
              <span className="font-medium">
                ${product.price.toFixed(2)}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {product.isFeatured ? (
            <>
              <Badge className="bg-green-600 text-white text-xs gap-1">
                <Star className="h-3 w-3" />
                Featured
              </Badge>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive border-destructive/30 hover:bg-destructive/10 h-8"
                onClick={() => handleToggle(product)}
                disabled={isLoading}
              >
                <StarOff className="h-3.5 w-3.5 mr-1" />
                {isLoading ? "Removing…" : "Remove"}
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              className="h-8 gap-1"
              onClick={() => handleToggle(product)}
              disabled={isLoading}
            >
              <Star className="h-3.5 w-3.5" />
              {isLoading ? "Adding…" : "Add to Featured"}
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add / Manage Featured Products</DialogTitle>
          <DialogDescription>
            Select products to feature on the store homepage. Featured products
            appear highlighted in the storefront.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative flex-shrink-0">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or SKU…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
            autoFocus
          />
        </div>

        {/* Product list */}
        <div className="flex-1 overflow-y-auto min-h-0 space-y-4 pr-1">
          {availableProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No products found</p>
              <p className="text-sm">Create products in the Products page first</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Search className="h-10 w-10 mb-3 opacity-30" />
              <p className="font-medium">No matching products</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <>
              {/* Not Featured section */}
              {notFeatured.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Not Featured ({notFeatured.length})
                    </p>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  {notFeatured.map((p) => (
                    <ProductRow key={p.id} product={p} />
                  ))}
                </div>
              )}

              {/* Already Featured section */}
              {featured.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-green-600 dark:text-green-400 uppercase tracking-wide">
                      Already Featured ({featured.length})
                    </p>
                    <div className="flex-1 h-px bg-green-200 dark:bg-green-800" />
                  </div>
                  {featured.map((p) => (
                    <ProductRow key={p.id} product={p} />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 pt-2 border-t">
          <div className="flex items-center justify-between w-full">
            <p className="text-xs text-muted-foreground">
              {featured.length} featured • {notFeatured.length} not featured
            </p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
