export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  description?: string;
  isActive: boolean;
  productCount: number;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  productCount: number;
  image?: string;
  subcategories?: Subcategory[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateSubcategoryDto {
  categoryId: string;
  name: string;
  description?: string;
  isActive?: boolean;
  image?: string;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  isActive?: boolean;
  image?: string;
}
