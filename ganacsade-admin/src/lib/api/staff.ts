import { axiosInstance } from './client';

export type StaffRole = 'admin' | 'staff';
export type StaffStatus = 'active' | 'inactive' | 'suspended';

export interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string | null;
  email: string;
  phone_number: string;
  role: StaffRole;
  status: StaffStatus;
  is_email_verified: boolean;
  created_at: string;
  last_login_at: string | null;
}

export interface CreateStaffDto {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  role: StaffRole;
}

export interface UpdateStaffDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  role?: StaffRole;
  status?: StaffStatus;
}

export interface StaffFilters {
  search?: string;
  role?: StaffRole | '';
  status?: StaffStatus | '';
  page?: number;
  limit?: number;
}

export const staffApi = {
  getAll: async (filters?: StaffFilters) => {
    const response = await axiosInstance.get('/admin/staff', { params: filters });
    return response.data;
  },

  getOne: async (id: string) => {
    const response = await axiosInstance.get(`/admin/staff/${id}`);
    return response.data;
  },

  create: async (data: CreateStaffDto) => {
    const response = await axiosInstance.post('/admin/staff', data);
    return response.data;
  },

  update: async (id: string, data: UpdateStaffDto) => {
    const response = await axiosInstance.put(`/admin/staff/${id}`, data);
    return response.data;
  },

  resetPassword: async (id: string, password: string) => {
    const response = await axiosInstance.patch(`/admin/staff/${id}/password`, { password });
    return response.data;
  },

  remove: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/staff/${id}`);
    return response.data;
  },
};
