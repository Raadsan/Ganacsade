"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Save, Upload } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"
import { isDeliveryUser as checkIsDeliveryUser } from "@/lib/auth/roles"

const vehicleTypes = [
  { value: "motorcycle", label: "Motorcycle" },
  { value: "car", label: "Car" },
  { value: "bicycle", label: "Bicycle" },
  { value: "on_foot", label: "On Foot" },
]

export default function ProfilePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)
  const [isDeliveryProfile, setIsDeliveryProfile] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [preferredLanguage, setPreferredLanguage] = useState("en")
  const [profilePicture, setProfilePicture] = useState("")
  const [vehicleType, setVehicleType] = useState("")
  const [vehicleNumber, setVehicleNumber] = useState("")
  const [licenseNumber, setLicenseNumber] = useState("")
  const [isAvailable, setIsAvailable] = useState(true)
  const [totalDeliveries, setTotalDeliveries] = useState(0)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const applyUserToForm = (user: Record<string, any>) => {
    setFirstName(user.first_name || user.firstName || "")
    setLastName(user.last_name || user.lastName || "")
    setDisplayName(user.display_name || user.displayName || "")
    setEmail(user.email || "")
    setPhone(user.phone_number || user.phoneNumber || "")
    setPreferredLanguage(user.preferred_language || "en")
    setProfilePicture(user.profile_image_url || user.profileImageUrl || "")
  }

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)

        const currentUser = authApi.getCurrentUser()

        if (checkIsDeliveryUser(currentUser)) {
          try {
            const deliveryResponse = await authApi.getDeliveryProfile()
            if (deliveryResponse.success && deliveryResponse.data) {
              setIsDeliveryProfile(true)
              const user = deliveryResponse.data.user
              const delivery = deliveryResponse.data.delivery
              setFirstName(user.first_name || "")
              setLastName(user.last_name || "")
              setDisplayName(user.display_name || "")
              setEmail(user.email || "")
              setPhone(user.phone_number || "")
              setPreferredLanguage(user.preferred_language || "en")
              setProfilePicture(user.profile_image_url || "")
              setVehicleType(delivery?.vehicle_type || "")
              setVehicleNumber(delivery?.vehicle_number || "")
              setLicenseNumber(delivery?.license_number || "")
              setIsAvailable(delivery?.is_available ?? true)
              setTotalDeliveries(deliveryResponse.data.stats?.totalDeliveries || 0)
              return
            }
          } catch (err: any) {
            if (err?.response?.status !== 403) {
              throw err
            }
          }
        }

        setIsDeliveryProfile(false)
        const response = await authApi.getProfile()
        if (response.success && response.data) {
          applyUserToForm(response.data)
        }
      } catch {
        const fallbackUser = authApi.getCurrentUser()
        if (fallbackUser) {
          applyUserToForm(fallbackUser)
        } else {
          toast.error("Failed to load profile")
        }
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setUploadingImage(true)
      const response = await authApi.uploadProfileImage(file)
      if (response.success && response.data?.profileImageUrl) {
        setProfilePicture(response.data.profileImageUrl)
        toast.success("Profile picture updated")
      } else {
        toast.error(response.message || "Failed to upload profile picture")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to upload profile picture")
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        firstName,
        lastName,
        displayName,
        phoneNumber: phone,
        preferredLanguage,
      }

      const response = isDeliveryProfile
        ? await authApi.updateDeliveryProfile({
            ...payload,
            vehicleType: vehicleType || null,
            vehicleNumber,
            licenseNumber,
            isAvailable,
          })
        : await authApi.updateProfile(payload)

      if (response.success) {
        toast.success("Profile updated successfully")
        const currentUser = authApi.getCurrentUser()
        if (currentUser && typeof window !== "undefined") {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              firstName,
              lastName,
              phoneNumber: phone,
            })
          )
        }
      } else {
        toast.error(response.message || "Failed to update profile")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async () => {
    if (!currentPassword) {
      toast.error("Enter your current password")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setChangingPassword(true)
      const response = await authApi.changePassword({ currentPassword, newPassword })
      if (response.success) {
        toast.success("Password updated successfully")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(response.message || "Failed to update password")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update password")
    } finally {
      setChangingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{isDeliveryProfile ? "My Profile" : "Profile"}</h1>
          <p className="text-muted-foreground">
            {isDeliveryProfile
              ? "Update your personal and delivery information"
              : "Manage your account information"}
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {isDeliveryProfile ? (
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Total completed deliveries</p>
          <p className="text-2xl font-semibold">{totalDeliveries}</p>
        </Card>
      ) : null}

      <div className="grid gap-6">
        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Personal Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-center gap-4">
                {profilePicture ? (
                  <img src={profilePicture} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <Label htmlFor="profile-pic" className="cursor-pointer text-primary">
                    {uploadingImage ? "Uploading..." : "Change photo"}
                  </Label>
                  <Input
                    id="profile-pic"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    disabled={uploadingImage || loading}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={loading} />
            </div>

            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={preferredLanguage} onValueChange={setPreferredLanguage}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="so">Somali</SelectItem>
                  <SelectItem value="ar">Arabic</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {isDeliveryProfile ? (
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">Delivery Details</h2>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Vehicle Type</Label>
                  <Select value={vehicleType || "none"} onValueChange={(value) => setVehicleType(value === "none" ? "" : value)}>
                    <SelectTrigger><SelectValue placeholder="Select vehicle type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Not set</SelectItem>
                      {vehicleTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Number</Label>
                  <Input value={vehicleNumber} onChange={(e) => setVehicleNumber(e.target.value)} disabled={loading} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>License Number</Label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} disabled={loading} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Available for Delivery</Label>
                  <p className="text-sm text-muted-foreground">Turn off when you are not available to receive new orders</p>
                </div>
                <Switch checked={isAvailable} onCheckedChange={setIsAvailable} />
              </div>
            </div>
          </Card>
        ) : null}

        <Card className="p-6">
          <h2 className="mb-4 text-xl font-semibold">Security</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </div>
            <Button onClick={handlePasswordChange} variant="outline" disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
