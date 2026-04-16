export * from './product';
export * from './order';
export * from './user';
export * from './category';
export * from './flash-sale';
export * from './advertisement';
export * from './transaction';
export * from './settings';
export * from './common';

// Additional types for admin-specific features
export interface Brand {
  id: string;
  name: string;
  description: string;
  logo: string;
  productCount: number;
  isActive: boolean;
  createdAt?: Date | string;
}

export interface FeaturedProduct {
  id: string;
  productId: string;
  priority: number;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive: boolean;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'manager';
  isActive: boolean;
  createdAt: Date | string;
}
