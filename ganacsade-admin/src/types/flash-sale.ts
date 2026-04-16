export type FlashSaleStatus = 'scheduled' | 'active' | 'expired';

export interface FlashSaleProduct {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  stockLimit: number;
  soldCount: number;
}

export interface FlashSale {
  id: string;
  title: string;
  description: string;
  startTime: Date | string;
  endTime: Date | string;
  status: FlashSaleStatus;
  isActive: boolean;
  products: FlashSaleProduct[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateFlashSaleDto {
  title: string;
  description: string;
  startTime: Date | string;
  endTime: Date | string;
  isActive?: boolean;
}
