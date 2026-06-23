import { axiosInstance, apiClient } from './client';
import { ApiResponse } from '@/types';

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  password: string;
}

export interface LoginResponse {
  user: LoggedInUser;
  token: string;
  refreshToken?: string;
}

export interface LoggedInUser {
  id: string;
  email?: string;
  phoneNumber?: string;
  role: string;
  roleId?: number | null;
  roleModel?: {
    id: number;
    name: string;
  } | null;
  firstName?: string;
  lastName?: string;
  displayName?: string;
}

export interface UpdateProfileDto {
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phoneNumber?: string;
  preferredLanguage?: string;
}

export interface UpdateDeliveryProfileDto extends UpdateProfileDto {
  vehicleType?: string | null;
  vehicleNumber?: string;
  licenseNumber?: string;
  isAvailable?: boolean;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

const buildIdentifierPayload = (identifier: string) => {
  const value = identifier.trim();
  if (value.includes('@')) {
    return { email: value };
  }
  return { phoneNumber: value };
};

export const authApi = {
  persistSession(data: LoginResponse) {
    apiClient.setToken(data.token);
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
  },

  /**
   * Unified login — email or phone. Role decides redirect on the client.
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/login',
      {
        identifier: credentials.identifier.trim(),
        ...buildIdentifierPayload(credentials.identifier),
        password: credentials.password,
      }
    );

    if (response.data.success && response.data.data) {
      this.persistSession(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message || 'Login failed');
  },

  /**
   * Customer registration only
   */
  async register(data: RegisterDto): Promise<LoginResponse> {
    const response = await axiosInstance.post<ApiResponse<LoginResponse>>(
      '/auth/register',
      data
    );

    if (response.data.success && response.data.data) {
      this.persistSession(response.data.data);
      return response.data.data;
    }

    throw new Error(response.data.message || 'Registration failed');
  },

  getCurrentUser(): LoggedInUser | null {
    if (typeof window === 'undefined') return null;
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    try {
      return JSON.parse(rawUser) as LoggedInUser;
    } catch {
      return null;
    }
  },

  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } catch {
      // Even if backend fails, clear locally
    } finally {
      apiClient.removeToken();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user');
      }
    }
  },

  async getProfile() {
    const response = await axiosInstance.get<ApiResponse<any>>('/auth/profile');
    return response.data;
  },

  async updateProfile(data: UpdateProfileDto) {
    const response = await axiosInstance.put<ApiResponse<any>>('/auth/profile', data);
    return response.data;
  },

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosInstance.post<ApiResponse<{ profileImageUrl: string }>>(
      '/auth/profile-image',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return response.data;
  },

  async getDeliveryProfile() {
    const response = await axiosInstance.get<ApiResponse<any>>('/auth/delivery-profile');
    return response.data;
  },

  async updateDeliveryProfile(data: UpdateDeliveryProfileDto) {
    const response = await axiosInstance.put<ApiResponse<any>>('/auth/delivery-profile', data);
    return response.data;
  },

  async changePassword(data: ChangePasswordDto) {
    const response = await axiosInstance.post<ApiResponse<any>>(
      '/auth/change-password',
      data
    );
    return response.data;
  },

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
