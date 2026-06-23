"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import {
  deliveryPersonsApi,
  type DeliveryPerson,
} from "@/lib/api/delivery-persons"
import {
  DeliveryUserFormDialog,
  type DeliveryUserFormState,
} from "@/components/dashboard/deliveryUserFormDialog"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Eye, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const emptyForm: DeliveryUserFormState = {
  name: "",
  email: "",
  phone: "",
  password: "",
  vehicleType: "",
  vehicleNumber: "",
  licenseNumber: "",
  location: "",
  latitude: "",
  longitude: "",
  userPhotoUrl: "",
  vehiclePhotos: [],
  isAvailable: true,
  status: "active",
}

function getApiErrorMessage(error: unknown, fallback: string) {
  const err = error as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || fallback
}

export function DeliveryUsersCenter() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingUserPhoto, setUploadingUserPhoto] = useState(false)
  const [uploadingVehiclePhotos, setUploadingVehiclePhotos] = useState(false)
  const [records, setRecords] = useState<DeliveryPerson[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState("all")
  const [formOpen, setFormOpen] = useState(false)
  const [formMode, setFormMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<DeliveryUserFormState>(emptyForm)
  const [viewOpen, setViewOpen] = useState(false)
  const [viewRecord, setViewRecord] = useState<DeliveryPerson | null>(null)

  const loadRecords = async (filters?: {
    search?: string
    status?: string
    availability?: string
  }) => {
    try {
      setLoading(true)
      const response = await deliveryPersonsApi.getAll({
        search: filters?.search || undefined,
        status:
          !filters?.status || filters.status === "all"
            ? undefined
            : (filters.status as "active" | "inactive"),
        availability:
          !filters?.availability || filters.availability === "all"
            ? undefined
            : (filters.availability as "available" | "unavailable"),
      })
      setRecords(response.data || [])
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to load delivery users"))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadRecords()
  }, [])

  const openCreateForm = () => {
    setFormMode("create")
    setEditingId(null)
    setForm(emptyForm)
    setFormOpen(true)
  }

  const openEditForm = (record: DeliveryPerson) => {
    setFormMode("edit")
    setEditingId(record.id)
    setForm({
      name: record.name || "",
      email: record.email || "",
      phone: record.phone || "",
      password: "",
      vehicleType: record.vehicle_type || "",
      vehicleNumber: record.vehicle_number || "",
      licenseNumber: record.license_number || "",
      location: record.location || "",
      latitude: record.latitude != null ? String(record.latitude) : "",
      longitude: record.longitude != null ? String(record.longitude) : "",
      userPhotoUrl: record.user_photo_url || "",
      vehiclePhotos: record.vehicle_photos || [],
      isAvailable: record.is_available ?? true,
      status: record.users?.status || "active",
    })
    setFormOpen(true)
  }

  const closeForm = () => {
    setFormOpen(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleUserPhotoUpload = async (file?: File) => {
    if (!file) return
    try {
      setUploadingUserPhoto(true)
      const response = await deliveryPersonsApi.uploadUserPhoto(file)
      if (response.success && response.data?.imageUrl) {
        setForm((prev) => ({ ...prev, userPhotoUrl: response.data.imageUrl }))
        toast.success("Photo uploaded")
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload photo"))
    } finally {
      setUploadingUserPhoto(false)
    }
  }

  const handleVehiclePhotosUpload = async (files: FileList | null) => {
    if (!files?.length) return
    try {
      setUploadingVehiclePhotos(true)
      const response = await deliveryPersonsApi.uploadVehiclePhotos(Array.from(files))
      if (response.success && response.data?.imageUrls?.length) {
        setForm((prev) => ({
          ...prev,
          vehiclePhotos: [...prev.vehiclePhotos, ...response.data.imageUrls],
        }))
        toast.success("Vehicle photos uploaded")
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to upload vehicle photos"))
    } finally {
      setUploadingVehiclePhotos(false)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      toast.error("Name, email, and phone are required")
      return
    }
    if (formMode === "create" && !form.password.trim()) {
      toast.error("Password is required")
      return
    }

    try {
      setSaving(true)
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password.trim() || undefined,
        vehicleType: form.vehicleType || undefined,
        vehicleNumber: form.vehicleNumber.trim() || undefined,
        licenseNumber: form.licenseNumber.trim() || undefined,
        location: form.location.trim() || undefined,
        userPhotoUrl: form.userPhotoUrl || undefined,
        vehiclePhotos: form.vehiclePhotos,
        isAvailable: form.isAvailable,
        status: form.status,
      }

      if (formMode === "create") {
        await deliveryPersonsApi.create(payload)
        toast.success("Delivery user registered")
      } else if (editingId) {
        await deliveryPersonsApi.update(editingId, payload)
        toast.success("Delivery user updated")
      }

      closeForm()
      await loadRecords({ search, status: statusFilter, availability: availabilityFilter })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save delivery user"))
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (id: string) => {
    if (!confirm("Deactivate this delivery user?")) return
    try {
      await deliveryPersonsApi.remove(id)
      toast.success("Delivery user deactivated")
      await loadRecords({ search, status: statusFilter, availability: availabilityFilter })
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to deactivate"))
    }
  }

  const openViewDialog = (record: DeliveryPerson) => {
    setViewRecord(record)
    setViewOpen(true)
  }

  const closeViewDialog = () => {
    setViewOpen(false)
    setViewRecord(null)
  }

  const getCarName = (record: DeliveryPerson) => {
    const type = record.vehicle_type
      ? record.vehicle_type.charAt(0).toUpperCase() + record.vehicle_type.slice(1)
      : ""
    const plate = record.vehicle_number?.trim()
    if (type && plate) return `${type} · ${plate}`
    return type || plate || "—"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Delivery Users</h1>
          <p className="text-muted-foreground">
            Register delivery staff here. Role is loaded from backend (`delivery` role).
          </p>
        </div>
        <Button onClick={openCreateForm}>
          <Plus className="mr-2 h-4 w-4" />
          Add Delivery User
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name, email, phone, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Availability" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="available">Available</SelectItem>
              <SelectItem value="unavailable">Unavailable</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => loadRecords({ search, status: statusFilter, availability: availabilityFilter })}>
            Filter
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setSearch("")
              setStatusFilter("all")
              setAvailabilityFilter("all")
              loadRecords()
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Car Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                  Loading...
                </TableCell>
              </TableRow>
            ) : records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                  No delivery users found
                </TableCell>
              </TableRow>
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">{record.name}</TableCell>
                  <TableCell>
                    <p className="text-sm">{record.email}</p>
                    <p className="text-xs text-muted-foreground">{record.phone}</p>
                  </TableCell>
                  <TableCell className="text-sm">{record.location || "—"}</TableCell>
                  <TableCell className="text-sm">{getCarName(record)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={record.is_active ? "default" : "secondary"}>
                        {record.is_active ? "active" : "inactive"}
                      </Badge>
                      <Badge variant={record.is_available ? "default" : "outline"}>
                        {record.is_available ? "available" : "unavailable"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        title="View details"
                        onClick={() => openViewDialog(record)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        title="Edit"
                        onClick={() => openEditForm(record)}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        title="Deactivate"
                        onClick={() => handleDeactivate(record.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <DeliveryUserFormDialog
        open={formOpen}
        mode={formMode}
        form={form}
        saving={saving}
        uploadingUserPhoto={uploadingUserPhoto}
        uploadingVehiclePhotos={uploadingVehiclePhotos}
        onOpenChange={(open) => !open && closeForm()}
        onChange={setForm}
        onSave={handleSave}
        onUserPhotoUpload={handleUserPhotoUpload}
        onVehiclePhotosUpload={handleVehiclePhotosUpload}
        onRemoveVehiclePhoto={(url) =>
          setForm((prev) => ({
            ...prev,
            vehiclePhotos: prev.vehiclePhotos.filter((photo) => photo !== url),
          }))
        }
      />

      <Dialog open={viewOpen} onOpenChange={(open) => (open ? setViewOpen(true) : closeViewDialog())}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery User Details</DialogTitle>
          </DialogHeader>
          {viewRecord ? (
            <div className="space-y-5 text-sm">
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-muted">
                  {viewRecord.user_photo_url ? (
                    <Image
                      src={viewRecord.user_photo_url}
                      alt={viewRecord.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-semibold text-muted-foreground">
                      {viewRecord.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold">{viewRecord.name}</p>
                  <p className="text-muted-foreground">
                    {viewRecord.total_deliveries || 0} deliveries completed
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-medium">{viewRecord.email}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewRecord.phone}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">{viewRecord.location || "—"}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Car Name</p>
                  <p className="font-medium">{getCarName(viewRecord)}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">License Number</p>
                  <p className="font-medium">{viewRecord.license_number || "—"}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Rating</p>
                  <p className="font-medium">{viewRecord.rating ?? "—"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant={viewRecord.is_active ? "default" : "secondary"}>
                  {viewRecord.is_active ? "active" : "inactive"}
                </Badge>
                <Badge variant={viewRecord.is_available ? "default" : "outline"}>
                  {viewRecord.is_available ? "available" : "unavailable"}
                </Badge>
                {viewRecord.users?.status ? (
                  <Badge variant="outline">Account: {viewRecord.users.status}</Badge>
                ) : null}
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Current Assignments</p>
                  <p className="font-medium">{viewRecord.current_assignments ?? 0}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Total Deliveries</p>
                  <p className="font-medium">{viewRecord.total_deliveries ?? 0}</p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Last Login</p>
                  <p className="font-medium">
                    {viewRecord.users?.last_login_at
                      ? formatDate(viewRecord.users.last_login_at)
                      : "Never"}
                  </p>
                </div>
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Registered</p>
                  <p className="font-medium">
                    {viewRecord.created_at ? formatDate(viewRecord.created_at) : "—"}
                  </p>
                </div>
              </div>

              {(viewRecord.latitude != null || viewRecord.longitude != null) ? (
                <div className="rounded-md border p-3">
                  <p className="text-xs text-muted-foreground">Coordinates</p>
                  <p className="font-medium">
                    {viewRecord.latitude ?? "—"}, {viewRecord.longitude ?? "—"}
                  </p>
                </div>
              ) : null}

              <div>
                <p className="mb-2 font-medium">Vehicle Photos</p>
                {(viewRecord.vehicle_photos?.length || 0) > 0 ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {viewRecord.vehicle_photos?.map((photo) => (
                      <div key={photo} className="relative aspect-video overflow-hidden rounded-md border">
                        <Image src={photo} alt="Vehicle" fill className="object-cover" unoptimized />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No vehicle photos.</p>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeViewDialog}>
                  Close
                </Button>
                <Button
                  onClick={() => {
                    closeViewDialog()
                    openEditForm(viewRecord)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
