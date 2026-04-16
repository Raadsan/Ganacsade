import { axiosInstance } from './client';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  display_name: string;
  name?: string; // Computed field for convenience
  email: string;
  phone_number?: string;
  phone?: string; // Alias for convenience
  role: 'customer' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  is_verified: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  is_verified?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone?: string;
  password: string;
  role?: 'customer' | 'admin';
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
  status?: string;
}

export const usersApi = {
  // Get all users with filters
  getUsers: async (filters?: UserFilters) => {
    const response = await axiosInstance.get('/admin/users', { params: filters });
    return response.data;
  },

  // Get user statistics
  getStats: async () => {
    const response = await axiosInstance.get('/admin/users/stats');
    return response.data;
  },

  // Get single user
  getUser: async (id: string) => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  // Create user
  createUser: async (data: CreateUserDto) => {
    const response = await axiosInstance.post('/admin/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserDto) => {
    const response = await axiosInstance.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Update user status
  updateStatus: async (id: string, status: string) => {
    const response = await axiosInstance.put(`/admin/users/${id}/status`, { status });
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  },
};
