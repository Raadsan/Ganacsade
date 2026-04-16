import { axiosInstance } from './client';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  image_url: string;
  target_url?: string;
  placement: 'home_slider' | 'home_banner' | 'category_banner' | 'product_sidebar';
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  view_count: number;
  click_count: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAdvertisementDto {
  title: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  placement: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export interface UpdateAdvertisementDto {
  title?: string;
  description?: string;
  imageUrl?: string;
  targetUrl?: string;
  placement?: string;
  displayOrder?: number;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
}

export const advertisementsApi = {
  // Get all advertisements
  getAdvertisements: async (placement?: string) => {
    const params = placement ? { placement } : {};
    const response = await axiosInstance.get<Advertisement[]>('/admin/advertisements', { params });
    return response.data;
  },

  // Get single advertisement
  getAdvertisement: async (id: string) => {
    const response = await axiosInstance.get<Advertisement>(`/admin/advertisements/${id}`);
    return response.data;
  },

  // Create advertisement
  createAdvertisement: async (data: CreateAdvertisementDto, imageFile?: File) => {
    const formData = new FormData();
    formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.targetUrl) formData.append('targetUrl', data.targetUrl);
    formData.append('placement', data.placement);
    if (data.displayOrder !== undefined) formData.append('displayOrder', data.displayOrder.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (imageFile) formData.append('image', imageFile);
    else if (data.imageUrl) formData.append('imageUrl', data.imageUrl);

    const response = await axiosInstance.post<Advertisement>('/admin/advertisements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update advertisement
  updateAdvertisement: async (id: string, data: UpdateAdvertisementDto, imageFile?: File) => {
    const formData = new FormData();
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.targetUrl) formData.append('targetUrl', data.targetUrl);
    if (data.placement) formData.append('placement', data.placement);
    if (data.displayOrder !== undefined) formData.append('displayOrder', data.displayOrder.toString());
    if (data.isActive !== undefined) formData.append('isActive', data.isActive.toString());
    if (data.startDate) formData.append('startDate', data.startDate);
    if (data.endDate) formData.append('endDate', data.endDate);
    if (imageFile) formData.append('image', imageFile);
    else if (data.imageUrl) formData.append('imageUrl', data.imageUrl);

    const response = await axiosInstance.put<Advertisement>(`/admin/advertisements/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete advertisement
  deleteAdvertisement: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/advertisements/${id}`);
    return response.data;
  },

  // Increment view count
  incrementViews: async (id: string) => {
    const response = await axiosInstance.post(`/admin/advertisements/${id}/increment-views`);
    return response.data;
  },

  // Increment click count
  incrementClicks: async (id: string) => {
    const response = await axiosInstance.post(`/admin/advertisements/${id}/increment-clicks`);
    return response.data;
  },
};
