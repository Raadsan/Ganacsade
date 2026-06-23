"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Upload, X } from "lucide-react"

const vehicleTypes = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "bicycle", label: "Bicycle" },
  { value: "on_foot", label: "On Foot" },
]

export type DeliveryUserFormState = {
  name: string
  email: string
  phone: string
  password: string
  vehicleType: string
  vehicleNumber: string
  licenseNumber: string
  location: string
  latitude: string
  longitude: string
  userPhotoUrl: string
  vehiclePhotos: string[]
  isAvailable: boolean
  status: string
}

type DeliveryUserFormDialogProps = {
  open: boolean
  mode: "create" | "edit"
  form: DeliveryUserFormState
  saving: boolean
  uploadingUserPhoto: boolean
  uploadingVehiclePhotos: boolean
  onOpenChange: (open: boolean) => void
  onChange: (form: DeliveryUserFormState) => void
  onSave: () => void
  onUserPhotoUpload: (file?: File) => void
  onVehiclePhotosUpload: (files: FileList | null) => void
  onRemoveVehiclePhoto: (url: string) => void
}

export function DeliveryUserFormDialog({
  open,
  mode,
  form,
  saving,
  uploadingUserPhoto,
  uploadingVehiclePhotos,
  onOpenChange,
  onChange,
  onSave,
  onUserPhotoUpload,
  onVehiclePhotosUpload,
  onRemoveVehiclePhoto,
}: DeliveryUserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Register Delivery User" : "Edit Delivery User"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Full Name</Label>
            <Input
              value={form.name}
              onChange={(e) => onChange({ ...form, name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={form.email}
              onChange={(e) => onChange({ ...form, email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Phone</Label>
            <Input
              value={form.phone}
              onChange={(e) => onChange({ ...form, phone: e.target.value })}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label>{mode === "create" ? "Password" : "New Password (optional)"}</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => onChange({ ...form, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Vehicle Type</Label>
            <Select
              value={form.vehicleType}
              onValueChange={(value) => onChange({ ...form, vehicleType: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Vehicle Number</Label>
            <Input
              value={form.vehicleNumber}
              onChange={(e) => onChange({ ...form, vehicleNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>License Number</Label>
            <Input
              value={form.licenseNumber}
              onChange={(e) => onChange({ ...form, licenseNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => onChange({ ...form, location: e.target.value })}
              placeholder="Area or address"
            />
          </div>
          {mode === "edit" ? (
            <div className="space-y-2">
              <Label>Account Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => onChange({ ...form, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">active</SelectItem>
                  <SelectItem value="inactive">inactive</SelectItem>
                  <SelectItem value="suspended">suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
          <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2">
            <div>
              <Label>Available for delivery</Label>
              <p className="text-xs text-muted-foreground">Show in order assignment list</p>
            </div>
            <Switch
              checked={form.isAvailable}
              onCheckedChange={(checked) => onChange({ ...form, isAvailable: checked })}
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>User Photo</Label>
            <div className="flex flex-wrap items-center gap-3">
              {form.userPhotoUrl ? (
                <div className="relative h-16 w-16 overflow-hidden rounded-full border">
                  <Image
                    src={form.userPhotoUrl}
                    alt="User"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : null}
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm">
                {uploadingUserPhoto ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUserPhotoUpload(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Vehicle Photos</Label>
            <div className="flex flex-wrap gap-2">
              {form.vehiclePhotos.map((photo) => (
                <div key={photo} className="relative h-16 w-20 overflow-hidden rounded-md border">
                  <Image src={photo} alt="Vehicle" fill className="object-cover" unoptimized />
                  <button
                    type="button"
                    className="absolute right-0.5 top-0.5 rounded-full bg-background/90 p-0.5"
                    onClick={() => onRemoveVehiclePhoto(photo)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <label className="flex h-16 w-20 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed text-[10px] text-muted-foreground">
                {uploadingVehiclePhotos ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Add
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onVehiclePhotosUpload(e.target.files)}
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {mode === "create" ? "Register" : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
