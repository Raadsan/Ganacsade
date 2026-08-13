import { axiosInstance } from './client';

export interface Transaction {
  id: string;
  transaction_id: string;
  type: 'order_payment' | 'refund' | 'wallet_topup' | 'withdrawal';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  amount: number;
  currency: string;
  payment_method: 'waafi_pay' | 'edahab' | 'premier_wallet' | 'evc_plus' | 'credit_card' | 'cash_on_delivery';
  user_id: string;
  user_name?: string;
  user_email?: string;
  order_id?: string;
  order_number?: string;
  description?: string;
  gateway_response?: any;
  metadata?: any;
  failure_reason?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  failed_at?: string;
}

export interface TransactionStats {
  total_transactions: number;
  total_revenue: number;
  total_refunds: number;
  net_revenue: number;
  completed_count: number;
  pending_count: number;
  failed_count: number;
}

export interface CreateTransactionDto {
  type: string;
  amount: number;
  currency?: string;
  paymentMethod: string;
  userId: string;
  userName?: string;
  userEmail?: string;
  orderId?: string;
  description?: string;
  gatewayResponse?: any;
  metadata?: any;
}

export interface TransactionFilters {
  status?: string;
  type?: string;
  payment_method?: string;
  user_id?: string;
  order_id?: string;
  start_date?: string;
  end_date?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const transactionsApi = {
  // Get all transactions with filters
  getTransactions: async (filters?: TransactionFilters) => {
    const response = await axiosInstance.get<Transaction[]>('/admin/transactions', { 
      params: filters 
    });
    return response.data;
  },

  // Get transaction statistics
  getStats: async (startDate?: string, endDate?: string) => {
    const params: any = {};
    if (startDate) params.start_date = startDate;
    if (endDate) params.end_date = endDate;
    
    const response = await axiosInstance.get<TransactionStats>('/admin/transactions/stats', { params });
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id: string) => {
    const response = await axiosInstance.get<Transaction>(`/admin/transactions/${id}`);
    return response.data;
  },

  // Create transaction
  createTransaction: async (data: CreateTransactionDto) => {
    const response = await axiosInstance.post<Transaction>('/admin/transactions', data);
    return response.data;
  },

  // Update transaction status
  updateStatus: async (id: string, status: string, failureReason?: string) => {
    const response = await axiosInstance.put<Transaction>(`/admin/transactions/${id}/status`, {
      status,
      failureReason
    });
    return response.data;
  },

  // Cancel transaction
  cancelTransaction: async (id: string) => {
    const response = await axiosInstance.delete(`/admin/transactions/${id}`);
    return response.data;
  },

  refundTransaction: async (id: string, data: { reason: string; selectedItems: Array<{ id: string; quantity: number }> }) => {
    const response = await axiosInstance.post(`/admin/transactions/${id}/refund`, data);
    return response.data;
  },
};
