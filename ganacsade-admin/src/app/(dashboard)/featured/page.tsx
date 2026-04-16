"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, MoreVertical, Trash2, MoveUp, MoveDown, Eye } from "lucide-react"
import { formatDate, formatCurrency } from "@/lib/utils"

// Mock data
const mockFeaturedProducts = [
  {
    id: "1",
    productId: "prod-1",
    productName: "Wireless Headphones Pro",
    productImage: "/products/headphones.jpg",
    price: 299.99,
    priority: 1,
    startDate: new Date("2024-10-01"),
    endDate: new Date("2024-12-31"),
    isActive: true,
  },
  {
    id: "2",
    productId: "prod-2",
    productName: "Smart Watch Ultra",
    productImage: "/products/smartwatch.jpg",
    price: 499.99,
    priority: 2,
    startDate: new Date("2024-10-15"),
    endDate: new Date("2024-11-30"),
    isActive: true,
  },
  {
    id: "3",
    productId: "prod-3",
    productName: "Premium Backpack",
    productImage: "/products/backpack.jpg",
    price: 89.99,
    priority: 3,
    startDate: new Date("2024-10-01"),
    endDate: null,
    isActive: true,
  },
]

export default function FeaturedProductsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Featured Products</h1>
          <p className="text-muted-foreground">
            Manage products displayed on the homepage
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Featured Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Featured Product</DialogTitle>
              <DialogDescription>
                Select a product to feature on the homepage
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Select Product</Label>
                <Input placeholder="Search for a product..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>End Date (Optional)</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Priority Order</Label>
                <Input type="number" min="1" placeholder="1" />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Add Featured
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Active Featured</p>
            <p className="text-2xl font-bold">3</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Total Views</p>
            <p className="text-2xl font-bold">15,234</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Click Rate</p>
            <p className="text-2xl font-bold">12.4%</p>
          </div>
        </Card>
      </div>

      {/* Featured Products Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Order</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockFeaturedProducts.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoveUp className="h-3 w-3" />
                    </Button>
                    <span className="text-center text-sm font-medium">
                      {item.priority}
                    </span>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoveDown className="h-3 w-3" />
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                      <span className="text-xs">IMG</span>
                    </div>
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">
                        ID: {item.productId}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {formatCurrency(item.price)}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <p className="text-sm">
                      {formatDate(item.startDate)} →
                    </p>
                    <p className="text-sm">
                      {item.endDate ? formatDate(item.endDate) : "No end date"}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {item.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}
