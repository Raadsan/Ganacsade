"use client"

import { useState, useEffect, Fragment } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Plus, Search, MoreVertical, Edit, Trash2, FolderTree, Image as ImageIcon, Eye } from "lucide-react"
import { Category, CreateCategoryDto, Subcategory, CreateSubcategoryDto } from "@/types"
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog"
import { SubcategoryFormDialog } from "@/components/dashboard/subcategory-form-dialog"
import { CategoryViewDialog } from "@/components/dashboard/category-view-dialog"
import { categoriesApi } from "@/lib/api/categories"
import { subcategoriesApi } from "@/lib/api/subcategories"
import { toast } from "sonner"
import { resolveImageUrl } from "@/lib/utils/image-url"

function mapSubcategoryFromApi(sub: any): Subcategory {
  return {
    id: sub.id,
    categoryId: sub.category_id || sub.categoryId,
    name: sub.name_en || sub.name,
    description: sub.description_en || sub.description || "",
    image: resolveImageUrl(sub.image_url) || undefined,
    isActive: sub.is_active ?? sub.isActive ?? true,
    productCount: sub.product_count || 0,
  }
}

function mapCategoryFromApi(cat: any, subcategories: Subcategory[] = []): Category {
  return {
    id: cat.id,
    name: cat.name_en || cat.name,
    description: cat.description_en || cat.description || "",
    image: resolveImageUrl(cat.image_url) || undefined,
    productCount: cat.product_count || 0,
    isActive: cat.is_active ?? cat.isActive ?? true,
    subcategories,
  }
}

