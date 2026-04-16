export type AdvertisementPlacement = 
  | 'home_slider' 
  | 'home_banner' 
  | 'category_page' 
  | 'product_page' 
  | 'checkout';

export type AdvertisementStatus = 'active' | 'inactive' | 'scheduled';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl?: string;
  placement: AdvertisementPlacement;
  displayOrder: number;
  isActive: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  clickCount: number;
  viewCount: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateAdvertisementDto {
  title: string;
  description?: string;
  imageUrl: string;
  targetUrl?: string;
  placement: AdvertisementPlacement;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
}
