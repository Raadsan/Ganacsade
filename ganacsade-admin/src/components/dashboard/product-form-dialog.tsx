"use client"

import { useState, useEffect } from "react"
import { Product, CreateProductDto } from "@/types"
import { categoriesApi } from "@/lib/api/categories"
import { subcategoriesApi } from "@/lib/api/subcategories"
import { brandsApi } from "@/lib/api/brands"
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
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface ProductFormDialogProps {
  product: Product | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (product: CreateProductDto) => void
}

export function ProductFormDialog({
  product,
  open,
  onOpenChange,
  onSave,
}: ProductFormDialogProps) {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: "",
    nameAr: "",
    nameSo: "",
    description: "",
    descriptionAr: "",
    descriptionSo: "",
    price: 0,
    categoryId: "",
    subcategoryId: "",
    images: [],
    stockQuantity: 0,
    brand: "",
    sku: "",
    tags: [],
    status: "active",
    isFeatured: false,
    isHalal: false,
  })

  // Real categories and brands from API
  const [categories, setCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [brands, setBrands] = useState<any[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingBrands, setLoadingBrands] = useState(false)

  // Fetch categories on mount
  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true)
        const response = await categoriesApi.getCategories()
        if (response.success && response.data) {
          // Filter to show only active categories
          const activeCategories = response.data.filter((cat: any) => cat.is_active === true)
          setCategories(activeCategories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
        toast.error('Failed to load categories')
      } finally {
        setLoadingCategories(false)
      }
    }
    if (open) {
      fetchCategories()
    }
  }, [open])

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        setLoadingBrands(true)
        const response = await brandsApi.getBrands()
        if (response.success && response.data) {
          // Filter to show only active brands
          const activeBrands = response.data.filter((brand: any) => brand.is_active === true)
          setBrands(activeBrands)
        }
      } catch (error) {
        console.error('Error fetching brands:', error)
        toast.error('Failed to load brands')
      } finally {
        setLoadingBrands(false)
      }
    }
    if (open) {
      fetchBrands()
    }
  }, [open])

  // Fetch subcategories when category changes
  useEffect(() => {
    async function fetchSubcategories() {
      if (!formData.categoryId) {
        setSubcategories([])
        return
      }
      
      try {
        const response = await subcategoriesApi.getSubcategories(formData.categoryId)
        if (response.success && response.data) {
          // Filter to show only active subcategories
          const activeSubcategories = response.data.filter((sub: any) => sub.is_active === true)
          setSubcategories(activeSubcategories)
        } else {
          setSubcategories([])
        }
      } catch (error) {
        console.error('Error fetching subcategories:', error)
        setSubcategories([])
      }
    }
    
    fetchSubcategories()
  }, [formData.categoryId])

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])

  const [imageUrl, setImageUrl] = useState("")
  const [tagInput, setTagInput] = useState("")

  useEffect(() => {
    if (product) {
      console.log('ProductFormDialog received product:', product)
      setFormData({
        name: product.name || "",
        nameAr: product.nameAr || "",
        nameSo: product.nameSo || "",
        description: product.description || "",
        descriptionAr: product.descriptionAr || "",
        descriptionSo: product.descriptionSo || "",
        price: product.price || 0,
        categoryId: product.categoryId || "",
        subcategoryId: product.subcategoryId || "",
        images: product.images || [],
        discountPrice: product.discountPrice || undefined,
        stockQuantity: product.stockQuantity || 0,
        brand: product.brand || "",
        sku: product.sku || "",
        tags: product.tags || [],
        status: product.status || "active",
        isFeatured: product.isFeatured || false,
        isHalal: product.isHalal || false,
      })
      // Set preview URLs for existing images
      setPreviewUrls(product.images || [])
      setImageUrl("")
      setTagInput("")
      setSelectedFiles([])
      console.log('Form data set to:', {
        name: product.name,
        price: product.price,
        categoryId: product.categoryId,
        brand: product.brand,
        sku: product.sku,
        stockQuantity: product.stockQuantity,
        images: product.images
      })
    } else {
      // Reset form for new product
      setFormData({
        name: "",
        nameAr: "",
        nameSo: "",
        description: "",
        descriptionAr: "",
        descriptionSo: "",
        price: 0,
        categoryId: "",
        subcategoryId: "",
        images: [],
        stockQuantity: 0,
        brand: "",
        sku: "",
        tags: [],
        status: "active",
        isFeatured: false,
        isHalal: false,
      })
      setImageUrl("")
      setTagInput("")
      setSelectedFiles([])
      setPreviewUrls([])
    }
  }, [product, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Basic Information Validation
    if (!formData.name.trim()) {
      toast.error("Product name is required (Basic Info tab)")
      return
    }
    if (formData.price <= 0) {
      toast.error("Price must be greater than 0 (Basic Info tab)")
      return
    }
    if (!formData.categoryId) {
      toast.error("Please select a category (Basic Info tab)")
      return
    }
    if (!formData.sku.trim()) {
      toast.error("SKU is required (Basic Info tab)")
      return
    }
    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      toast.error("Stock quantity is required (Basic Info tab)")
      return
    }

    // Media Validation - Check if images are uploaded
    if (!product && (!formData.images || !Array.isArray(formData.images) || formData.images.length === 0)) {
      toast.error("Please add at least one product image (Media tab)")
      return
    }

    // Settings Validation - Optional but can add if needed
    // All validations passed
    onSave(formData)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const fileArray = Array.from(files)
      setSelectedFiles([...selectedFiles, ...fileArray])
      
      // Create preview URLs
      fileArray.forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          setPreviewUrls(prev => [...prev, reader.result as string])
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, reader.result as string]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
    setPreviewUrls(prev => prev.filter((_, i) => i !== index))
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !(formData.tags || []).includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()],
      })
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: (formData.tags || []).filter((t) => t !== tag),
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? "Edit Product" : "Add New Product"}
          </DialogTitle>
          <DialogDescription>
            {product
              ? "Update product information"
              : "Create a new product in your catalog"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information */}
            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Product Name (English) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Wireless Headphones Pro"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">
                    SKU <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) =>
                      setFormData({ ...formData, sku: e.target.value })
                    }
                    placeholder="e.g., WH-PRO-001"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (English)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Detailed product description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">
                    Price (USD) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discountPrice">Discount Price (USD)</Label>
                  <Input
                    id="discountPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.discountPrice || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountPrice: e.target.value
                          ? parseFloat(e.target.value)
                          : undefined,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stockQuantity">Stock Quantity</Label>
                  <Input
                    id="stockQuantity"
                    type="number"
                    min="0"
                    value={formData.stockQuantity || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stockQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.categoryId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, categoryId: value, subcategoryId: "" })
                    }
                    disabled={loadingCategories}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Select
                    value={formData.subcategoryId || ""}
                    onValueChange={(value) =>
                      setFormData({ ...formData, subcategoryId: value })
                    }
                    disabled={!formData.categoryId || subcategories.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        formData.categoryId 
                          ? subcategories.length > 0 
                            ? "Select subcategory" 
                            : "No subcategories available"
                          : "Select category first"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {subcategories.map((sub: any) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Select
                  value={formData.brand}
                  onValueChange={(value) =>
                    setFormData({ ...formData, brand: value })
                  }
                  disabled={loadingBrands}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={loadingBrands ? "Loading..." : "Select brand"} />
                  </SelectTrigger>
                  <SelectContent>
                    {brands && brands.length > 0 ? (
                      brands.map((brand) => (
                        <SelectItem key={brand.id} value={brand.name}>
                          {brand.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No brands available
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={addTag} variant="secondary">
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData.tags || []).map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>


            {/* Media */}
            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>
                  Product Images {!product && <span className="text-red-500">*</span>}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {!product ? "At least one image is required for new products" : "Upload additional product images"}
                </p>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <span className="text-primary hover:underline">Click to upload</span>
                      <span className="text-muted-foreground"> or drag and drop</span>
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, JPEG up to 5MB each
                    </p>
                  </div>
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>

              {formData.images && Array.isArray(formData.images) && formData.images.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Product ${index + 1}`}
                        className="w-full h-40 object-cover rounded-lg border"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = ""
                          e.currentTarget.className =
                            "w-full h-40 flex items-center justify-center bg-muted rounded-lg border"
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-destructive text-destructive-foreground p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Settings */}
            <TabsContent value="settings" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Featured Product</Label>
                  <p className="text-sm text-muted-foreground">
                    Display this product on the homepage
                  </p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isFeatured: checked })
                  }
                />
              </div>

            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {product ? "Update Product" : "Create Product"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
