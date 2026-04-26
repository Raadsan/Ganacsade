"use client"

import { useState, useEffect } from "react"
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
import { Separator } from "@/components/ui/separator"
import { Save, Upload, X, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { authApi } from "@/lib/api/auth"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [profilePicture, setProfilePicture] = useState("")
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [orderNotifications, setOrderNotifications] = useState(true)
  const [productNotifications, setProductNotifications] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true)
        const response = await authApi.getProfile()
        if (response.success && response.data) {
          const u: any = response.data
          setFirstName(u.first_name || u.firstName || "")
          setLastName(u.last_name || u.lastName || "")
          setEmail(u.email || "")
          setPhone(u.phone_number || u.phoneNumber || "")
        }
      } catch {
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePicture(reader.result as string)
      reader.readAsDataURL(file)
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

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await authApi.updateProfile({
        firstName,
        lastName,
        phoneNumber: phone,
      })
      if (response.success) {
        toast.success("Profile updated successfully")
      } else {
        toast.error(response.message || "Failed to update profile")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </div>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Profile Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              {profilePicture ? (
                <div className="relative inline-block">
                  <img src={profilePicture} alt="Profile" className="h-24 w-24 rounded-full object-cover" />
                  <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6" onClick={() => setProfilePicture("")}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center max-w-xs">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <Label htmlFor="profile-pic" className="cursor-pointer text-primary">Upload profile picture</Label>
                  <Input id="profile-pic" type="file" className="hidden" accept="image/*" onChange={handleProfilePictureUpload} />
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" disabled={loading} />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={email} disabled placeholder="your@email.com" />
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <Label>Phone Number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+252 61 234 5678" disabled={loading} />
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter current password" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm new password" />
              </div>
            </div>

            <Button onClick={handlePasswordChange} variant="outline" disabled={changingPassword}>
              {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
              </div>
              <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
            </div>
          </div>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
              </div>
              <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Order Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about new orders</p>
              </div>
              <Switch checked={orderNotifications} onCheckedChange={setOrderNotifications} />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label>Product Notifications</Label>
                <p className="text-sm text-muted-foreground">Get notified about low stock and product updates</p>
              </div>
              <Switch checked={productNotifications} onCheckedChange={setProductNotifications} />
            </div>
          </div>
        </Card>

        {/* Preferences */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preferences</h2>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="so">Somali</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Timezone</Label>
                <Select defaultValue="mogadishu">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mogadishu">Africa/Mogadishu (EAT)</SelectItem>
                    <SelectItem value="nairobi">Africa/Nairobi (EAT)</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date Format</Label>
              <Select defaultValue="dd/mm/yyyy">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                  <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                  <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
