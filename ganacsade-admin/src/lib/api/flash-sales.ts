import { axiosInstance } from './client';

export interface FlashSale {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  status: 'scheduled' | 'active' | 'ended';
  is_active: boolean;
  product_count?: number;
  created_at: string;
  updated_at: string;
}

export interface FlashSaleProduct {
  id: string;
  flash_sale_id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  original_price: number;
  sale_price: number;
  discount_percentage: number;
  stock_limit: number;
  sold_count: number;
  created_at: string;
}

export interface FlashSaleWithProducts extends FlashSale {
  products: FlashSaleProduct[];
}

export interface CreateFlashSaleDto {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  isActive?: boolean;
}

export interface UpdateFlashSaleDto {
  title?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'active' | 'ended';
  isActive?: boolean;
}

export interface AddProductToSaleDto {
  productId: string;
  salePrice: number;
  stockLimit: number;
}

export const flashSalesApi = {
  // Get all flash sales
  getFlashSales: async () => {
    const response = await axiosInstance.get<FlashSale[]>('/admin/flash-sales');
    return response.data;
  },

  // Get single flash sale with products
  getFlashSale: async (id: string) => {
    const response = await axiosInstance.get<FlashSaleWithProducts>(`/admin/flash-sales/${id}`);
    return response.data;
  },

  // Create flash sale
  createFlashSale: async (data: CreateFlashSaleDto) => {
    const response = await axiosInstance.post<FlashSale>('/admin/flash-sales', data);
    return response.data;
  },

  // Update flash sale
  updateFlashSale: async (id: string, data: UpdateFlashSaleDto) => {
    const response = await axiosInstance.put<FlashSale>(`/admin/flash-sales/${id}`, data);
    return response.data;
  },

  // Delete flash sale
  deleteFlashSale: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/flash-sales/${id}`);
    return response.data;
  },

  // Add product to flash sale
  addProductToSale: async (saleId: string, data: AddProductToSaleDto) => {
    const response = await axiosInstance.post<FlashSaleProduct>(
      `/admin/flash-sales/${saleId}/products`,
      data
    );
    return response.data;
  },

  // Update product in flash sale
  updateProductInSale: async (saleId: string, productId: string, data: { salePrice: number; stockLimit: number; soldCount?: number }) => {
    const response = await axiosInstance.put(
      `/admin/flash-sales/${saleId}/products/${productId}`,
      data
    );
    return response.data;
  },

  // Remove product from flash sale
  removeProductFromSale: async (saleId: string, productId: string) => {
    const response = await axiosInstance.delete(
      `/admin/flash-sales/${saleId}/products/${productId}`
    );
    return response.data;
  },
};
