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

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

export const authApi = {
  /**
   * Admin login
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/admin/login',
      credentials
    );

    if (response.data.success && response.data.data) {
      apiClient.setToken(response.data.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
      }
      return response.data.data;
    }

    throw new Error(response.data.message || 'Login failed');
  },

  /**
   * Logout (calls backend to invalidate session, then clears local storage)
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Even if backend fails (e.g. token already expired), we still clear locally
    } finally {
      apiClient.removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  },

  /**
   * Get current admin profile
   */
  async getProfile() {
    const response = await axiosInstance.get<ApiResponse<any>>('/auth/profile');
    return response.data;
  },

  /**
   * Update current user profile
   */
  async updateProfile(data: UpdateProfileDto) {
    const response = await axiosInstance.put<ApiResponse<any>>('/auth/profile', data);
    return response.data;
  },

  /**
   * Change current user password
   */
  async changePassword(data: ChangePasswordDto) {
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

  /**
   * Check if user is authenticated (presence + JWT expiration)
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload?.exp && Date.now() >= payload.exp * 1000) {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  },
};
