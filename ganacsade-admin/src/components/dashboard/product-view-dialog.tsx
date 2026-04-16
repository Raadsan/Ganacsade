"use client"

import { useState, useEffect } from "react"
import { Product } from "@/types"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Package, Tag, Calendar, Star, Image as ImageIcon } from "lucide-react"

interface ProductViewDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProductViewDialog({
  product,
  open,
  onOpenChange,
}: ProductViewDialogProps) {
  const [productImages, setProductImages] = useState<any[]>([])
  const [loadingImages, setLoadingImages] = useState(false)

  // Fetch product images when dialog opens
  useEffect(() => {
    async function fetchProductImages() {
      if (!product || !open) return
      
      try {
        setLoadingImages(true)
        const token = localStorage.getItem('token')
        const response = await fetch(`http://localhost:5000/api/admin/products/${product.id}/images`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        if (data.success) {
          setProductImages(data.data || [])
        }
      } catch (error) {
        console.error('Error fetching product images:', error)
      } finally {
        setLoadingImages(false)
      }
    }
    
    fetchProductImages()
  }, [product, open])

  if (!product) return null

  const getStatusBadge = (status: string) => {
    return status === "active" ? (
      <Badge variant="success">Active</Badge>
    ) : status === "inactive" ? (
      <Badge variant="secondary">Inactive</Badge>
    ) : status === "draft" ? (
      <Badge variant="outline">Draft</Badge>
    ) : (
      <Badge variant="secondary">Archived</Badge>
    )
  }

  const getStockBadge = (quantity: number, inStock: boolean) => {
    if (!inStock || quantity === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (quantity < 20) {
      return <Badge variant="warning">Low Stock</Badge>
    } else {
      return <Badge variant="success">In Stock</Badge>
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Product Details</DialogTitle>
          <DialogDescription>
            View complete product information
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Images */}
          {(loadingImages || productImages.length > 0) && (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Product Images {productImages.length > 0 && `(${productImages.length})`}
              </h3>
              {loadingImages ? (
                <div className="flex justify-center py-8">
                  <p className="text-sm text-muted-foreground">Loading images...</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  {productImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative aspect-square rounded-lg border overflow-hidden bg-muted group"
                    >
                      <img
                        src={`http://localhost:5000${image.image_url}`}
                        alt={image.alt_text || `${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.style.display = 'none'
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            const placeholder = document.createElement('div')
                            placeholder.className = 'flex items-center justify-center w-full h-full text-muted-foreground'
                            placeholder.innerHTML = '<svg class="h-16 w-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>'
                            parent.appendChild(placeholder)
                          }
                        }}
                      />
                      {image.is_primary && (
                        <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <Separator />

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Package className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Product Name (English)</p>
                <p className="font-medium">{(product as any).name_en || product.name}</p>
              </div>
              
              {((product as any).name_ar || product.nameAr) && (
                <div>
                  <p className="text-sm text-muted-foreground">Product Name (Arabic)</p>
                  <p className="font-medium">{(product as any).name_ar || product.nameAr}</p>
                </div>
              )}
              
              {((product as any).name_so || product.nameSo) && (
                <div>
                  <p className="text-sm text-muted-foreground">Product Name (Somali)</p>
                  <p className="font-medium">{(product as any).name_so || product.nameSo}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">SKU</p>
                <p className="font-medium font-mono">{product.sku}</p>
              </div>

              {product.brand && (
                <div>
                  <p className="text-sm text-muted-foreground">Brand</p>
                  <p className="font-medium">{product.brand}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="font-medium capitalize">
                  {(product as any).category_name || (product as any).category || product.categoryId || 'N/A'}
                </p>
              </div>

              {((product as any).subcategory_name || (product as any).subcategory || product.subcategoryId) && (
                <div>
                  <p className="text-sm text-muted-foreground">Subcategory</p>
                  <p className="font-medium capitalize">
                    {(product as any).subcategory_name || (product as any).subcategory || product.subcategoryId || 'N/A'}
                  </p>
                </div>
              )}
            </div>

            {((product as any).description_en || product.description) && (
              <div>
                <p className="text-sm text-muted-foreground">Description (English)</p>
                <p className="mt-1 text-sm">{(product as any).description_en || product.description}</p>
              </div>
            )}

            {((product as any).description_ar || product.descriptionAr) && (
              <div>
                <p className="text-sm text-muted-foreground">Description (Arabic)</p>
                <p className="mt-1 text-sm" dir="rtl">{(product as any).description_ar || product.descriptionAr}</p>
              </div>
            )}

            {((product as any).description_so || product.descriptionSo) && (
              <div>
                <p className="text-sm text-muted-foreground">Description (Somali)</p>
                <p className="mt-1 text-sm">{(product as any).description_so || product.descriptionSo}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing & Stock */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Price</p>
                <p className="text-xl font-bold text-primary">
                  {formatCurrency(product.price)}
                </p>
              </div>

              {((product as any).discount_price || product.discountPrice) && (
                <div>
                  <p className="text-sm text-muted-foreground">Discount Price</p>
                  <p className="text-xl font-bold text-green-600">
                    {formatCurrency((product as any).discount_price || product.discountPrice)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Save {formatCurrency(product.price - ((product as any).discount_price || product.discountPrice))}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">Stock Quantity</p>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xl font-bold">{(product as any).stock_quantity || product.stockQuantity || 0}</p>
                  {getStockBadge((product as any).stock_quantity || product.stockQuantity || 0, ((product as any).stock_quantity || product.stockQuantity || 0) > 0)}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Status & Features */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Status & Features</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="mt-1">{getStatusBadge(product.status)}</div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <div className="flex gap-2 mt-1">
                  {((product as any).is_featured || product.isFeatured) && (
                    <Badge variant="default">⭐ Featured</Badge>
                  )}
                  {((product as any).is_halal || product.isHalal) && (
                    <Badge variant="success">✓ Halal</Badge>
                  )}
                  {!((product as any).is_featured || product.isFeatured) && !((product as any).is_halal || product.isHalal) && (
                    <span className="text-sm text-muted-foreground">None</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Rating & Reviews */}
          {(product.rating || product.reviewCount) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating & Reviews
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.rating && (
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-2xl font-bold">{Number(product.rating).toFixed(1)}</span>
                        <span className="text-yellow-500">★</span>
                      </div>
                    </div>
                  )}
                  {product.reviewCount !== undefined && (
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reviews</p>
                      <p className="text-2xl font-bold">{product.reviewCount || 0}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Metadata */}
          <Separator />
          <div className="space-y-3">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {product.createdAt && (
                <div>
                  <p className="text-muted-foreground">Created At</p>
                  <p className="font-medium">{formatDate(product.createdAt)}</p>
                </div>
              )}
              {product.updatedAt && (
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(product.updatedAt)}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
