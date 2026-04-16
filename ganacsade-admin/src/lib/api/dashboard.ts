import { axiosInstance } from './client';
import { ApiResponse, DashboardStats, SalesData, TopProduct, RecentOrder } from '@/types';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats() {
    const response = await axiosInstance.get<ApiResponse<DashboardStats>>('/admin/analytics/dashboard');
    return response.data;
  },

  /**
   * Get sales data for charts
   */
  async getSalesData(period: 'week' | 'month' | 'year' = 'month') {
    const response = await axiosInstance.get<ApiResponse<SalesData[]>>(
      '/admin/analytics/sales',
      { params: { period } }
    );
    return response.data;
  },

  /**
   * Get top selling products
   */
  async getTopProducts(limit: number = 5) {
    const response = await axiosInstance.get<ApiResponse<TopProduct[]>>(
      '/admin/analytics/top-products',
      { params: { limit } }
    );
    return response.data;
  },

  /**
   * Get recent orders
   */
  async getRecentOrders(limit: number = 10) {
    const response = await axiosInstance.get<ApiResponse<RecentOrder[]>>(
      '/admin/analytics/recent-orders',
      { params: { limit } }
    );
    return response.data;
  },
};
