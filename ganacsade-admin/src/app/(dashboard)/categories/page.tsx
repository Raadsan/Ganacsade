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
import { Plus, Search, MoreVertical, Edit, Trash2, FolderTree, Image as ImageIcon } from "lucide-react"
import { Category, CreateCategoryDto, Subcategory, CreateSubcategoryDto } from "@/types"
import { CategoryFormDialog } from "@/components/dashboard/category-form-dialog"
import { SubcategoryFormDialog } from "@/components/dashboard/subcategory-form-dialog"
import { categoriesApi } from "@/lib/api/categories"
import { subcategoriesApi } from "@/lib/api/subcategories"
import { toast } from "sonner"
import { BACKEND_URL } from "@/lib/api/client"

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
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

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await categoriesApi.getCategories()
      if (response.success && response.data) {
        // Fetch subcategories for each category
        const categoriesWithSubs = await Promise.all(
          response.data.map(async (cat: any) => {
            try {
              const subsResponse = await subcategoriesApi.getSubcategories(cat.id)
              return {
                id: cat.id,
                name: cat.name_en || cat.name,
                description: cat.description_en || cat.description || '',
                image: cat.image_url ? `${BACKEND_URL}${cat.image_url}` : undefined,
                productCount: cat.product_count || 0,
                isActive: cat.is_active,
                subcategories: subsResponse.success && subsResponse.data ? subsResponse.data.map((sub: any) => ({
                  id: sub.id,
                  categoryId: sub.category_id,
                  name: sub.name_en || sub.name,
                  description: sub.description_en || sub.description || '',
                  image: sub.image_url ? `${BACKEND_URL}${sub.image_url}` : undefined,
                  isActive: sub.is_active,
                  productCount: sub.product_count || 0,
                })) : [],
              }
            } catch (error) {
              return {
                id: cat.id,
                name: cat.name_en || cat.name,
                description: cat.description_en || cat.description || '',
                image: cat.image_url ? `${BACKEND_URL}${cat.image_url}` : undefined,
                productCount: cat.product_count || 0,
                isActive: cat.is_active,
                subcategories: [],
              }
            }
          })
        )
        setCategories(categoriesWithSubs)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
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

  const handleDeleteCategory = async (id: string) => {
    if (confirm("Are you sure you want to delete this category? This will affect all products in this category.")) {
      try {
        const response = await categoriesApi.deleteCategory(id)
        if (response.success) {
          toast.success("Category deleted successfully")
          fetchCategories()
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete category'
        toast.error(errorMessage)
      }
    }
  }

  const handleSaveCategory = async (categoryData: CreateCategoryDto) => {
    try {
      if (selectedCategory) {
        // Update existing category
        const response = await categoriesApi.updateCategory(selectedCategory.id, categoryData)
        if (response.success) {
          toast.success("Category updated successfully")
          fetchCategories()
        }
      } else {
        // Add new category
        const response = await categoriesApi.createCategory(categoryData)
        if (response.success) {
          toast.success("Category created successfully")
          fetchCategories()
        }
      }
      setIsFormOpen(false)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save category'
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
          toast.success("Subcategory deleted successfully")
          fetchCategories()
        }
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || 'Failed to delete subcategory'
        toast.error(errorMessage)
      }
    }
  }

  const handleSaveSubcategory = async (subcategoryData: CreateSubcategoryDto) => {
    try {
      if (selectedSubcategory) {
        // Update existing subcategory
        const response = await subcategoriesApi.updateSubcategory(selectedSubcategory.id, subcategoryData)
        if (response.success) {
          toast.success("Subcategory updated successfully")
          fetchCategories()
        }
      } else {
        // Add new subcategory
        const response = await subcategoriesApi.createSubcategory(subcategoryData)
        if (response.success) {
          toast.success("Subcategory created successfully")
          fetchCategories()
        }
      }
      setIsSubcategoryFormOpen(false)
    } catch (error: any) {
      const errorMessage = error?.response?.data?.message || 'Failed to save subcategory'
      toast.error(errorMessage)
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
                    {category.subcategories && category.subcategories.length > 0 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleCategoryExpanded(category.id)}
                        title={expandedCategories.has(category.id) ? "Collapse subcategories" : "Expand subcategories"}
                      >
                        <FolderTree className={`h-4 w-4 transition-transform ${expandedCategories.has(category.id) ? 'rotate-90' : ''}`} />
                      </Button>
                    )}
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
                    {category.isActive ? (
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
                        {sub.isActive ? (
                          <Badge variant="success" className="text-xs">Active</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">Inactive</Badge>
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
