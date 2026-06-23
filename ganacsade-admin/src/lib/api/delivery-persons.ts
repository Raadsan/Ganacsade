import { axiosInstance } from './client';

export interface DeliveryPerson {
  id: string;
  user_id?: string | null;
  name: string;
  email: string;
  phone: string;
  user_photo_url?: string | null;
  vehicle_photos?: string[];
  location?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  license_number?: string | null;
  is_active?: boolean;
  is_available?: boolean;
  current_assignments?: number;
  total_deliveries?: number;
  rating?: number;
  created_at?: string;
  updated_at?: string;
  users?: {
    id: string;
    status?: string;
    last_login_at?: string | null;
  } | null;
}

export interface DeliveryPersonFilters {
  search?: string;
  status?: 'active' | 'inactive';
  availability?: 'available' | 'unavailable';
  page?: number;
  limit?: number;
}

export interface CreateDeliveryPersonDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  location?: string;
  latitude?: number | string;
  longitude?: number | string;
  userPhotoUrl?: string;
  vehiclePhotos?: string[];
  isAvailable?: boolean;
}

export interface UpdateDeliveryPersonDto {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  location?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  userPhotoUrl?: string;
  vehiclePhotos?: string[];
  isActive?: boolean;
  isAvailable?: boolean;
  status?: string;
}

export const deliveryPersonsApi = {
  getAll: async (filters?: DeliveryPersonFilters) => {
    const response = await axiosInstance.get('/admin/delivery-persons', { params: filters });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/delivery-persons/${id}`);
    return response.data;
  },

  create: async (data: CreateDeliveryPersonDto) => {
    const response = await axiosInstance.post('/admin/delivery-persons', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDeliveryPersonDto) => {
    const response = await axiosInstance.put(`/admin/delivery-persons/${id}`, data);
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/delivery-persons/${id}`);
    return response.data;
  },

  uploadUserPhoto: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post('/admin/delivery-persons/upload/user-photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  uploadVehiclePhotos: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    const response = await axiosInstance.post('/admin/delivery-persons/upload/vehicle-photos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
