"use client"

import { useState } from "react"
import { Product, FlashSaleProduct } from "@/types"
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
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"
import { toast } from "sonner"

interface AddFlashSaleProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  availableProducts: Product[]
  onAddProduct: (product: FlashSaleProduct) => void
}

export function AddFlashSaleProductDialog({
  open,
  onOpenChange,
  availableProducts,
  onAddProduct,
}: AddFlashSaleProductDialogProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [salePrice, setSalePrice] = useState("")
  const [stockLimit, setStockLimit] = useState("")

  const filteredProducts = availableProducts.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product)
    // Suggest 20% off
    const suggestedPrice = product.price * 0.8
    setSalePrice(suggestedPrice.toFixed(2))
    setStockLimit(product.stockQuantity.toString())
  }

  const handleSubmit = () => {
    if (!selectedProduct) {
      toast.error("Please select a product")
      return
    }

    const salePriceNum = parseFloat(salePrice)
    const stockLimitNum = parseInt(stockLimit)

    if (isNaN(salePriceNum) || salePriceNum <= 0) {
      toast.error("Please enter a valid sale price")
      return
    }

    if (salePriceNum >= selectedProduct.price) {
      toast.error("Sale price must be less than original price")
      return
    }

    if (isNaN(stockLimitNum) || stockLimitNum <= 0) {
      toast.error("Please enter a valid stock limit")
      return
    }

    const discountPercentage = ((selectedProduct.price - salePriceNum) / selectedProduct.price) * 100

    const flashSaleProduct: FlashSaleProduct = {
      id: `fsp-${Date.now()}`,
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productImage: selectedProduct.images?.[0],
      originalPrice: selectedProduct.price,
      salePrice: salePriceNum,
      discountPercentage: Math.round(discountPercentage),
      stockLimit: stockLimitNum,
      soldCount: 0,
    }

    onAddProduct(flashSaleProduct)
    onOpenChange(false)
    setSelectedProduct(null)
    setSalePrice("")
    setStockLimit("")
    setSearchQuery("")
  }

  const handleCancel = () => {
    onOpenChange(false)
    setSelectedProduct(null)
    setSalePrice("")
    setStockLimit("")
    setSearchQuery("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Product to Flash Sale</DialogTitle>
          <DialogDescription>
            Select a product and set the flash sale price
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!selectedProduct ? (
            <>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or SKU..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Product List */}
              <div className="max-h-[400px] border rounded-lg overflow-y-auto">
                <div className="p-4 space-y-2">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted cursor-pointer transition-colors"
                        onClick={() => handleProductSelect(product)}
                      >
                        <div className="flex items-center gap-3">
                          {product.images && product.images[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-12 w-12 rounded object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.src = "https://via.placeholder.com/48?text=No+Image"
                              }}
                            />
                          ) : (
                            <div className="h-12 w-12 rounded bg-muted flex items-center justify-center">
                              <span className="text-xs text-muted-foreground">No image</span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.sku} • ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <Button size="sm">Select</Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No products found" : "No available products"}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Selected Product Info */}
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  {selectedProduct.images && selectedProduct.images[0] ? (
                    <img
                      src={selectedProduct.images[0]}
                      alt={selectedProduct.name}
                      className="h-16 w-16 rounded object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{selectedProduct.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Original Price: ${selectedProduct.price.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Available Stock: {selectedProduct.stockQuantity}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setSelectedProduct(null)}
                >
                  Change Product
                </Button>
              </div>

              {/* Flash Sale Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="salePrice">
                    Flash Sale Price (USD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={selectedProduct.price}
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    placeholder="Enter sale price"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be less than ${selectedProduct.price.toFixed(2)}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockLimit">
                    Stock Limit <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="stockLimit"
                    type="number"
                    min="1"
                    max={selectedProduct.stockQuantity}
                    value={stockLimit}
                    onChange={(e) => setStockLimit(e.target.value)}
                    placeholder="Available units"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max: {selectedProduct.stockQuantity} units
                  </p>
                </div>
              </div>

              {/* Discount Preview */}
              {salePrice && parseFloat(salePrice) > 0 && (
                <div className="p-3 border rounded-lg bg-green-50 dark:bg-green-950">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Discount:{" "}
                    {Math.round(((selectedProduct.price - parseFloat(salePrice)) / selectedProduct.price) * 100)}% OFF
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Customers save ${(selectedProduct.price - parseFloat(salePrice)).toFixed(2)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          {selectedProduct && (
            <Button onClick={handleSubmit}>
              Add to Flash Sale
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
