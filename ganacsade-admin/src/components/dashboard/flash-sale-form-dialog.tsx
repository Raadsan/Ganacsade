"use client"

import { useState, useEffect } from "react"
import { FlashSale, CreateFlashSaleDto } from "@/types"
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
import { toast } from "sonner"

interface FlashSaleFormDialogProps {
  flashSale: FlashSale | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (flashSale: CreateFlashSaleDto) => void
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

export function FlashSaleFormDialog({
  flashSale,
  open,
  onOpenChange,
  onSave,
}: FlashSaleFormDialogProps) {
  const [formData, setFormData] = useState<CreateFlashSaleDto>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    isActive: true,
  })

  useEffect(() => {
    if (flashSale) {
      setFormData({
        title: flashSale.title,
        description: flashSale.description,
        startTime: flashSale.startTime,
        endTime: flashSale.endTime,
        isActive: flashSale.isActive,
      })
    } else {
      setFormData({
        title: "",
        description: "",
        startTime: "",
        endTime: "",
        isActive: true,
      })
    }
  }, [flashSale, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      toast.error("Flash sale title is required")
      return
    }
    if (!formData.startTime) {
      toast.error("Start time is required")
      return
    }
    if (!formData.endTime) {
      toast.error("End time is required")
      return
    }

    const start = new Date(formData.startTime)
    const end = new Date(formData.endTime)

    if (end <= start) {
      toast.error("End time must be after start time")
      return
    }

    onSave(formData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {flashSale ? "Edit Flash Sale" : "Create New Flash Sale"}
          </DialogTitle>
          <DialogDescription>
            {flashSale
              ? "Update flash sale information"
              : "Create a new time-limited flash sale"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Flash Sale Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="e.g., Weekend Super Sale, Black Friday"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your flash sale..."
              rows={3}
            />
          </div>

          {/* Start & End Time */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">
                Start Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={
                  formData.startTime
                    ? formatDateTimeLocal(formData.startTime)
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">
                End Time <span className="text-red-500">*</span>
              </Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={
                  formData.endTime
                    ? formatDateTimeLocal(formData.endTime)
                    : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
                required
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between space-x-2 pt-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="isActive">Active Status</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable this flash sale
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
              {flashSale ? "Update Flash Sale" : "Create Flash Sale"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
