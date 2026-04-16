import { axiosInstance } from './client';
import { ApiResponse, Order, UpdateOrderStatusDto, PaginationParams } from '@/types';

export const ordersApi = {
  /**
   * Get all orders with pagination and filters
   */
  async getOrders(params?: PaginationParams & { status?: string; dateFrom?: string; dateTo?: string }) {
    const response = await axiosInstance.get<ApiResponse<Order[]>>('/admin/orders', { params });
    return response.data;
  },

  /**
   * Get single order by ID
   */
  async getOrder(id: string) {
    const response = await axiosInstance.get<ApiResponse<Order>>(`/admin/orders/${id}`);
    return response.data;
  },

  /**
   * Update order status
   */
  async updateOrderStatus(data: UpdateOrderStatusDto) {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/admin/orders/${data.orderId}/status`,
      { status: data.status, notes: data.notes }
    );
    return response.data;
  },

  /**
   * Process refund
   */
  async refundOrder(orderId: string, amount?: number, reason?: string) {
    const response = await axiosInstance.post<ApiResponse<void>>(
      `/admin/orders/${orderId}/refund`,
      { amount, reason }
    );
    return response.data;
  },

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, reason?: string) {
    const response = await axiosInstance.post<ApiResponse<Order>>(
      `/admin/orders/${orderId}/cancel`,
      { reason }
    );
    return response.data;
  },
};
