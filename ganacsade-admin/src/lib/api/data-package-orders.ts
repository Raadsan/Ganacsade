import { axiosInstance } from './client';
import { ApiResponse } from '@/types';

export interface DataPackageOrder {
  id: string;
  order_number: string;
  user_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  amount: string | number;
  status: string;
  payment_status: string;
  payment_method?: string;
  payment_transaction_id?: string;
  created_at: string;
  updated_at: string;
  package_name?: string;
  provider_name?: string;
  recipient_phone?: string;
  package_duration?: string;
  package_data?: string;
}

export interface DataPackageOrdersQuery {
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export const dataPackageOrdersApi = {
  async getOrders(params?: DataPackageOrdersQuery) {
    const response = await axiosInstance.get<ApiResponse<DataPackageOrder[]>>(
      '/admin/data-package-orders',
      { params }
    );
    return response.data;
  },

  async getOrder(id: string) {
    const response = await axiosInstance.get<ApiResponse<DataPackageOrder>>(
      `/admin/data-package-orders/${id}`
    );
    return response.data;
  },

  async getStats() {
    const response = await axiosInstance.get<ApiResponse<any>>(
      '/admin/data-package-orders/stats/summary'
    );
    return response.data;
  },
};
