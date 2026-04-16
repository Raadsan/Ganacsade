export type ProductStatus = 'active' | 'inactive' | 'draft' | 'archived';

export interface ProductVariant {
  id: string;
  name: string;
  nameAr: string;
  nameSo: string;
  price: number;
  discountPrice?: number;
  inStock: boolean;
  stockQuantity: number;
  sku: string;
  attributes?: Record<string, string>;
}

export interface Product {
  id: string;
  name: string;
  nameAr: string;
  nameSo: string;
  description: string;
  descriptionAr: string;
  descriptionSo: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  images: string[];
  discountPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  brand: string;
  sku: string;
  tags: string[];
  variants: ProductVariant[];
  status: ProductStatus;
  isFeatured: boolean;
  isHalal: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  metadata?: Record<string, any>;
}

export interface CreateProductDto {
  name: string;
  nameAr: string;
  nameSo: string;
  description: string;
  descriptionAr: string;
  descriptionSo: string;
  price: number;
  categoryId: string;
  subcategoryId?: string;
  images: string[];
  discountPrice?: number;
  stockQuantity: number;
  brand: string;
  sku: string;
  tags?: string[];
  variants?: ProductVariant[];
  status?: ProductStatus;
  isFeatured?: boolean;
  isHalal?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {
  id: string;
}