async function fetchCategoryWithSubs(cat: any): Promise<Category> {
  try {
    const subsResponse = await subcategoriesApi.getSubcategories(cat.id)
    const subs =
      subsResponse.success && subsResponse.data
        ? subsResponse.data.map(mapSubcategoryFromApi)
        : []
    return mapCategoryFromApi(cat, subs)
  } catch {
    return mapCategoryFromApi(cat, [])
  }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [viewCategory, setViewCategory] = useState<Category | null>(null)
  const [isViewOpen, setIsViewOpen] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Subcategory state
  const [selectedSubcategory, setSelectedSubcategory] = useState<Subcategory | null>(null)
  const [isSubcategoryFormOpen, setIsSubcategoryFormOpen] = useState(false)
  const [subcategoryParentId, setSubcategoryParentId] = useState<string>("")
  const [subcategoryParentName, setSubcategoryParentName] = useState<string>("")

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async (options?: { silent?: boolean }) => {
    const silent = options?.silent ?? false
    try {
      if (!silent) setLoading(true)
      const response = await categoriesApi.getCategories()
      if (response.success && response.data) {
        const categoriesWithSubs = await Promise.all(
          response.data.map((cat: any) => fetchCategoryWithSubs(cat))
        )
        setCategories(categoriesWithSubs)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      if (!silent) toast.error("Failed to load categories")
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const syncViewCategory = (categoryId: string, updater: (cat: Category) => Category) => {
    setViewCategory((prev) =>
      prev && prev.id === categoryId ? updater(prev) : prev
    )
  }

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddCategory = () => {
    setSelectedCategory(null)
    setIsFormOpen(true)
  }

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category)
    setIsFormOpen(true)
  }

  const handleViewCategory = (category: Category) => {
    setViewCategory(category)
    setIsViewOpen(true)
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will affect all products in this category.")) {
      try {
        const response = await categoriesApi.deleteCategory(id)
        if (response.success) {
          setCategories((prev) => prev.filter((c) => c.id !== id))
          setExpandedCategories((prev) => {
            const next = new Set(prev)
            next.delete(id)
            return next
          })
          if (viewCategory?.id === id) {
            setIsViewOpen(false)
            setViewCategory(null)
          }
          toast.success("Category deleted successfully")
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to delete category"
        toast.error(errorMessage)
      }
    }
  }

  const handleSaveCategory = async (categoryData: CreateCategoryDto) => {
    try {
      if (selectedCategory) {
        const response = await categoriesApi.updateCategory(selectedCategory.id, categoryData)
        if (response.success) {
          const data = response.data as any
          const payload = categoryData as any
          const updated = mapCategoryFromApi(
            {
              ...data,
              id: selectedCategory.id,
              name_en: data?.name_en ?? payload.nameEn ?? selectedCategory.name,
              description_en:
                data?.description_en ?? payload.descriptionEn ?? selectedCategory.description,
              image_url: data?.image_url ?? payload.imageUrl ?? selectedCategory.image,
              is_active: data?.is_active ?? payload.isActive ?? selectedCategory.isActive,
              product_count: selectedCategory.productCount,
            },
            selectedCategory.subcategories ?? []
          )
          setCategories((prev) =>
            prev.map((c) => (c.id === selectedCategory.id ? updated : c))
          )
          syncViewCategory(selectedCategory.id, () => updated)
          toast.success("Category updated successfully")
          setIsFormOpen(false)
        }
      } else {
        const response = await categoriesApi.createCategory(categoryData)
        if (response.success && response.data) {
          const created = mapCategoryFromApi(response.data, [])
          setCategories((prev) => [...prev, created])
          toast.success("Category created successfully")
          setIsFormOpen(false)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to save category"
      toast.error(errorMessage)
    }
  }

  const toggleCategoryExpanded = (id: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedCategories(newExpanded)
  }

  // Subcategory handlers
  const handleAddSubcategory = (categoryId: string, categoryName: string) => {
    setSubcategoryParentId(categoryId)
    setSubcategoryParentName(categoryName)
    setSelectedSubcategory(null)
    setIsSubcategoryFormOpen(true)
  }

  const handleEditSubcategory = (subcategory: Subcategory, categoryName: string) => {
    setSubcategoryParentId(subcategory.categoryId)
    setSubcategoryParentName(categoryName)
    setSelectedSubcategory(subcategory)
    setIsSubcategoryFormOpen(true)
  }

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    if (confirm("Are you sure you want to delete this subcategory?")) {
      try {
        const response = await subcategoriesApi.deleteSubcategory(subcategoryId)
        if (response.success) {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === categoryId
                ? {
                    ...cat,
                    subcategories: cat.subcategories?.filter((s) => s.id !== subcategoryId),
                  }
                : cat
            )
          )
          syncViewCategory(categoryId, (cat) => ({
            ...cat,
            subcategories: cat.subcategories?.filter((s) => s.id !== subcategoryId),
          }))
          toast.success("Subcategory deleted successfully")
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || "Failed to delete subcategory"
        toast.error(errorMessage)
      }
    }
  }

  const handleSaveSubcategory = async (subcategoryData: CreateSubcategoryDto) => {
    try {
      if (selectedSubcategory) {
        const response = await subcategoriesApi.updateSubcategory(
          selectedSubcategory.id,
          subcategoryData
        )
        if (response.success) {
          const updated = mapSubcategoryFromApi({
            ...response.data,
            id: selectedSubcategory.id,
            category_id: subcategoryParentId,
          })
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === subcategoryParentId
                ? {
                    ...cat,
                    subcategories: cat.subcategories?.map((s) =>
                      s.id === selectedSubcategory.id ? updated : s
                    ),
                  }
                : cat
            )
          )
          syncViewCategory(subcategoryParentId, (cat) => ({
            ...cat,
            subcategories: cat.subcategories?.map((s) =>
              s.id === selectedSubcategory.id ? updated : s
            ),
          }))
          toast.success("Subcategory updated successfully")
          setIsSubcategoryFormOpen(false)
        }
      } else {
        const response = await subcategoriesApi.createSubcategory(subcategoryData)
        if (response.success && response.data) {
          const created = mapSubcategoryFromApi(response.data)
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === subcategoryParentId
                ? {
                    ...cat,
                    subcategories: [...(cat.subcategories || []), created],
                  }
                : cat
            )
          )
          syncViewCategory(subcategoryParentId, (cat) => ({
            ...cat,
            subcategories: [...(cat.subcategories || []), created],
          }))
          toast.success("Subcategory created successfully")
          setIsSubcategoryFormOpen(false)
        }
      }
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || "Failed to save subcategory"
      toast.error(errorMessage)
    }
  }

  const getStatusBadge = (isActive: boolean) => {
    if (isActive) return <Badge variant="success">Active</Badge>
    return <Badge variant="secondary">Inactive</Badge>
  }

  const handleToggleCategoryStatus = async (category: Category) => {
    const newIsActive = !category.isActive
    try {
      const response = await categoriesApi.updateCategory(category.id, { isActive: newIsActive })
      if (response.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === category.id ? { ...c, isActive: newIsActive } : c))
        )
        toast.success(`Category ${newIsActive ? 'activated' : 'deactivated'}`)
      }
    } catch {
      toast.error('Failed to update category status')
    }
  }

  const handleToggleSubcategoryStatus = async (
    categoryId: string,
    subcategory: Subcategory
  ) => {
    const newIsActive = !subcategory.isActive
    try {
      const response = await subcategoriesApi.updateSubcategory(subcategory.id, {
        isActive: newIsActive,
      })
      if (response.success) {
        setCategories((prev) =>
          prev.map((cat) =>
            cat.id === categoryId
              ? {
                  ...cat,
                  subcategories: cat.subcategories?.map((sub) =>
                    sub.id === subcategory.id ? { ...sub, isActive: newIsActive } : sub
                  ),
                }
              : cat
          )
        )
        toast.success(`Subcategory ${newIsActive ? 'activated' : 'deactivated'}`)
      }
    } catch {
      toast.error('Failed to update subcategory status')
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">
            Manage product categories and subcategories ({filteredCategories.length}{" "}
            {filteredCategories.length === 1 ? "category" : "categories"})
          </p>
        </div>
        <Button onClick={handleAddCategory}>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </Card>

      {/* Categories Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Products</TableHead>
              <TableHead>Subcategories</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">Loading categories...</p>
                </TableCell>
              </TableRow>
            ) : filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <p className="text-muted-foreground">No categories found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((category) => (
              <Fragment key={category.id}>
                <TableRow>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleCategoryExpanded(category.id)}
                      title={
                        category.subcategories && category.subcategories.length > 0
                          ? expandedCategories.has(category.id)
                            ? "Hide subcategories"
                            : "Show subcategories"
                          : "No subcategories"
                      }
                      disabled={
                        !category.subcategories || category.subcategories.length === 0
                      }
                    >
                      <FolderTree
                        className={`h-4 w-4 transition-transform ${
                          expandedCategories.has(category.id) ? "rotate-90" : ""
                        } ${
                          category.subcategories && category.subcategories.length > 0
                            ? "text-primary"
                            : "text-muted-foreground/40"
                        }`}
                      />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {category.image ? (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="h-10 w-10 rounded-md object-cover"
                          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                            e.currentTarget.src = "https://via.placeholder.com/40?text=?"
                          }}
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <p className="font-medium">{category.name}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {category.description || "-"}
                    </p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.productCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {category.subcategories && category.subcategories.length > 0 ? (
                      <Badge variant="outline">{category.subcategories.length}</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleCategoryStatus(category)}
                      className="cursor-pointer rounded-md transition-opacity hover:opacity-80"
                      title="Click to toggle Active / Inactive"
                    >
                      {getStatusBadge(category.isActive)}
                    </button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCategory(category)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditCategory(category)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAddSubcategory(category.id, category.name)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Subcategory
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
                {/* Subcategories */}
                {expandedCategories.has(category.id) &&
                  category.subcategories &&
                  category.subcategories.map((sub) => (
                    <TableRow key={sub.id} className="bg-muted/50">
                      <TableCell></TableCell>
                      <TableCell className="pl-12">
                        <div className="flex items-center gap-3">
                          {sub.image ? (
                            <img
                              src={sub.image}
                              alt={sub.name}
                              className="h-8 w-8 rounded-md object-cover"
                              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                                e.currentTarget.src = "https://via.placeholder.com/32?text=?"
                              }}
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <p className="text-sm font-medium">{sub.name}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sub.description || "Subcategory"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {sub.productCount}
                        </Badge>
                      </TableCell>
                      <TableCell>-</TableCell>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => handleToggleSubcategoryStatus(category.id, sub)}
                          className="cursor-pointer rounded-md transition-opacity hover:opacity-80"
                          title="Click to toggle Active / Inactive"
                        >
                          {getStatusBadge(sub.isActive)}
                        </button>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditSubcategory(sub, category.name)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteSubcategory(category.id, sub.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            )))}
          </TableBody>
        </Table>
      </Card>

      <CategoryViewDialog
        category={viewCategory}
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        onSubcategoryDeleted={(categoryId, subcategoryId) => {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === categoryId
                ? {
                    ...cat,
                    subcategories: cat.subcategories?.filter((s) => s.id !== subcategoryId),
                  }
                : cat
            )
          )
          syncViewCategory(categoryId, (cat) => ({
            ...cat,
            subcategories: cat.subcategories?.filter((s) => s.id !== subcategoryId),
          }))
        }}
      />

      {/* Category Form Dialog */}
      <CategoryFormDialog
        category={selectedCategory}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveCategory}
      />

      {/* Subcategory Form Dialog */}
      <SubcategoryFormDialog
        subcategory={selectedSubcategory}
        categoryId={subcategoryParentId}
        categoryName={subcategoryParentName}
        open={isSubcategoryFormOpen}
        onOpenChange={setIsSubcategoryFormOpen}
        onSave={handleSaveSubcategory}
      />
    </div>
  )
}
