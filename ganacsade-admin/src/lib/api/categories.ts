import { axiosInstance } from './client';
import { ApiResponse, Category, CreateCategoryDto } from '@/types';

export const categoriesApi = {
  /**
   * Get all categories with hierarchy
   */
  async getCategories() {
    const response = await axiosInstance.get<ApiResponse<Category[]>>('/admin/categories');
    return response.data;
  },

  /**
   * Get single category by ID
   */
  async getCategory(id: string) {
    const response = await axiosInstance.get<ApiResponse<Category>>(`/admin/categories/${id}`);
    return response.data;
  },

  /**
   * Create new category
   */
  async createCategory(data: CreateCategoryDto) {
    const response = await axiosInstance.post<ApiResponse<Category>>('/admin/categories', data);
    return response.data;
  },

  /**
   * Update existing category
   */
  async updateCategory(id: string, data: Partial<CreateCategoryDto>) {
    const response = await axiosInstance.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return response.data;
  },

  /**
   * Delete category
   */
  async deleteCategory(id: string) {
    const response = await axiosInstance.delete<ApiResponse<void>>(`/admin/categories/${id}`);
    return response.data;
  },

  /**
   * Reorder categories
   */
  async reorderCategories(categoryIds: string[]) {
    const response = await axiosInstance.patch<ApiResponse<void>>(
      '/admin/categories/reorder',
      { categoryIds }
    );
    return response.data;
  },

  /**
   * Upload category image
   */
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post<ApiResponse<{ imageUrl: string }>>(
      '/admin/categories/upload-image',
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
