import { PaymentMethodType } from './user';

export type TransactionType = 
  | 'order_payment' 
  | 'refund' 
  | 'wallet_topup' 
  | 'wallet_withdrawal';

export type TransactionStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled' 
  | 'refunded';

export interface Transaction {
  id: string;
  transactionId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethodType;
  userId: string;
  userName: string;
  userEmail: string;
  orderId?: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date | string;
  updatedAt?: Date | string;
  completedAt?: Date | string;
  failureReason?: string;
}
