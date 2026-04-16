"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Save, Loader2, DollarSign, Truck, Receipt } from "lucide-react"
import { toast } from "sonner"

interface Setting {
  id: string
  key: string
  value: string | number | boolean | { amount?: string | number; value?: string | number; [key: string]: any }
  description: string
  category: string
  data_type: string
}

export default function StoreSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  // Shipping settings
  const [shippingFlatRate, setShippingFlatRate] = useState("5.99")
  const [shippingFreeThreshold, setShippingFreeThreshold] = useState("50.00")
  
  // Tax settings
  const [taxRate, setTaxRate] = useState("0.08")
  const [taxEnabled, setTaxEnabled] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      const response = await fetch('http://localhost:5000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) throw new Error('Failed to fetch settings')

      const data = await response.json()
      
      if (data.success && data.data.settings) {
        data.data.settings.forEach((setting: Setting) => {
          // Extract value from JSONB object if needed
          let value = setting.value
          if (typeof value === 'object' && value !== null) {
            // If it's a JSONB object like {amount: "5.99"}, extract the value
            value = value.amount || value.value || JSON.stringify(value)
          }
          
          switch (setting.key) {
            case 'shipping_flat_rate':
              setShippingFlatRate(typeof value === 'string' ? value : String(value))
              break
            case 'shipping_free_threshold':
              setShippingFreeThreshold(typeof value === 'string' ? value : String(value))
              break
            case 'tax_rate':
              setTaxRate(typeof value === 'string' ? value : String(value))
              break
            case 'tax_enabled':
              setTaxEnabled(value === 'true' || value === true)
              break
          }
        })
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const updateSetting = async (key: string, value: string) => {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`http://localhost:5000/api/admin/settings/${key}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ value })
    })

    if (!response.ok) throw new Error(`Failed to update ${key}`)
    
    return response.json()
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      // Validate inputs
      const flatRate = parseFloat(shippingFlatRate)
      const freeThreshold = parseFloat(shippingFreeThreshold)
      const rate = parseFloat(taxRate)

      if (isNaN(flatRate) || flatRate < 0) {
        toast.error('Invalid shipping flat rate')
        return
      }

      if (isNaN(freeThreshold) || freeThreshold < 0) {
        toast.error('Invalid free shipping threshold')
        return
      }

      if (isNaN(rate) || rate < 0 || rate > 1) {
        toast.error('Tax rate must be between 0 and 1 (e.g., 0.08 for 8%)')
        return
      }

      // Update all settings
      await Promise.all([
        updateSetting('shipping_flat_rate', shippingFlatRate),
        updateSetting('shipping_free_threshold', shippingFreeThreshold),
        updateSetting('tax_rate', taxRate),
        updateSetting('tax_enabled', taxEnabled.toString())
      ])

      toast.success('Store settings updated successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Store Settings</h1>
          <p className="text-muted-foreground">Manage shipping and tax configuration</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Shipping Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Shipping Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="shipping-flat-rate">Flat Rate Shipping Cost ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shipping-flat-rate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingFlatRate}
                    onChange={(e) => setShippingFlatRate(e.target.value)}
                    className="pl-9"
                    placeholder="5.99"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Standard shipping cost applied to orders
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipping-free-threshold">Free Shipping Threshold ($)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="shipping-free-threshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingFreeThreshold}
                    onChange={(e) => setShippingFreeThreshold(e.target.value)}
                    className="pl-9"
                    placeholder="50.00"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Minimum order amount for free shipping
                </p>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>How it works:</strong> Orders below ${shippingFreeThreshold} will be charged ${shippingFlatRate} for shipping. 
                Orders at or above ${shippingFreeThreshold} get free shipping.
              </p>
            </div>
          </div>
        </Card>

        {/* Tax Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Receipt className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Tax Settings</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Tax Calculation</Label>
                <p className="text-sm text-muted-foreground">Apply tax to customer orders</p>
              </div>
              <Switch checked={taxEnabled} onCheckedChange={setTaxEnabled} />
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (Decimal)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0.08"
                disabled={!taxEnabled}
              />
              <p className="text-sm text-muted-foreground">
                Enter as decimal (e.g., 0.08 for 8%, 0.15 for 15%)
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                <strong>Current tax rate:</strong> {(parseFloat(taxRate) * 100).toFixed(2)}%
                {!taxEnabled && <span className="ml-2 text-orange-600">(Tax calculation is disabled)</span>}
              </p>
            </div>
          </div>
        </Card>

        {/* Preview Calculation */}
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
          <h2 className="text-xl font-semibold mb-4">Example Calculation</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Order Subtotal:</span>
              <span className="font-medium">$25.00</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Shipping:</span>
              <span className="font-medium">
                {parseFloat(shippingFreeThreshold) <= 25 ? 'FREE' : `$${shippingFlatRate}`}
              </span>
            </div>
            {taxEnabled && (
              <div className="flex justify-between text-sm">
                <span>Tax ({(parseFloat(taxRate) * 100).toFixed(2)}%):</span>
                <span className="font-medium">${(25 * parseFloat(taxRate)).toFixed(2)}</span>
              </div>
            )}
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total:</span>
              <span className="text-primary">
                ${(
                  25 + 
                  (parseFloat(shippingFreeThreshold) <= 25 ? 0 : parseFloat(shippingFlatRate)) + 
                  (taxEnabled ? 25 * parseFloat(taxRate) : 0)
                ).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
