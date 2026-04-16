"use client"

import { useState, useEffect } from "react"
import { Advertisement, CreateAdvertisementDto, AdvertisementPlacement } from "@/types"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Upload, X } from "lucide-react"
import { toast } from "sonner"

interface AdvertisementFormDialogProps {
  advertisement: Advertisement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (advertisement: CreateAdvertisementDto, imageFile?: File) => void
}

// Helper function to format date for datetime-local input
const formatDateTimeLocal = (date: string | Date): string => {
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function AdvertisementFormDialog({
  advertisement,
  open,
  onOpenChange,
  onSave,
}: AdvertisementFormDialogProps) {
  const [formData, setFormData] = useState<CreateAdvertisementDto>({
    title: "",
    description: "",
    imageUrl: "",
    targetUrl: "",
    placement: "home_slider",
    displayOrder: 1,
    isActive: true,
  })

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>("")

  useEffect(() => {
    if (advertisement) {
      setFormData({
        title: advertisement.title,
        description: advertisement.description,
        imageUrl: advertisement.imageUrl,
        targetUrl: advertisement.targetUrl,
        placement: advertisement.placement,
        displayOrder: advertisement.displayOrder,
        isActive: advertisement.isActive,
        startDate: advertisement.startDate,
        endDate: advertisement.endDate,
      })
      if (advertisement.imageUrl) {
        setPreviewUrl(advertisement.imageUrl)
      }
    } else {
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
        targetUrl: "",
        placement: "home_slider",
        displayOrder: 1,
        isActive: true,
      })
      setSelectedFile(null)
      setPreviewUrl("")
    }
  }, [advertisement, open])

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error("Advertisement title is required")
      return
    }
    if (!previewUrl && !formData.imageUrl) {
      toast.error("Advertisement image is required")
      return
    }

    // Pass form data and image file to parent
    const advertisementData = {
      ...formData,
      imageUrl: previewUrl || formData.imageUrl,
    }

    onSave(advertisementData, selectedFile || undefined)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {advertisement ? "Edit Advertisement" : "Create New Advertisement"}
          </DialogTitle>
          <DialogDescription>
            {advertisement
              ? "Update advertisement information"
              : "Create a new advertisement banner"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Advertisement Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Summer Sale Banner, New Arrivals"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of the advertisement..."
              rows={2}
            />
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label>
              Advertisement Image <span className="text-red-500">*</span>
            </Label>
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = "https://via.placeholder.com/800x200?text=Image+Not+Found"
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
                    PNG, JPG up to 5MB (Recommended: 1200x400px)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Placement & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="placement">Placement</Label>
              <Select
                value={formData.placement}
                onValueChange={(value: AdvertisementPlacement) =>
                  setFormData({ ...formData, placement: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="home_slider">Home Slider</SelectItem>
                  <SelectItem value="home_banner">Home Banner</SelectItem>
                  <SelectItem value="category_page">Category Page</SelectItem>
                  <SelectItem value="product_page">Product Page</SelectItem>
                  <SelectItem value="checkout">Checkout</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayOrder">Display Order</Label>
              <Input
                id="displayOrder"
                type="number"
                min="1"
                value={formData.displayOrder}
                onChange={(e) =>
                  setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 1 })
                }
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first
              </p>
            </div>
          </div>

          {/* Target URL */}
          <div className="space-y-2">
            <Label htmlFor="targetUrl">Target URL (Optional)</Label>
            <Input
              id="targetUrl"
              type="url"
              value={formData.targetUrl || ""}
              onChange={(e) =>
                setFormData({ ...formData, targetUrl: e.target.value })
              }
              placeholder="https://example.com/sale"
            />
            <p className="text-xs text-muted-foreground">
              Where users will be redirected when clicking the ad
            </p>
          </div>

          {/* Start & End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date (Optional)</Label>
              <Input
                id="startDate"
                type="datetime-local"
                value={
                  formData.startDate
                    ? formatDateTimeLocal(formData.startDate)
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="datetime-local"
                value={
                  formData.endDate
                    ? formatDateTimeLocal(formData.endDate)
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between space-x-2 pt-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Make this advertisement visible to customers
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
            >
              Cancel
            </Button>
            <Button type="submit">
              {advertisement ? "Update Advertisement" : "Create Advertisement"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
