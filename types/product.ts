export interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export type ProductCondition =
  | 'new'
  | 'like-new'
  | 'good'
  | 'fair'
  | 'used';

export type ProductStatus =
  | 'active'
  | 'sold'
  | 'pending'
  | 'removed';

export interface ProductImage {
  id: string;
  url: string;
  productId: string;
  position: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: ProductCondition;
  status: ProductStatus;
  location: string;
  sellerId: string;
  images: ProductImage[];
  featured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: ProductCondition;
  status: ProductStatus;
  location: string;
  sellerId: string;
  imageUrl?: string;
  featured: boolean;
  views: number;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: ProductCondition;
  sortBy?: 'newest' | 'oldest' | 'price-low' | 'price-high' | 'popular';
}

export interface CreateProductInput {
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: ProductCondition;
  location: string;
}
