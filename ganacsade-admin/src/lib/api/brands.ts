import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin/brands';

// Get auth token from localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

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

export const brandsApi = {
  // Get all brands
  getBrands: async () => {
    try {
      const response = await axios.get(API_URL, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching brands:', error);
      throw error;
    }
  },

  // Get single brand
  getBrand: async (id: string) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error fetching brand:', error);
      throw error;
    }
  },

  // Create brand
  createBrand: async (data: CreateBrandDto) => {
    try {
      const response = await axios.post(API_URL, data, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  // Update brand
  updateBrand: async (id: string, data: UpdateBrandDto) => {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (id: string) => {
    try {
      const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      return response.data;
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  // Upload brand logo
  uploadLogo: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('logo', file);

      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/upload-logo`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },
};
