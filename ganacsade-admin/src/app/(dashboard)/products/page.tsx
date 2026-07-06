"use client"

import { useState, useEffect } from "react"
import { productsApi } from "@/lib/api/products"
import { BACKEND_URL, axiosInstance } from "@/lib/api/client"
import { resolveImageUrl } from "@/lib/utils/image-url"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Plus, Search, MoreVertical, Edit, Trash2, Download, Filter, X, FileText, Eye } from "lucide-react"
import { formatCurrency, formatDate, exportProductsToCSV } from "@/lib/utils"
import { Product, CreateProductDto } from "@/types"
import { ProductFormDialog } from "@/components/dashboard/product-form-dialog"
import { ProductViewDialog } from "@/components/dashboard/product-view-dialog"
import { toast } from "sonner"

// Mock data - replace with real API calls
const mockProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Headphones Pro",
    nameAr: "سماعات لاسلكية برو",
    nameSo: "Dhagaha Wireless Pro",
    description: "Premium wireless headphones with active noise cancellation",
    descriptionAr: "سماعات لاسلكية فاخرة",
    descriptionSo: "Dhagaha wireless oo fiican",
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
    status: "active",
    isFeatured: true,
    isHalal: false,
    createdAt: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Smart Watch Ultra",
    nameAr: "ساعة ذكية ألترا",
    nameSo: "Saacad Smart Ultra",
    description: "Advanced fitness tracking smartwatch",
    descriptionAr: "ساعة ذكية متقدمة",
    descriptionSo: "Saacad smart ah",
    price: 499.99,
    discountPrice: 449.99,
    categoryId: "cat-electronics",
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"],
    rating: 4.8,
    reviewCount: 256,
    inStock: true,
    stockQuantity: 12,
    brand: "TechWear",
    sku: "SW-ULTRA-002",
    tags: ["electronics", "smartwatch"],
    variants: [],
    status: "active",
    isFeatured: true,
    isHalal: false,
    createdAt: new Date("2024-01-10"),
  },
  {
    id: "3",
    name: "Men's Polo Shirt",
    nameAr: "قميص بولو رجالي",
    nameSo: "Shaati Polo Ragga",
    description: "Classic cotton polo shirt",
    descriptionAr: "قميص بولو قطني كلاسيكي",
    descriptionSo: "Shaati polo cudbi ah",
    price: 49.99,
    categoryId: "cat-mens",
    images: ["https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500"],
    rating: 4.2,
    reviewCount: 89,
    inStock: false,
    stockQuantity: 0,
    brand: "FashionFit",
    sku: "MPS-003",
    tags: ["clothing", "mens"],
    variants: [],
    status: "inactive",
    isFeatured: false,
    isHalal: false,
    createdAt: new Date("2024-01-05"),
  },
  {
    id: "4",
    name: "Women's Handbag",
    nameAr: "حقيبة نسائية",
    nameSo: "Boorso Haweenka",
    description: "Elegant leather handbag",
    descriptionAr: "حقيبة جلدية أنيقة",
    descriptionSo: "Boorso qurux badan",
    price: 129.99,
    categoryId: "cat-womens",
    images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500"],
    rating: 4.6,
    reviewCount: 145,
    inStock: true,
    stockQuantity: 28,
    brand: "LuxeStyle",
    sku: "WHB-004",
    tags: ["accessories", "womens"],
    variants: [],
    status: "active",
    isFeatured: false,
    isHalal: false,
    createdAt: new Date("2024-01-20"),
  },
]

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewProduct, setViewProduct] = useState<Product | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [subcategoryFilter, setSubcategoryFilter] = useState<string>("all")
  const [stockFilter, setStockFilter] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  // Fetch products from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const response = await productsApi.getProducts({
          search: searchQuery || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        if (response.success && response.data) {
          setProducts(response.data)
        }
      } catch {
        toast.error('Failed to load products')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [searchQuery, categoryFilter, statusFilter])

  // API already handles filtering, so just use products directly
  const filteredProducts = products.filter((product) => {
    // Only apply client-side filters that API doesn't handle
    const matchesSubcategory = subcategoryFilter === "all" || product.subcategory_id === subcategoryFilter
    
    let matchesStock = true
    if (stockFilter === "in_stock") {
      matchesStock = product.inStock && product.stockQuantity > 0
    } else if (stockFilter === "low_stock") {
      matchesStock = product.stockQuantity > 0 && product.stockQuantity < 20
    } else if (stockFilter === "out_of_stock") {
      matchesStock = !product.inStock || product.stockQuantity === 0
    }

    return matchesSubcategory && matchesStock
  })

  const handleAddProduct = () => {
    setSelectedProduct(null)
    setIsFormOpen(true)
  }

  const mapApiProductToForm = (fullProduct: any): Product => ({
    id: fullProduct.id,
    name: fullProduct.name_en || '',
    nameAr: fullProduct.name_ar || '',
    nameSo: fullProduct.name_so || '',
    description: fullProduct.description_en || '',
    descriptionAr: fullProduct.description_ar || '',
    descriptionSo: fullProduct.description_so || '',
    price: parseFloat(fullProduct.price?.toString() || '0'),
    discountPrice: fullProduct.discount_price
      ? parseFloat(fullProduct.discount_price.toString())
      : undefined,
    categoryId: fullProduct.category_id || '',
    subcategoryId: fullProduct.subcategory_id || '',
    images:
      fullProduct.images?.map((img: any) => resolveImageUrl(img.image_url)).filter(Boolean) ||
      (fullProduct.primary_image ? [resolveImageUrl(fullProduct.primary_image)!].filter(Boolean) : []),
    rating: parseFloat(fullProduct.rating?.toString() || '0'),
    reviewCount: fullProduct.review_count || 0,
    inStock: fullProduct.in_stock !== false,
    stockQuantity: fullProduct.stock_quantity || 0,
    brand: fullProduct.brand_name || fullProduct.brand || '',
    sku: fullProduct.sku || '',
    tags: fullProduct.tags || [],
    variants: fullProduct.variants || [],
    status: fullProduct.status || 'active',
    isFeatured: fullProduct.is_featured || false,
    isHalal: fullProduct.is_halal || false,
    createdAt: fullProduct.created_at ? new Date(fullProduct.created_at) : undefined,
  })

  const refreshProducts = async () => {
    const productsResponse = await productsApi.getProducts({
      search: searchQuery || undefined,
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      status: statusFilter !== 'all' ? statusFilter : undefined,
    })
    if (productsResponse.success && productsResponse.data) {
      setProducts(productsResponse.data)
    }
  }

  const handleViewProduct = (product: Product) => {
    setViewProduct(product)
    setIsViewOpen(true)
  }

  const handleEditProduct = async (product: any) => {
    setSelectedProduct(mapApiProductToForm(product))
    setIsFormOpen(true)

    try {
      const response = await productsApi.getProduct(product.id)
      if (response.success && response.data) {
        setSelectedProduct(mapApiProductToForm(response.data))
      }
    } catch {
      toast.error('Failed to load full product details')
    }
  }

  const handleToggleStatus = async (product: any) => {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    try {
      const response = await productsApi.updateProduct(product.id, { status: newStatus } as any)
      if (response.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: newStatus } : p))
        )
        toast.success(`Product ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      }
    } catch {
      toast.error('Failed to update product status')
    }
  }

  const handleDialogClose = (open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      // Reset selected product when dialog closes
      setSelectedProduct(null)
    }
  }

  const uploadProductImages = async (productId: string, images: string[]) => {
    // Convert base64 images to File objects
    const formData = new FormData()
    
    for (let i = 0; i < images.length; i++) {
      const base64 = images[i]
      // Convert base64 to blob
      const response = await fetch(base64)
      const blob = await response.blob()
      const file = new File([blob], `image-${i}.jpg`, { type: 'image/jpeg' })
      formData.append('images', file)
    }
    
    // Upload to server
    await axiosInstance.post(`/admin/products/${productId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        const response = await productsApi.deleteProduct(id)
        if (response.success) {
          toast.success("Product deleted successfully")
          await refreshProducts()
        }
      } catch {
        toast.error('Failed to delete product')
      }
    }
  }

  const handleSaveProduct = async (productData: CreateProductDto) => {
    try {
      if (selectedProduct) {
        // Update existing product
        const updateData = {
          id: selectedProduct.id,
          nameEn: productData.name || '',
          nameSo: productData.nameSo || '',
          nameAr: productData.nameAr || '',
          descriptionEn: productData.description || '',
          descriptionSo: productData.descriptionSo || '',
          descriptionAr: productData.descriptionAr || '',
          categoryId: productData.categoryId,
          subcategoryId: productData.subcategoryId || null,
          sku: productData.sku,
          price: productData.price,
          compareAtPrice: productData.discountPrice || null,
          stockQuantity: productData.stockQuantity,
          lowStockThreshold: 10,
          status: productData.status || 'active',
          isFeatured: productData.isFeatured || false,
        }
        
        const response = await productsApi.updateProduct(selectedProduct.id, updateData as any)
        
        if (response.success) {
          // Upload new images if any
          if (productData.images && productData.images.length > 0) {
            try {
              await uploadProductImages(selectedProduct.id, productData.images)
              toast.success("Product and images updated successfully")
            } catch {
              toast.warning("Product updated but some images failed to upload")
            }
          } else {
            toast.success("Product updated successfully")
          }
          
          await refreshProducts()
          setIsFormOpen(false)
        }
      } else {
        // Add new product - backend expects specific field names
        // Validate that we have a categoryId
        if (!productData.categoryId) {
          toast.error('Please select a category')
          return
        }
        
        const createData = {
          nameEn: productData.name,
          nameAr: productData.nameAr || productData.name,
          nameSo: productData.nameSo || productData.name,
          descriptionEn: productData.description || '',
          descriptionAr: productData.descriptionAr || productData.description || '',
          descriptionSo: productData.descriptionSo || productData.description || '',
          categoryId: productData.categoryId, // Required field
          subcategoryId: productData.subcategoryId || null,
          brandId: null, // Brand ID - will be null for now
          sku: productData.sku,
          price: productData.price,
          compareAtPrice: productData.discountPrice || null, // Maps to discount_price in DB
          stockQuantity: productData.stockQuantity,
          lowStockThreshold: 10,
          status: productData.status || 'active',
          isFeatured: productData.isFeatured || false,
        }
        
        const response = await productsApi.createProduct(createData as any)
        
        if (response.success && response.data) {
          const productId = response.data.id
          
          // Upload images if any
          if (productData.images && productData.images.length > 0) {
            try {
              await uploadProductImages(productId, productData.images)
              toast.success("Product and images created successfully")
            } catch {
              toast.warning("Product created but some images failed to upload")
            }
          } else {
            toast.success("Product created successfully")
          }
          
          await refreshProducts()
          setIsFormOpen(false)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Unknown error'
      toast.error(`Failed to ${selectedProduct ? 'update' : 'create'} product: ${errorMessage}`)
    }
  }

  const handleExportCSV = () => {
    if (filteredProducts.length === 0) {
      toast.error("No products to export")
      return
    }
    exportProductsToCSV(filteredProducts)
    toast.success(`Exported ${filteredProducts.length} products to CSV`)
  }

  const clearFilters = () => {
    setStatusFilter("all")
    setCategoryFilter("all")
    setSubcategoryFilter("all")
    setStockFilter("all")
    setSearchQuery("")
    toast.info("Filters cleared")
  }

  const hasActiveFilters =
    statusFilter !== "all" || categoryFilter !== "all" || subcategoryFilter !== "all" || stockFilter !== "all" || searchQuery

  const getStatusBadge = (status: string) => {
    if (status === "active") return <Badge variant="success">Active</Badge>
    if (status === "inactive") return <Badge variant="secondary">Inactive</Badge>
    if (status === "draft") return <Badge variant="warning">Draft</Badge>
    return <Badge variant="secondary">Archived</Badge>
  }

  const getStockBadge = (stock: number, inStock: boolean) => {
    if (!inStock || stock === 0) {
      return <Badge variant="destructive">Out of Stock</Badge>
    } else if (stock < 20) {
      return <Badge variant="warning">Low Stock</Badge>
    }
    return <Badge variant="success">In Stock</Badge>
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage your product inventory ({filteredProducts.length}{" "}
            {filteredProducts.length === 1 ? "product" : "products"})
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={handleAddProduct}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products by name, SKU, or brand..."
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
            <div className="grid gap-4 pt-4 border-t md:grid-cols-2 lg:grid-cols-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Product Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="cat-electronics">Electronics</SelectItem>
                    <SelectItem value="cat-mens">Men's Market</SelectItem>
                    <SelectItem value="cat-womens">Women's Market</SelectItem>
                    <SelectItem value="cat-kids">Kids Market</SelectItem>
                    <SelectItem value="cat-cosmetics">Cosmetics</SelectItem>
                    <SelectItem value="cat-gifts">Gifts</SelectItem>
                    <SelectItem value="cat-general">General Goods</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Subcategory Filter */}
              <div className="space-y-2">
                <Label>Subcategory</Label>
                <Select value={subcategoryFilter} onValueChange={setSubcategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Subcategories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subcategories</SelectItem>
                    <SelectItem value="sub-phones">Phones</SelectItem>
                    <SelectItem value="sub-laptops">Laptops</SelectItem>
                    <SelectItem value="sub-tablets">Tablets</SelectItem>
                    <SelectItem value="sub-headphones">Headphones</SelectItem>
                    <SelectItem value="sub-cameras">Cameras</SelectItem>
                    <SelectItem value="sub-shirts">Shirts</SelectItem>
                    <SelectItem value="sub-pants">Pants</SelectItem>
                    <SelectItem value="sub-shoes">Shoes</SelectItem>
                    <SelectItem value="sub-accessories">Accessories</SelectItem>
                    <SelectItem value="sub-watches">Watches</SelectItem>
                    <SelectItem value="sub-dresses">Dresses</SelectItem>
                    <SelectItem value="sub-tops">Tops</SelectItem>
                    <SelectItem value="sub-bags">Bags</SelectItem>
                    <SelectItem value="sub-jewelry">Jewelry</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Stock Filter */}
              <div className="space-y-2">
                <Label>Stock Status</Label>
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Stock Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock (&lt; 20)</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  Loading products...
                </TableCell>
              </TableRow>
            ) : filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-md border bg-muted overflow-hidden flex-shrink-0">
                      {product.primary_image ? (
                        <img
                          src={resolveImageUrl(product.primary_image) || ''}
                          alt={product.name_en}
                          className="h-full w-full object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.style.display = 'none'
                            const parent = e.currentTarget.parentElement
                            if (parent) {
                              parent.innerHTML = '<div class="h-full w-full flex items-center justify-center text-xs text-muted-foreground">IMG</div>'
                            }
                          }}
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                          IMG
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{product.name_en}</p>
                      {product.brand_name && (
                        <p className="text-sm text-muted-foreground">{product.brand_name}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{product.sku}</TableCell>
                <TableCell>
                  {product.category_name || 'N/A'}
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{formatCurrency(parseFloat(product.price))}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{product.stock_quantity}</span>
                    {getStockBadge(product.stock_quantity, product.stock_quantity > 0)}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(product)}
                    className="cursor-pointer rounded-md transition-opacity hover:opacity-80"
                    title="Click to toggle Active / Inactive"
                  >
                    {getStatusBadge(product.status)}
                  </button>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {product.created_at && formatDate(product.created_at)}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleViewProduct(product)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEditProduct(product)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
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

      {/* Product Form Dialog */}
      <ProductFormDialog
        key={selectedProduct?.id ?? "new"}
        product={selectedProduct}
        open={isFormOpen}
        onOpenChange={handleDialogClose}
        onSave={handleSaveProduct}
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
