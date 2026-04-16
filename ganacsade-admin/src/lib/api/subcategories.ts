import { axiosInstance } from './client';
import { ApiResponse, Subcategory, CreateSubcategoryDto } from '@/types';

export const subcategoriesApi = {
  /**
   * Get all subcategories or by category
   */
  async getSubcategories(categoryId?: string) {
    const params = categoryId ? { categoryId } : {};
    const response = await axiosInstance.get<ApiResponse<Subcategory[]>>('/admin/subcategories', { params });
    return response.data;
  },

  /**
   * Get single subcategory by ID
   */
  async getSubcategory(id: string) {
    const response = await axiosInstance.get<ApiResponse<Subcategory>>(`/admin/subcategories/${id}`);
    return response.data;
  },

  /**
   * Create new subcategory
   */
  async createSubcategory(data: CreateSubcategoryDto) {
    const response = await axiosInstance.post<ApiResponse<Subcategory>>('/admin/subcategories', data);
    return response.data;
  },

  /**
   * Update existing subcategory
   */
  async updateSubcategory(id: string, data: Partial<CreateSubcategoryDto>) {
    const response = await axiosInstance.put<ApiResponse<Subcategory>>(`/admin/subcategories/${id}`, data);
    return response.data;
  },

  /**
   * Delete subcategory
   */
  async deleteSubcategory(id: string) {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/admin/subcategories/${id}`);
    return response.data;
  },

  /**
   * Upload subcategory image
   */
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post<ApiResponse<{ imageUrl: string }>>(
      '/admin/subcategories/upload-image',
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
