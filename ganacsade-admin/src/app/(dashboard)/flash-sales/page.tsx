"use client"

import { useState, useEffect } from "react"
import { BACKEND_URL } from "@/lib/api/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Package,
  Zap,
} from "lucide-react"
import { FlashSale, CreateFlashSaleDto, Product, FlashSaleProduct } from "@/types"
import { FlashSaleFormDialog } from "@/components/dashboard/flash-sale-form-dialog"
import { AddFlashSaleProductDialog } from "@/components/dashboard/add-flash-sale-product-dialog"
import { EditFlashSaleProductDialog } from "@/components/dashboard/edit-flash-sale-product-dialog"
import { flashSalesApi } from "@/lib/api/flash-sales"
import { productsApi } from "@/lib/api/products"
import { toast } from "sonner"

// Data will be fetched from API

export default function FlashSalesPage() {
  const [flashSales, setFlashSales] = useState<FlashSale[]>([])
  const [selectedFlashSale, setSelectedFlashSale] = useState<FlashSale | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [currentFlashSaleId, setCurrentFlashSaleId] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<FlashSaleProduct | null>(null)
  const [, setRefresh] = useState(0)
  const [loading, setLoading] = useState(true)
  const [availableProducts, setAvailableProducts] = useState<Product[]>([])

  // Fetch flash sales on mount
  useEffect(() => {
    fetchFlashSales()
    fetchProducts()
  }, [])

  // Update countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      setRefresh((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const fetchFlashSales = async () => {
    try {
      setLoading(true)
      const response = await flashSalesApi.getFlashSales()
      if (response.success && response.data) {
        // Fetch detailed info for each sale to get products
        const salesWithProducts = await Promise.all(
          response.data.map(async (sale: any) => {
            try {
              const detailResponse: any = await flashSalesApi.getFlashSale(sale.id)
              const products = detailResponse.success && detailResponse.data?.products 
                ? detailResponse.data.products.map((p: any) => ({
                    id: p.id,
                    productId: p.product_id,
                    productName: p.product_name,
                    productImage: p.product_image_url ? `${BACKEND_URL}${p.product_image_url}` : undefined,
                    originalPrice: parseFloat(p.original_price),
                    salePrice: parseFloat(p.sale_price),
                    discountPercentage: p.discount_percentage,
                    stockLimit: p.stock_limit,
                    soldCount: p.sold_count,
                  }))
                : []
              
              return {
                id: sale.id,
                title: sale.title,
                description: sale.description,
                startTime: new Date(sale.start_time),
                endTime: new Date(sale.end_time),
                status: sale.status,
                isActive: sale.is_active,
                products: products,
                createdAt: new Date(sale.created_at),
              }
            } catch (error) {
              console.error(`Error fetching details for sale ${sale.id}:`, error)
              return {
                id: sale.id,
                title: sale.title,
                description: sale.description,
                startTime: new Date(sale.start_time),
                endTime: new Date(sale.end_time),
                status: sale.status,
                isActive: sale.is_active,
                products: [],
                createdAt: new Date(sale.created_at),
              }
            }
          })
        )
        setFlashSales(salesWithProducts)
      }
    } catch (error) {
      console.error('Error fetching flash sales:', error)
      toast.error('Failed to load flash sales')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productsApi.getProducts()
      if (response.success && response.data) {
        // Map API products to Product type
        const mappedProducts = response.data.map((p: any) => ({
          id: p.id,
          name: p.name_en || p.name,
          nameAr: p.name_ar || "",
          nameSo: p.name_so || "",
          description: p.description_en || p.description || "",
          descriptionAr: p.description_ar || "",
          descriptionSo: p.description_so || "",
          price: parseFloat(p.price) || 0,
          categoryId: p.category_id || "",
          images: p.primary_image ? [`${BACKEND_URL}${p.primary_image}`] : [],
          rating: p.rating || 0,
          reviewCount: p.review_count || 0,
          inStock: p.stock_quantity > 0,
          stockQuantity: p.stock_quantity || 0,
          brand: p.brand_name || p.brand || "",
          sku: p.sku || "",
          tags: p.tags || [],
          variants: [],
          status: p.status || "active",
          isFeatured: p.is_featured || false,
          isHalal: p.is_halal || false,
          createdAt: new Date(p.created_at),
        }))
        setAvailableProducts(mappedProducts)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const getTimeRemaining = (endTime: Date | string) => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) {
      return "Expired"
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`
    }
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  const getFlashSaleStatus = (flashSale: FlashSale): FlashSale["status"] => {
    const now = new Date().getTime()
    const start = new Date(flashSale.startTime).getTime()
    const end = new Date(flashSale.endTime).getTime()

    if (now < start) return "scheduled"
    if (now >= start && now <= end) return "active"
    return "expired"
  }

  const getStatusBadge = (status: FlashSale["status"]) => {
    switch (status) {
      case "active":
        return <Badge variant="success">Active</Badge>
      case "scheduled":
        return <Badge variant="default">Scheduled</Badge>
      case "expired":
        return <Badge variant="secondary">Expired</Badge>
    }
  }

  const handleAddFlashSale = () => {
    setSelectedFlashSale(null)
    setIsFormOpen(true)
  }

  const handleEditFlashSale = (flashSale: FlashSale) => {
    setSelectedFlashSale(flashSale)
    setIsFormOpen(true)
  }

  const handleDeleteFlashSale = async (id: string) => {
    if (confirm("Are you sure you want to delete this flash sale?")) {
      try {
        const response = await flashSalesApi.deleteFlashSale(id)
        if (response.success) {
          toast.success("Flash sale deleted successfully")
          fetchFlashSales()
        }
      } catch (error) {
        console.error('Error deleting flash sale:', error)
        toast.error('Failed to delete flash sale')
      }
    }
  }

  const handleSaveFlashSale = async (flashSaleData: CreateFlashSaleDto) => {
    try {
      // Convert Date objects to ISO strings for API
      const apiData = {
        title: flashSaleData.title,
        description: flashSaleData.description,
        startTime: flashSaleData.startTime instanceof Date 
          ? flashSaleData.startTime.toISOString() 
          : flashSaleData.startTime,
        endTime: flashSaleData.endTime instanceof Date 
          ? flashSaleData.endTime.toISOString() 
          : flashSaleData.endTime,
        isActive: flashSaleData.isActive,
      }

      if (selectedFlashSale) {
        const response = await flashSalesApi.updateFlashSale(selectedFlashSale.id, apiData)
        if (response.success) {
          toast.success("Flash sale updated successfully")
          fetchFlashSales()
        }
      } else {
        const response = await flashSalesApi.createFlashSale(apiData)
        if (response.success) {
          toast.success("Flash sale created successfully")
          fetchFlashSales()
        }
      }
      setIsFormOpen(false)
    } catch (error) {
      console.error('Error saving flash sale:', error)
      toast.error('Failed to save flash sale')
    }
  }

  const handleAddProduct = (flashSaleId: string) => {
    setCurrentFlashSaleId(flashSaleId)
    setIsAddProductOpen(true)
  }

  const handleSaveProduct = async (product: FlashSaleProduct) => {
    try {
      const response: any = await flashSalesApi.addProductToSale(currentFlashSaleId, {
        productId: product.productId,
        salePrice: product.salePrice,
        stockLimit: product.stockLimit,
      })
      
      if (response.success) {
        toast.success(`${product.productName} added to flash sale`)
        // Refresh flash sales to get updated product list
        await fetchFlashSales()
      } else {
        toast.error(response.message || 'Failed to add product to flash sale')
      }
    } catch (error: any) {
      console.error('Error adding product to flash sale:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to add product to flash sale'
      toast.error(errorMessage)
    }
  }

  const handleEditProduct = (flashSaleId: string, product: FlashSaleProduct) => {
    setCurrentFlashSaleId(flashSaleId)
    setSelectedProduct(product)
    setIsEditProductOpen(true)
  }

  const handleUpdateProduct = async (updatedProduct: FlashSaleProduct) => {
    try {
      const response: any = await flashSalesApi.updateProductInSale(
        currentFlashSaleId,
        updatedProduct.id,
        {
          salePrice: updatedProduct.salePrice,
          stockLimit: updatedProduct.stockLimit,
          soldCount: updatedProduct.soldCount,
        }
      )

      if (response.success) {
        // Update local state
        setFlashSales(
          flashSales.map((fs) =>
            fs.id === currentFlashSaleId
              ? {
                  ...fs,
                  products: fs.products.map((p) =>
                    p.id === updatedProduct.id ? updatedProduct : p
                  ),
                }
              : fs
          )
        )
        toast.success("Product updated successfully")
        // Refresh data from server to ensure sync
        await fetchFlashSales()
      } else {
        toast.error(response.message || 'Failed to update product')
      }
    } catch (error) {
      console.error('Error updating flash sale product:', error)
      toast.error('Failed to update product')
    }
  }

  const handleRemoveProduct = async (flashSaleId: string, productId: string) => {
    if (confirm("Remove this product from flash sale?")) {
      try {
        const response: any = await flashSalesApi.removeProductFromSale(flashSaleId, productId)
        if (response.success) {
          toast.success("Product removed from flash sale")
          await fetchFlashSales()
        } else {
          toast.error(response.message || 'Failed to remove product')
        }
      } catch (error: any) {
        console.error('Error removing product from flash sale:', error)
        const errorMessage = error?.response?.data?.message || 'Failed to remove product from flash sale'
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flash Sales</h1>
          <p className="text-muted-foreground">
            Manage time-limited sales and promotions ({flashSales.length} active sales)
          </p>
        </div>
        <Button onClick={handleAddFlashSale}>
          <Plus className="mr-2 h-4 w-4" />
          Create Flash Sale
        </Button>
      </div>

      {/* Flash Sales List */}
      {flashSales.length > 0 ? (
        <div className="grid gap-6">
          {flashSales.map((flashSale) => {
            const status = getFlashSaleStatus(flashSale)
            const timeRemaining = getTimeRemaining(flashSale.endTime)

            return (
              <Card key={flashSale.id} className="p-6">
                {/* Flash Sale Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{flashSale.title}</h3>
                      {getStatusBadge(status)}
                      {status === "active" && (
                        <Badge variant="destructive" className="animate-pulse">
                          <Zap className="h-3 w-3 mr-1" />
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {flashSale.description}
                    </p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {status === "active" ? "Ends in:" : status === "scheduled" ? "Starts in:" : "Ended"}
                        </span>
                        <span className="font-semibold text-lg">
                          {status === "expired" ? "Expired" : timeRemaining}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{flashSale.products.length} Products</span>
                      </div>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditFlashSale(flashSale)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteFlashSale(flashSale.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Products in Flash Sale */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Products in this sale</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddProduct(flashSale.id)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Product
                    </Button>
                  </div>

                  {flashSale.products.length > 0 ? (
                    <div className="grid gap-3">
                      {flashSale.products.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            {product.productImage ? (
                              <img
                                src={product.productImage}
                                alt={product.productName}
                                className="h-12 w-12 rounded object-cover"
                                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                  e.currentTarget.src = "https://via.placeholder.com/48?text=No+Image"
                                }}
                              />
                            ) : (
                              <div className="h-12 w-12 rounded bg-muted" />
                            )}
                            <div>
                              <p className="font-medium">{product.productName}</p>
                              <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground line-through">
                                  ${product.originalPrice.toFixed(2)}
                                </span>
                                <span className="font-bold text-green-600">
                                  ${product.salePrice.toFixed(2)}
                                </span>
                                <Badge variant="destructive">{product.discountPercentage}% OFF</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-muted-foreground">Stock</p>
                              <p className="font-semibold">
                                {product.soldCount}/{product.stockLimit}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditProduct(flashSale.id, product)}
                              title="Edit product"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(flashSale.id, product.id)}
                              title="Remove product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border rounded-lg bg-muted/20">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No products added yet
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2"
                        onClick={() => handleAddProduct(flashSale.id)}
                      >
                        Add your first product
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Flash Sales</h3>
            <p className="text-muted-foreground mb-4">
              Create time-limited sales to boost your revenue
            </p>
            <Button onClick={handleAddFlashSale}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Flash Sale
            </Button>
          </div>
        </Card>
      )}

      {/* Flash Sale Form Dialog */}
      <FlashSaleFormDialog
        flashSale={selectedFlashSale}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveFlashSale}
      />

      {/* Add Product Dialog */}
      <AddFlashSaleProductDialog
        open={isAddProductOpen}
        onOpenChange={setIsAddProductOpen}
        availableProducts={availableProducts}
        onAddProduct={handleSaveProduct}
      />

      {/* Edit Product Dialog */}
      <EditFlashSaleProductDialog
        open={isEditProductOpen}
        onOpenChange={setIsEditProductOpen}
        product={selectedProduct}
        onUpdateProduct={handleUpdateProduct}
      />
    </div>
  )
}
