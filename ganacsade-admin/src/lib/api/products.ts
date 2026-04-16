import { axiosInstance } from './client';
import { ApiResponse, Product, CreateProductDto, UpdateProductDto, PaginationParams } from '@/types';

export const productsApi = {
  /**
   * Get all products with pagination and filters
   */
  async getProducts(params?: PaginationParams) {
    const response = await axiosInstance.get<ApiResponse<Product[]>>('/admin/products', { params });
    return response.data;
  },

  /**
   * Get single product by ID
   */
  async getProduct(id: string) {
    const response = await axiosInstance.get<ApiResponse<Product>>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductDto) {
    const response = await axiosInstance.post<ApiResponse<Product>>('/admin/products', data);
    return response.data;
  },

  /**
   * Update existing product
   */
  async updateProduct(id: string, data: UpdateProductDto) {
    const response = await axiosInstance.put<ApiResponse<Product>>(`/admin/products/${id}`, data);
    return response.data;
  },

  /**
   * Delete product
   */
  async deleteProduct(id: string) {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/admin/products/${id}`);
    return response.data;
  },

  /**
   * Bulk update products
   */
  async bulkUpdate(updates: { id: string; data: Partial<Product> }[]) {
    const response = await axiosInstance.patch<ApiResponse<void>>('/admin/products/bulk-update', { updates });
    return response.data;
  },

  /**
   * Upload product image
   */
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await axiosInstance.post<ApiResponse<{ url: string }>>(
      '/admin/products/upload-image',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },
};
