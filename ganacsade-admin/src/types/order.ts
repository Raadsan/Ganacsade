import { Address, PaymentMethod } from './user';
import { Product, ProductVariant } from './product';

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'ready_for_pickup'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
  variantId?: string;
  variant?: ProductVariant;
  addedAt?: Date | string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: Date | string;
  notes: string;
  updatedBy: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: CartItem[];
  shippingAddress: Address;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  statusHistory: OrderStatusHistory[];
  notes: string;
  trackingNumber: string;
  estimatedDelivery?: Date | string;
  actualDelivery?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface UpdateOrderStatusDto {
  orderId: string;
  status: OrderStatus;
  notes?: string;
}
