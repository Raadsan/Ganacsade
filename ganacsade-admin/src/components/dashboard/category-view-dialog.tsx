"use client"

import { useEffect, useState } from "react"
import { Category, Subcategory } from "@/types"
import { productsApi } from "@/lib/api/products"
import { subcategoriesApi } from "@/lib/api/subcategories"
import { resolveImageUrl } from "@/lib/utils/image-url"
import { formatCurrency } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ArrowLeft,
  ChevronRight,
  FolderTree,
  Image as ImageIcon,
  Package,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"

interface CategoryViewDialogProps {
  category: Category | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubcategoryDeleted?: (categoryId: string, subcategoryId: string) => void
}

interface CategoryProduct {
  id: string
  name: string
  sku: string
  price: number
  stockQuantity: number
  status: string
  image?: string | null
}

export function CategoryViewDialog({
  category,
  open,
  onOpenChange,
  onSubcategoryDeleted,
}: CategoryViewDialogProps) {
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [products, setProducts] = useState<CategoryProduct[]>([])
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [localSubcategories, setLocalSubcategories] = useState<Subcategory[]>([])

  useEffect(() => {
    if (!open) {
      setSelectedSubcategory(null)
      setProducts([])
      setLocalSubcategories([])
    } else if (category?.subcategories) {
      setLocalSubcategories(category.subcategories)
    }
  }, [open, category])

  useEffect(() => {
    async function fetchProducts() {
      if (!open || !category) return
      if (!selectedSubcategory && (category.subcategories?.length ?? 0) > 0) {
        setProducts([])
        return
      }

      try {
        setLoadingProducts(true)
        const response = await productsApi.getProducts({
          category: category.id,
          subcategory: selectedSubcategory?.id,
          limit: 200,
        })

        const rows = (response.data || []) as any[]
        setProducts(
          rows.map((p) => ({
            id: p.id,
            name: p.name_en || p.name || "Untitled",
            sku: p.sku || "-",
            price: parseFloat(p.price?.toString() || "0"),
            stockQuantity: p.stock_quantity ?? p.stockQuantity ?? 0,
            status: p.status || "inactive",
            image: resolveImageUrl(p.primary_image || p.images?.[0]),
          }))
        )
      } catch {
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [open, category, selectedSubcategory])

  if (!category) return null

  const subcategories = localSubcategories
  const showingProducts = Boolean(selectedSubcategory) || subcategories.length === 0

  const handleDeleteSubcategory = async (sub: Subcategory) => {
    if (sub.productCount > 0) {
      toast.error(
        `Cannot delete "${sub.name}" — it has ${sub.productCount} active product(s). Remove or move products first.`
      )
      return
    }

    if (!confirm(`Delete subcategory "${sub.name}"?`)) return

    try {
      setDeletingId(sub.id)
      const response = await subcategoriesApi.deleteSubcategory(sub.id)
      if (response.success) {
        toast.success("Subcategory deleted successfully")
        setLocalSubcategories((prev) => prev.filter((s) => s.id !== sub.id))
        if (selectedSubcategory?.id === sub.id) {
          setSelectedSubcategory(null)
        }
        onSubcategoryDeleted?.(category.id, sub.id)
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to delete subcategory")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {selectedSubcategory
              ? selectedSubcategory.name
              : category.name}
          </DialogTitle>
          <DialogDescription>
            {selectedSubcategory
              ? `${selectedSubcategory.productCount} product${selectedSubcategory.productCount === 1 ? "" : "s"} in this subcategory`
              : subcategories.length > 0
                ? `${subcategories.length} subcategor${subcategories.length === 1 ? "y" : "ies"} — click one to view its products`
                : "No subcategories. Showing products in this category."}
          </DialogDescription>
        </DialogHeader>

        {selectedSubcategory && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-fit"
            onClick={() => setSelectedSubcategory(null)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to subcategories
          </Button>
        )}

        {!showingProducts ? (
          <div className="space-y-2">
            {subcategories.length === 0 ? (
              <p className="py-6 text-center text-muted-foreground">
                No subcategories in this category
              </p>
            ) : (
              subcategories.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 rounded-lg border p-3"
                >
                  <button
                    type="button"
                    onClick={() => setSelectedSubcategory(sub)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-80"
                  >
                    {sub.image ? (
                      <img
                        src={sub.image}
                        alt={sub.name}
                        className="h-12 w-12 rounded-md object-cover"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                        <FolderTree className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{sub.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {sub.description || "Subcategory"}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {sub.productCount} product{sub.productCount === 1 ? "" : "s"}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={deletingId === sub.id}
                    title={
                      sub.productCount > 0
                        ? "Remove all products before deleting"
                        : "Delete subcategory"
                    }
                    onClick={() => handleDeleteSubcategory(sub)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : loadingProducts ? (
          <p className="py-8 text-center text-muted-foreground">Loading products...</p>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
            <Package className="mb-3 h-10 w-10" />
            <p>No products in this {selectedSubcategory ? "subcategory" : "category"}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 rounded-lg border p-3"
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-12 w-12 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatCurrency(product.price)}</p>
                  <p className="text-xs text-muted-foreground">
                    Stock: {product.stockQuantity}
                  </p>
                </div>
                <Badge variant={product.status === "active" ? "success" : "secondary"}>
                  {product.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
