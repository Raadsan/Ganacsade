import { axiosInstance, apiClient } from './client';
import { ApiResponse } from '@/types';
import { AdminUser } from '@/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: AdminUser;
  token: string;
}

export const authApi = {
  /**
   * Admin login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/admin/auth/login',
      credentials
    );
    
    if (response.data.success && response.data.data) {
      // Store token
      apiClient.setToken(response.data.data.token);
      return response.data.data;
    }
    
    throw new Error(response.data.message || 'Login failed');
  },

  /**
   * Admin logout
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/admin/auth/logout');
    } finally {
      apiClient.removeToken();
    }
  },

  /**
   * Get current admin profile
   */
  async getProfile(): Promise<AdminUser> {
    const response = await axiosInstance.get<ApiResponse<AdminUser>>(
      '/admin/auth/profile'
    );
    
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    
    throw new Error('Failed to fetch profile');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('admin_token');
  },
};
