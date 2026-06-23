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
    const queryParams: Record<string, string | number> = {};
    if (params?.status) queryParams.status = params.status;
    if (params?.search) queryParams.search = params.search;
    if (params?.dateFrom) queryParams.start_date = params.dateFrom;
    if (params?.dateTo) queryParams.end_date = params.dateTo;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    const response = await axiosInstance.get<ApiResponse<DataPackageOrder[]>>(
      '/admin/data-package-orders',
      { params: queryParams }
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
