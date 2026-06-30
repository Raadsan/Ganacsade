"use client"

import { useState, useEffect } from "react"
import { resolveImageUrl } from "@/lib/utils/image-url"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  MousePointerClick,
  MoveUp,
  MoveDown,
  Image as ImageIcon,
} from "lucide-react"
import { Advertisement, CreateAdvertisementDto } from "@/types"
import { AdvertisementFormDialog } from "@/components/dashboard/advertisement-form-dialog"
import { advertisementsApi } from "@/lib/api/advertisements"
import { toast } from "sonner"

// Data will be fetched from API

export default function AdvertisementsPage() {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([])
  const [selectedAd, setSelectedAd] = useState<Advertisement | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [placementFilter, setPlacementFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  // Fetch advertisements on mount
  useEffect(() => {
    fetchAdvertisements()
  }, [])

  const fetchAdvertisements = async () => {
    try {
      setLoading(true)
      const response: any = await advertisementsApi.getAdvertisements()
      console.log('Advertisements API response:', response)
      if (response.success && response.data) {
        // Map API response to Advertisement type
        const mappedAds = response.data.map((ad: any) => {
          const imageUrl = resolveImageUrl(ad.image_url) || ''
          console.log('Advertisement image URL:', ad.title, '→', imageUrl)
          return {
            id: ad.id,
            title: ad.title,
            description: ad.description,
            imageUrl: imageUrl,
            targetUrl: ad.target_url,
            placement: ad.placement,
            displayOrder: ad.display_order,
            isActive: ad.is_active,
            startDate: ad.start_date ? new Date(ad.start_date) : undefined,
            endDate: ad.end_date ? new Date(ad.end_date) : undefined,
            viewCount: ad.view_count,
            clickCount: ad.click_count,
            createdAt: new Date(ad.created_at),
          }
        })
        setAdvertisements(mappedAds)
      }
    } catch (error) {
      console.error('Error fetching advertisements:', error)
      toast.error('Failed to load advertisements')
    } finally {
      setLoading(false)
    }
  }

  const filteredAds = advertisements.filter((ad) => {
    const matchesPlacement = placementFilter === "all" || ad.placement === placementFilter
    return matchesPlacement
  })

  const groupedAds = filteredAds.reduce((acc, ad) => {
    if (!acc[ad.placement]) {
      acc[ad.placement] = []
    }
    acc[ad.placement].push(ad)
    return acc
  }, {} as Record<string, Advertisement[]>)

  // Sort by display order
  Object.keys(groupedAds).forEach((placement) => {
    groupedAds[placement].sort((a, b) => a.displayOrder - b.displayOrder)
  })

  const handleAddAdvertisement = () => {
    setSelectedAd(null)
    setIsFormOpen(true)
  }

  const handleEditAdvertisement = (ad: Advertisement) => {
    setSelectedAd(ad)
    setIsFormOpen(true)
  }

  const handleDeleteAdvertisement = async (id: string) => {
    if (confirm("Are you sure you want to delete this advertisement?")) {
      try {
        const response: any = await advertisementsApi.deleteAdvertisement(id)
        if (response.success) {
          toast.success("Advertisement deleted successfully")
          fetchAdvertisements()
        }
      } catch (error) {
        console.error('Error deleting advertisement:', error)
        toast.error('Failed to delete advertisement')
      }
    }
  }

  const handleSaveAdvertisement = async (adData: CreateAdvertisementDto, imageFile?: File) => {
    try {
      console.log('Saving advertisement with data:', adData)
      console.log('Image file:', imageFile)
      
      // Convert Date objects to ISO strings for API
      const apiData = {
        ...adData,
        startDate: adData.startDate instanceof Date 
          ? adData.startDate.toISOString() 
          : adData.startDate,
        endDate: adData.endDate instanceof Date 
          ? adData.endDate.toISOString() 
          : adData.endDate,
      }

      if (selectedAd) {
        console.log('Updating advertisement:', selectedAd.id)
        const response: any = await advertisementsApi.updateAdvertisement(selectedAd.id, apiData, imageFile)
        console.log('Update response:', response)
        if (response.success) {
          toast.success("Advertisement updated successfully")
          await fetchAdvertisements()
        }
      } else {
        console.log('Creating new advertisement')
        const response: any = await advertisementsApi.createAdvertisement(apiData, imageFile)
        console.log('Create response:', response)
        if (response.success) {
          toast.success("Advertisement created successfully")
          await fetchAdvertisements()
        }
      }
      setIsFormOpen(false)
    } catch (error: any) {
      console.error('Error saving advertisement:', error)
      const errorMessage = error?.response?.data?.message || 'Failed to save advertisement'
      toast.error(errorMessage)
    }
  }

  const handleToggleStatus = async (id: string) => {
    try {
      const ad = advertisements.find((a) => a.id === id)
      if (!ad) return
      
      const response: any = await advertisementsApi.updateAdvertisement(id, { isActive: !ad.isActive })
      if (response.success) {
        toast.success(`Advertisement ${ad.isActive ? "deactivated" : "activated"}`)
        fetchAdvertisements()
      }
    } catch (error) {
      console.error('Error toggling status:', error)
      toast.error('Failed to update status')
    }
  }

  const handleMoveUp = (placement: string, index: number) => {
    if (index > 0) {
      const placementAds = groupedAds[placement]
      const newAds = [...advertisements]
      
      const currentAd = newAds.find(ad => ad.id === placementAds[index].id)!
      const previousAd = newAds.find(ad => ad.id === placementAds[index - 1].id)!
      
      const tempOrder = currentAd.displayOrder
      currentAd.displayOrder = previousAd.displayOrder
      previousAd.displayOrder = tempOrder
      
      setAdvertisements(newAds)
      toast.success("Advertisement moved up")
    }
  }

  const handleMoveDown = (placement: string, index: number) => {
    const placementAds = groupedAds[placement]
    if (index < placementAds.length - 1) {
      const newAds = [...advertisements]
      
      const currentAd = newAds.find(ad => ad.id === placementAds[index].id)!
      const nextAd = newAds.find(ad => ad.id === placementAds[index + 1].id)!
      
      const tempOrder = currentAd.displayOrder
      currentAd.displayOrder = nextAd.displayOrder
      nextAd.displayOrder = tempOrder
      
      setAdvertisements(newAds)
      toast.success("Advertisement moved down")
    }
  }

  const getPlacementLabel = (placement: string) => {
    const labels: Record<string, string> = {
      home_slider: "Home Slider",
      home_banner: "Home Banner",
      category_page: "Category Page",
      product_page: "Product Page",
      checkout: "Checkout",
    }
    return labels[placement] || placement
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advertisements</h1>
          <p className="text-muted-foreground">
            Manage banners and promotional content ({filteredAds.length} ads)
          </p>
        </div>
        <Button onClick={handleAddAdvertisement}>
          <Plus className="mr-2 h-4 w-4" />
          Create Advertisement
        </Button>
      </div>

      {/* Filter */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select value={placementFilter} onValueChange={setPlacementFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Placements" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Placements</SelectItem>
                <SelectItem value="home_slider">Home Slider</SelectItem>
                <SelectItem value="home_banner">Home Banner</SelectItem>
                <SelectItem value="category_page">Category Page</SelectItem>
                <SelectItem value="product_page">Product Page</SelectItem>
                <SelectItem value="checkout">Checkout</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Grouped Advertisements */}
      {Object.entries(groupedAds).map(([placement, ads]) => (
        <Card key={placement} className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">{getPlacementLabel(placement)}</h2>
            <p className="text-sm text-muted-foreground">{ads.length} advertisements</p>
          </div>

          <div className="space-y-4">
            {ads.map((ad, index) => (
              <Card key={ad.id} className="p-4">
                <div className="flex items-center gap-4">
                  {/* Order Number */}
                  <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                    {ad.displayOrder}
                  </div>

                  {/* Ad Image */}
                  <div className="flex-shrink-0">
                    {ad.imageUrl ? (
                      <img
                        src={ad.imageUrl}
                        alt={ad.title}
                        className="h-20 w-32 rounded-lg object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                          e.currentTarget.src = "https://via.placeholder.com/128x80?text=No+Image"
                        }}
                      />
                    ) : (
                      <div className="h-20 w-32 rounded-lg bg-muted flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Ad Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{ad.title}</h3>
                        {ad.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {ad.description}
                          </p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          {ad.targetUrl && (
                            <Badge variant="outline" className="text-xs">
                              {ad.targetUrl}
                            </Badge>
                          )}
                          {ad.isActive ? (
                            <Badge variant="success">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                          {ad.startDate && ad.endDate && (
                            <Badge variant="outline" className="text-xs">
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-4 text-sm">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Eye className="h-4 w-4" />
                        <span>Views</span>
                      </div>
                      <p className="font-semibold">{ad.viewCount.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MousePointerClick className="h-4 w-4" />
                        <span>Clicks</span>
                      </div>
                      <p className="font-semibold">{ad.clickCount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveUp(placement, index)}
                        disabled={index === 0}
                        title="Move up"
                      >
                        <MoveUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleMoveDown(placement, index)}
                        disabled={index === ads.length - 1}
                        title="Move down"
                      >
                        <MoveDown className="h-4 w-4" />
                      </Button>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditAdvertisement(ad)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(ad.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          {ad.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteAdvertisement(ad.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      ))}

      {filteredAds.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Advertisements</h3>
            <p className="text-muted-foreground mb-4">
              Create banners and promotional content for your app
            </p>
            <Button onClick={handleAddAdvertisement}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Advertisement
            </Button>
          </div>
        </Card>
      )}

      {/* Advertisement Form Dialog */}
      <AdvertisementFormDialog
        advertisement={selectedAd}
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSaveAdvertisement}
      />
    </div>
  )
}
