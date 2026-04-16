"use client"

import { useState, useEffect } from "react"
import { Category, CreateCategoryDto } from "@/types"
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
import { Switch } from "@/components/ui/switch"
import { Upload, X } from "lucide-react"
import { categoriesApi } from "@/lib/api/categories"
import { toast } from "sonner"

interface CategoryFormDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (category: CreateCategoryDto) => void
}

export function CategoryFormDialog({
  category,
  open,
  onOpenChange,
  onSave,
}: CategoryFormDialogProps) {
  const [formData, setFormData] = useState({
    nameEn: "",
    nameAr: "",
    nameSo: "",
    descriptionEn: "",
    descriptionAr: "",
    descriptionSo: "",
    isActive: true,
    imageUrl: "",
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (category) {
      setFormData({
        nameEn: category.name || "",
        nameAr: "",
        nameSo: "",
        descriptionEn: category.description || "",
        descriptionAr: "",
        descriptionSo: "",
        isActive: category.isActive !== undefined ? category.isActive : true,
        imageUrl: category.image || "",
      })
      if (category.image) {
        setPreviewUrl(category.image)
      }
    } else {
      setFormData({
        nameEn: "",
        nameAr: "",
        nameSo: "",
        descriptionEn: "",
        descriptionAr: "",
        descriptionSo: "",
        isActive: true,
        imageUrl: "",
      })
      setSelectedFile(null)
      setPreviewUrl("")
    }
  }, [category, open])

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
    setFormData({ ...formData, imageUrl: "" })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.nameEn.trim()) {
      toast.error("Category name (English) is required")
      return
    }

    try {
      setUploading(true)
      
      let imageUrl = formData.imageUrl

      // Upload image if a new file is selected
      if (selectedFile) {
        const uploadResponse = await categoriesApi.uploadImage(selectedFile)
        if (uploadResponse.success && uploadResponse.data) {
          imageUrl = uploadResponse.data.imageUrl
        }
      }

      // Prepare category data for API
      const categoryData: any = {
        nameEn: formData.nameEn,
        nameAr: formData.nameAr || formData.nameEn,
        nameSo: formData.nameSo || formData.nameEn,
        descriptionEn: formData.descriptionEn,
        descriptionAr: formData.descriptionAr,
        descriptionSo: formData.descriptionSo,
        isActive: formData.isActive,
        imageUrl: imageUrl,
      }

      onSave(categoryData)
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit Category" : "Add New Category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update category information"
              : "Create a new category for your products"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Category Name */}
          <div className="space-y-2">
            <Label htmlFor="nameEn">
              Category Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nameEn"
              value={formData.nameEn}
              onChange={(e) =>
                setFormData({ ...formData, nameEn: e.target.value })
              }
              placeholder="e.g., Electronics, Clothing, Food"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="descriptionEn">Description</Label>
            <Textarea
              id="descriptionEn"
              value={formData.descriptionEn}
              onChange={(e) =>
                setFormData({ ...formData, descriptionEn: e.target.value })
              }
              placeholder="Category description..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Category Image</Label>
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
                    htmlFor="image-upload"
                    className="cursor-pointer text-primary hover:underline"
                  >
                    Click to upload
                  </Label>
                  <Input
                    id="image-upload"
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
                Make this category visible to customers
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? "Uploading..." : category ? "Update Category" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
