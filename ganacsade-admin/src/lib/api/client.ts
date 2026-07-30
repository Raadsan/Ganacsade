import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const PRODUCTION_API_URL = 'http://178.18.241.5:5002/api';
const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL;
const API_URL = RAW_API_URL.replace(/\/+$/, '');
const LOCAL_API_URL = 'http://localhost:5002/api';

const resolveApiUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return LOCAL_API_URL;
    }
  }
  return API_URL;
};

// Base URL without /api path - used for image URLs
export const BACKEND_URL = API_URL.replace(/\/api$/, '');

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: resolveApiUrl(),
      timeout: 30000,
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private refreshing: Promise<string | null> | null = null;

  private async getValidToken(): Promise<string | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Refresh if token expires within the next 60 seconds
      if (payload?.exp && Date.now() >= (payload.exp - 60) * 1000) {
        if (!this.refreshing) {
          this.refreshing = this.refreshAccessToken().finally(() => {
            this.refreshing = null;
          });
        }
        return await this.refreshing;
      }
    } catch {
      // Non-decodable token — let the server reject it
    }
    return token;
  }

  private async refreshAccessToken(): Promise<string | null> {
    try {
      // Refresh tokens aren't stored yet — return null so user is redirected to login
      // TODO: persist refreshToken in localStorage at login and use it here
      return null;
    } catch {
      return null;
    }
  }

  private setupInterceptors() {
    // Request interceptor — attach a valid (non-expired) token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await this.getValidToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        this.handleError(error);
        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      // Mirror into a cookie so Next.js middleware can read it server-side
      document.cookie = `token=${token}; path=/; SameSite=Strict`;
    }
  }

  public removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      // Expire the cookie immediately
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict';
    }
  }

  private handleError(error: AxiosError) {
    const isBrowser = typeof window !== 'undefined';
    const onLoginPage = isBrowser && (
      window.location.pathname === '/login'
      || window.location.pathname === '/register'
      || window.location.pathname === '/admin/login'
    );
    const url = error.config?.url || '';
    const isAuthEndpoint = url.includes('/auth/admin/login') || url.includes('/auth/login');

    if (error.response) {
      const status = error.response.status;
      const data: any = error.response.data || {};

      switch (status) {
        case 400:
          if (!isAuthEndpoint) toast.error(data.message || 'Bad request');
          break;
        case 401:
          // Let the login page handle 401s itself
          if (isAuthEndpoint || onLoginPage) break;
          toast.error('Session expired. Please login again.');
          this.removeToken();
          if (isBrowser) {
            localStorage.removeItem('user');
            window.location.href = '/login';
          }
          break;
        case 403:
          if (url.includes('/auth/delivery-profile')) break;
          toast.error(data.message || 'Access forbidden');
          break;
        case 404:
          toast.error(data.message || 'Resource not found');
          break;
        case 500:
          toast.error('Server error. Please try again later.');
          break;
        default:
          if (!isAuthEndpoint) toast.error(data.message || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
  }

  public getInstance(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new ApiClient();
export const axiosInstance = apiClient.getInstance();
