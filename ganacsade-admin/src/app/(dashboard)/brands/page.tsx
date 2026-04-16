"use client"

import { useState, useEffect } from "react"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, Upload, X } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { brandsApi } from "@/lib/api/brands"
import { toast } from "sonner"

interface Brand {
  id: string
  name: string
  description?: string
  logo_url?: string
  website?: string
  is_active: boolean
  product_count: number
  created_at: string
}

export default function BrandsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    logoUrl: "",
    isActive: true,
  })

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      setLoading(true)
      const response = await brandsApi.getBrands()
      if (response.success && response.data) {
        setBrands(response.data)
      }
    } catch (error) {
      console.error('Error fetching brands:', error)
      toast.error('Failed to load brands')
    } finally {
      setLoading(false)
    }
  }

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (brand.description && brand.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file")
        return
      }

      setSelectedFile(file)

      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedFile(null)
    setPreviewUrl("")
    setFormData({ ...formData, logoUrl: "" })
  }

  const handleSaveBrand = async () => {
    if (!formData.name.trim()) {
      toast.error("Brand name is required")
      return
    }

    try {
      setUploading(true)
      
      let logoUrl = formData.logoUrl

      // Upload logo if a new file is selected
      if (selectedFile) {
        const uploadResponse = await brandsApi.uploadLogo(selectedFile)
        if (uploadResponse.success && uploadResponse.data) {
          logoUrl = uploadResponse.data.logoUrl
        }
      }

      const brandData = {
        name: formData.name,
        description: formData.description,
        logoUrl: logoUrl,
        isActive: formData.isActive,
      }

      if (selectedBrand) {
        // Update existing brand
        const response = await brandsApi.updateBrand(selectedBrand.id, brandData)
        if (response.success) {
          toast.success("Brand updated successfully")
          fetchBrands()
          setIsEditDialogOpen(false)
        }
      } else {
        // Create new brand
        const response = await brandsApi.createBrand(brandData)
        if (response.success) {
          toast.success("Brand created successfully")
          fetchBrands()
          setIsAddDialogOpen(false)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save brand'
      toast.error(errorMessage)
    } finally {
      setUploading(false)
    }
  }

  const handleEditBrand = (brand: Brand) => {
    setSelectedBrand(brand)
    setFormData({
      name: brand.name,
      description: brand.description || "",
      logoUrl: brand.logo_url || "",
      isActive: brand.is_active,
    })
    if (brand.logo_url) {
      setPreviewUrl(`http://localhost:5000${brand.logo_url}`)
    }
    setIsEditDialogOpen(true)
  }

  const handleDeleteBrand = async (id: string) => {
    if (confirm("Are you sure you want to delete this brand? This will affect all products with this brand.")) {
      try {
        const response = await brandsApi.deleteBrand(id)
        if (response.success) {
          toast.success("Brand deleted successfully")
          fetchBrands()
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete brand'
        toast.error(errorMessage)
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
          <p className="text-muted-foreground">
            Manage product brands and manufacturers
          </p>
        </div>
        
        <Button onClick={() => {
          setSelectedBrand(null)
          setFormData({ name: "", description: "", logoUrl: "", isActive: true })
          setSelectedFile(null)
          setPreviewUrl("")
          setIsAddDialogOpen(true)
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search brands..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Brands Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">Loading brands...</p>
                </TableCell>
              </TableRow>
            ) : filteredBrands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <p className="text-muted-foreground">No brands found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredBrands.map((brand) => (
                <TableRow key={brand.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-muted">
                        <span className="text-sm font-semibold">
                          {brand.name.substring(0, 2).toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium">{brand.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {brand.description || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{brand.product_count} products</Badge>
                  </TableCell>
                  <TableCell>
                    {brand.is_active ? (
                      <Badge variant="success">Active</Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(new Date(brand.created_at))}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditBrand(brand)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={() => handleDeleteBrand(brand.id)}
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

      {/* Add/Edit Brand Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false)
          setIsEditDialogOpen(false)
          setSelectedFile(null)
          setPreviewUrl("")
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedBrand ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription>
              {selectedBrand ? "Update brand information" : "Create a new brand to organize your products"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Brand Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Brand Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Samsung, Nike, Apple"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brand description..."
                rows={3}
              />
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Brand Logo</Label>
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted rounded-lg p-8 text-center">
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                  <div className="mt-4">
                    <Label
                      htmlFor="logo-upload"
                      className="cursor-pointer text-primary hover:underline"
                    >
                      Click to upload
                    </Label>
                    <Input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between space-x-2 pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active Status</Label>
                <p className="text-sm text-muted-foreground">
                  Make this brand visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false)
                setIsEditDialogOpen(false)
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveBrand} disabled={uploading}>
              {uploading ? "Uploading..." : selectedBrand ? "Update Brand" : "Create Brand"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
