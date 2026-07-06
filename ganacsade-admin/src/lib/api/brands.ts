import { axiosInstance } from './client';

export interface Brand {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  is_active: boolean;
  product_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBrandDto {
  name: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  isActive?: boolean;
}

interface BrandsResponse {
  success: boolean;
  data: Brand[];
}

interface BrandResponse {
  success: boolean;
  data: Brand;
}

export const brandsApi = {
  getBrands: async () => {
    const response = await axiosInstance.get<BrandsResponse>('/admin/brands');
    return response.data;
  },

  getBrand: async (id: string) => {
    const response = await axiosInstance.get<BrandResponse>(`/admin/brands/${id}`);
    return response.data;
  },

  createBrand: async (data: CreateBrandDto) => {
    const response = await axiosInstance.post<BrandResponse>('/admin/brands', data);
    return response.data;
  },

  updateBrand: async (id: string, data: UpdateBrandDto) => {
    const response = await axiosInstance.put<BrandResponse>(`/admin/brands/${id}`, data);
    return response.data;
  },

  deleteBrand: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/brands/${id}`);
    return response.data;
  },

  uploadLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);

    const response = await axiosInstance.post<{ success: boolean; data: { logoUrl: string } }>(
      '/admin/brands/upload-logo',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      }
    );
    return response.data;
  },
};
