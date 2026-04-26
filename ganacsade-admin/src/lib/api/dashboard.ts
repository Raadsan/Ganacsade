import { axiosInstance } from './client';
import { ApiResponse, DashboardStats, SalesData, TopProduct, RecentOrder } from '@/types';

export interface OrdersByStatus {
  status: string;
  count: number;
}

export const dashboardApi = {
  async getStats() {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/analytics/dashboard');
    return response.data;
  },

  async getSalesData() {
    const response = await axiosInstance.get<ApiResponse<SalesData[]>>('/admin/analytics/sales');
    return response.data;
  },

  async getTopProducts(limit = 5) {
    const response = await axiosInstance.get<ApiResponse<TopProduct[]>>(
      '/admin/analytics/top-products',
      { params: { limit } }
    );
    return response.data;
  },

  async getOrdersByStatus() {
    const response = await axiosInstance.get<ApiResponse<OrdersByStatus[]>>(
      '/admin/analytics/orders-by-status'
    );
    return response.data;
  },

  async getRecentOrders(limit = 10) {
    const response = await axiosInstance.get<ApiResponse<RecentOrder[]>>(
      '/admin/analytics/recent-orders',
      { params: { limit } }
    );
    return response.data;
  },

  async getQuickStats() {
    const response = await axiosInstance.get('/admin/dashboard/quick-stats');
    return response.data;
  },
};
