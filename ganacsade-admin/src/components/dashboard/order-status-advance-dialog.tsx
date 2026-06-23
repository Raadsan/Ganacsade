"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

type DeliveryUser = {
  id?: string
  deliveryPersonId?: string
  deliveryPersonName?: string
  display_name?: string
  first_name?: string
  last_name?: string
  email?: string
}

export type OrderDeliveredAssignPayload = {
  assignmentType: "delivery" | "custom"
  deliveryPersonId?: string
  customContactName?: string
  customContactPhone?: string
  pickupTimeStart?: string
  pickupTimeEnd?: string
  description?: string
}

type OrderStatusAdvanceDialogProps = {
  open: boolean
  order: any | null
  deliveryUsers: DeliveryUser[]
  saving: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (payload: OrderDeliveredAssignPayload) => void
}

const getDeliveryUserLabel = (deliveryUser: DeliveryUser) =>
  deliveryUser.deliveryPersonName
  || deliveryUser.display_name
  || `${deliveryUser.first_name || ""} ${deliveryUser.last_name || ""}`.trim()
  || deliveryUser.email
  || "Delivery"

export function OrderStatusAdvanceDialog({
  open,
  order,
  deliveryUsers,
  saving,
  onOpenChange,
  onSubmit,
}: OrderStatusAdvanceDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"delivery" | "custom">("delivery")
  const [deliveryPersonId, setDeliveryPersonId] = useState("")
  const [customContactName, setCustomContactName] = useState("")
  const [customContactPhone, setCustomContactPhone] = useState("")
  const [pickupTimeStart, setPickupTimeStart] = useState("")
  const [pickupTimeEnd, setPickupTimeEnd] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (!open) return
    setAssignmentType("delivery")
    setDeliveryPersonId(order?.delivery_person_id || "")
    setCustomContactName("")
    setCustomContactPhone("")
    const startValue = order?.delivery_picked_up_at
      ? new Date(order.delivery_picked_up_at).toISOString().slice(0, 16)
      : ""
    const endValue = order?.estimated_delivery
      ? new Date(order.estimated_delivery).toISOString().slice(0, 16)
      : ""
    setPickupTimeStart(startValue)
    setPickupTimeEnd(endValue)
    setDescription("")
  }, [open, order?.id, order?.delivery_person_id, order?.delivery_picked_up_at, order?.estimated_delivery])

  const hasAssignee =
    assignmentType === "delivery"
      ? Boolean(deliveryPersonId)
      : Boolean(customContactName.trim() && customContactPhone.trim())

  const canSubmit = !saving && hasAssignee && pickupTimeStart && pickupTimeEnd

  const handleSubmit = () => {
    onSubmit({
      assignmentType,
      deliveryPersonId: assignmentType === "delivery" ? deliveryPersonId : undefined,
      customContactName: assignmentType === "custom" ? customContactName.trim() : undefined,
      customContactPhone: assignmentType === "custom" ? customContactPhone.trim() : undefined,
      pickupTimeStart,
      pickupTimeEnd,
      description: description.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign Pickup &amp; Mark Delivered</DialogTitle>
          <DialogDescription>
            {order?.order_number
              ? `Order ${order.order_number} — Dooro qofka qaadi doona alaabta iyo waqtiga ka hor inta aan la gudbin Delivered.`
              : "Complete the details below to mark this order as delivered."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs
            value={assignmentType}
            onValueChange={(value) => setAssignmentType(value as "delivery" | "custom")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="custom">Me</TabsTrigger>
            </TabsList>

            <TabsContent value="delivery" className="mt-4 space-y-2">
              <Label htmlFor="delivery-person">Delivery User *</Label>
              <Select value={deliveryPersonId} onValueChange={setDeliveryPersonId}>
                <SelectTrigger id="delivery-person">
                  <SelectValue placeholder="Dooro delivery user" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryUsers.map((deliveryUser) => (
                    <SelectItem
                      key={deliveryUser.deliveryPersonId || deliveryUser.id}
                      value={deliveryUser.deliveryPersonId || ""}
                    >
                      {getDeliveryUserLabel(deliveryUser)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Qofka delivery-ga ah ee systemka ku jira.
              </p>
            </TabsContent>

            <TabsContent value="custom" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="custom-name">Magaca *</Label>
                <Input
                  id="custom-name"
                  value={customContactName}
                  onChange={(event) => setCustomContactName(event.target.value)}
                  placeholder="Magaca qofka qaadi doona"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom-phone">Telefoon *</Label>
                <Input
                  id="custom-phone"
                  value={customContactPhone}
                  onChange={(event) => setCustomContactPhone(event.target.value)}
                  placeholder="61xxxxxxx"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Qof aan delivery user ahayn (tusaale macmiilka ama qof kale).
              </p>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="pickup-start">Pickup From *</Label>
              <Input
                id="pickup-start"
                type="datetime-local"
                value={pickupTimeStart}
                onChange={(event) => setPickupTimeStart(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pickup-end">Pickup Until *</Label>
              <Input
                id="pickup-end"
                type="datetime-local"
                value={pickupTimeEnd}
                onChange={(event) => setPickupTimeEnd(event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="advance-description">Description (optional)</Label>
            <Textarea
              id="advance-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Faahfaahin dheeraad ah..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Assign &amp; Mark Delivered
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
