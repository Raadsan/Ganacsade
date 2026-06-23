import { axiosInstance } from './client';
import { ApiResponse, Order, UpdateOrderStatusDto, PaginationParams } from '@/types';

export const ordersApi = {
  /**
   * Get all orders with pagination and filters
   */
  async getOrders(params?: PaginationParams & { status?: string; dateFrom?: string; dateTo?: string; assignmentFilter?: string }) {
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

  async advanceOrderStatus(
    orderId: string,
    payload: {
      status: 'pending' | 'processing' | 'delivered'
      assignmentType?: 'delivery' | 'custom'
      deliveryPersonId?: string
      customContactName?: string
      customContactPhone?: string
      pickupTimeStart?: string
      pickupTimeEnd?: string
      description?: string
    }
  ) {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/admin/orders/${orderId}/advance-status`,
      payload
    );
    return response.data;
  },

  /**
   * Assign order to delivery person (users table role = delivery_person)
   */
  async assignDelivery(orderId: string, deliveryPersonId: string) {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/admin/orders/${orderId}/assign-delivery`,
      { deliveryPersonId }
    );
    return response.data;
  },

  /**
   * Get orders assigned to currently logged-in delivery user
   */
  async getMyAssignedOrders(params?: PaginationParams & { status?: string; excludeStatus?: string; dateFrom?: string; dateTo?: string; search?: string; assignmentFilter?: string }) {
    const response = await axiosInstance.get<ApiResponse<Order[]>>('/admin/orders/my-assigned', { params });
    return response.data;
  },

  /**
   * Delivery user marks assigned order as delivered
   */
  async markDeliveredByDelivery(orderId: string, notes?: string) {
    const response = await axiosInstance.patch<ApiResponse<Order>>(
      `/admin/orders/${orderId}/delivered-by-delivery`,
      { notes }
    );
    return response.data;
  },

  /**
   * Get delivery users available for assignment
   */
  async getDeliveryUsers() {
    const response = await axiosInstance.get('/admin/orders/delivery-users');
    return response.data;
  },

  async getDeliveryDashboard() {
    const response = await axiosInstance.get('/admin/orders/delivery-dashboard');
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
