"use client"

import { useState, useEffect } from "react"
import { resolveImageUrl } from "@/lib/utils/image-url"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, MoveUp, MoveDown, Star, Eye } from "lucide-react"
import { Product } from "@/types"
import { AddFeaturedProductDialog } from "@/components/dashboard/add-featured-product-dialog"
import { ProductViewDialog } from "@/components/dashboard/product-view-dialog"
import { productsApi } from "@/lib/api/products"
import { toast } from "sonner"

export default function FeaturedProductsPage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)

  // Fetch products on mount
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await productsApi.getProducts()
      if (response.success && response.data) {
        // Separate featured and non-featured products
        const featured = response.data.filter((p: any) => p.is_featured === true)
        const available = response.data.filter((p: any) => p.is_featured !== true)
        
        // Map to Product type
        let featuredMapped = featured.map(mapApiProductToProduct)
        
        // Apply saved order from localStorage
        const savedOrder = localStorage.getItem('featuredProductsOrder')
        if (savedOrder) {
          try {
            const orderIds = JSON.parse(savedOrder)
            // Sort featured products according to saved order
            featuredMapped = featuredMapped.sort((a, b) => {
              const indexA = orderIds.indexOf(a.id)
              const indexB = orderIds.indexOf(b.id)
              // If not in saved order, put at end
              if (indexA === -1) return 1
              if (indexB === -1) return -1
              return indexA - indexB
            })
          } catch (e) {
            console.error('Error parsing saved order:', e)
          }
        }
        
        setFeaturedProducts(featuredMapped)
        setAvailableProducts(available.map(mapApiProductToProduct))
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  // Helper function to map API response to Product type
  const mapApiProductToProduct = (apiProduct: any): Product => {
    // Process images - API returns primary_image, convert to images array
    let images: string[] = []
    
    if (apiProduct.primary_image) {
      const imageUrl = resolveImageUrl(apiProduct.primary_image)
      images = imageUrl ? [imageUrl] : []
    } else if (apiProduct.images && Array.isArray(apiProduct.images)) {
      // Fallback for images array if it exists
      images = apiProduct.images
        .map((img: string) => resolveImageUrl(img))
        .filter((img: string | null): img is string => Boolean(img))
    }

    return {
      id: apiProduct.id,
      name: apiProduct.name_en || apiProduct.name,
      nameAr: apiProduct.name_ar || "",
      nameSo: apiProduct.name_so || "",
      description: apiProduct.description_en || apiProduct.description || "",
      descriptionAr: apiProduct.description_ar || "",
      descriptionSo: apiProduct.description_so || "",
      price: parseFloat(apiProduct.price) || 0,
      discountPrice: apiProduct.discount_price ? parseFloat(apiProduct.discount_price) : undefined,
      categoryId: apiProduct.category_id || "",
      subcategoryId: apiProduct.subcategory_id,
      images: images,
      stockQuantity: apiProduct.stock_quantity || 0,
      inStock: apiProduct.stock_quantity > 0,
      brand: apiProduct.brand_name || apiProduct.brand || "",
      sku: apiProduct.sku || "",
      tags: apiProduct.tags || [],
      variants: [],
      status: apiProduct.status || "active",
      isFeatured: apiProduct.is_featured || false,
      isHalal: apiProduct.is_halal || false,
      rating: apiProduct.rating || 0,
      reviewCount: apiProduct.review_count || 0,
      createdAt: new Date(apiProduct.created_at),
    }
  }

  const handleViewProduct = (product: Product) => {
    setViewProduct(product)
    setIsViewOpen(true)
  }

  const handleAddProduct = async (product: Product) => {
    try {
      console.log('Adding product to featured:', product.id, product.name)
      // Update product to set is_featured = true
      const response = await productsApi.updateProduct(product.id, { id: product.id, isFeatured: true })
      console.log('Update response:', response)
      if (response.success) {
        toast.success(`${product.name} added to featured products`)
        await fetchProducts() // Refresh the list
        setIsAddDialogOpen(false) // Close the dialog
      } else {
        toast.error('Failed to add product to featured')
      }
    } catch (error: any) {
      console.error('Error adding product to featured:', error)
      const errorMessage = error?.response?.data?.message || error?.message || 'Failed to add product to featured'
      toast.error(errorMessage)
    }
  }

  const handleRemoveProduct = async (productId: string) => {
    const product = featuredProducts.find((p) => p.id === productId)
    if (product) {
      try {
        // Update product to set is_featured = false
        const response = await productsApi.updateProduct(productId, { id: productId, isFeatured: false })
        if (response.success) {
          toast.success(`${product.name} removed from featured products`)
          fetchProducts() // Refresh the list
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to remove product from featured'
        toast.error(errorMessage)
      }
    }
  }

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newFeatured = [...featuredProducts]
      const temp = newFeatured[index]
      newFeatured[index] = newFeatured[index - 1]
      newFeatured[index - 1] = temp
      setFeaturedProducts(newFeatured)
      
      // Save the new order to localStorage for persistence
      const orderIds = newFeatured.map(p => p.id)
      localStorage.setItem('featuredProductsOrder', JSON.stringify(orderIds))
      
      toast.success("Product moved up")
    }
  }

  const handleMoveDown = async (index: number) => {
    if (index < featuredProducts.length - 1) {
      const newFeatured = [...featuredProducts]
      const temp = newFeatured[index]
      newFeatured[index] = newFeatured[index + 1]
      newFeatured[index + 1] = temp
      setFeaturedProducts(newFeatured)
      
      // Save the new order to localStorage for persistence
      const orderIds = newFeatured.map(p => p.id)
      localStorage.setItem('featuredProductsOrder', JSON.stringify(orderIds))
      
      toast.success("Product moved down")
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Featured Products</h1>
          <p className="text-muted-foreground">
            Manage products displayed on the homepage ({featuredProducts.length} featured)
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Info Card */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Star className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-900 dark:text-blue-100">
              Featured Products
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              These products will be displayed prominently on your homepage. You can reorder them by using the up/down buttons.
            </p>
          </div>
        </div>
      </Card>

      {/* Featured Products List */}
      {loading ? (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">Loading featured products...</p>
        </Card>
      ) : featuredProducts.length > 0 ? (
        <div className="grid gap-4">
          {featuredProducts.map((product, index) => (
            <Card key={product.id} className="p-4">
              <div className="flex items-center gap-4">
                {/* Order Number */}
                <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>

                {/* Product Image */}
                <div className="flex-shrink-0">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-20 w-20 rounded-lg object-cover"
                      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                        e.currentTarget.src = "https://via.placeholder.com/80?text=No+Image"
                      }}
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">No image</span>
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{product.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {product.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <p className="text-sm font-medium">
                          ${product.price.toFixed(2)}
                          {product.discountPrice && (
                            <span className="ml-2 text-muted-foreground line-through">
                              ${product.discountPrice.toFixed(2)}
                            </span>
                          )}
                        </p>
                        <Badge variant="outline">{product.sku}</Badge>
                        <Badge variant="outline">{product.brand}</Badge>
                        {product.inStock ? (
                          <Badge variant="success">In Stock</Badge>
                        ) : (
                          <Badge variant="secondary">Out of Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleViewProduct(product)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      title="Move up"
                    >
                      <MoveUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === featuredProducts.length - 1}
                      title="Move down"
                    >
                      <MoveDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveProduct(product.id)}
                    title="Remove from featured"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Featured Products</h3>
            <p className="text-muted-foreground mb-4">
              Add products to showcase them on your homepage
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Featured Product
            </Button>
          </div>
        </Card>
      )}

      {/* Add Featured Product Dialog */}
      <AddFeaturedProductDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        availableProducts={availableProducts}
        onAddProduct={handleAddProduct}
      />

      {/* Product View Dialog */}
      <ProductViewDialog
        product={viewProduct}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
      />
    </div>
  )
}
