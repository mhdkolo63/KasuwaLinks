import type { ProductCondition, ProductStatus, CategoryRow, ProductRow, ProductImageRow } from '@/types/database';

// Re-export shared types for convenience
export type { ProductCondition, ProductStatus } from '@/types/database';

// =============================================================================
// APP-FACING TYPES (camelCase, used by UI components)
// =============================================================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  imageUrl: string;
  storagePath?: string;
  sortOrder: number;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: ProductCondition | null;
  status: ProductStatus;
  sellerId: string;
  stateId: string | null;
  cityId: string | null;
  locationLabel: string;
  isFeatured: boolean;
  viewsCount: number;
  images: ProductImage[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  categoryId: string;
  condition: ProductCondition | null;
  status: ProductStatus;
  sellerId: string;
  stateId: string | null;
  cityId: string | null;
  locationLabel: string;
  isFeatured: boolean;
  viewsCount: number;
  imageUrl?: string;
  createdAt: string;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  stateId?: string;
  cityId?: string;
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
  condition?: ProductCondition;
  stateId?: string;
  cityId?: string;
}

export interface UpdateProductInput {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  categoryId?: string;
  condition?: ProductCondition;
  stateId?: string | null;
  cityId?: string | null;
  status?: ProductStatus;
}

// =============================================================================
// MAPPING HELPERS (snake_case DB row → camelCase app type)
// =============================================================================

export function mapCategoryRow(row: CategoryRow): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    icon: row.icon ?? 'Package',
    description: row.description ?? undefined,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

export function mapProductImageRow(row: ProductImageRow): ProductImage {
  return {
    id: row.id,
    productId: row.product_id,
    imageUrl: row.image_url,
    storagePath: row.storage_path ?? undefined,
    sortOrder: row.sort_order,
  };
}

export function mapProductRow(row: ProductRow, locationLabel: string = ''): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    price: row.price,
    currency: row.currency,
    categoryId: row.category_id,
    condition: row.condition as ProductCondition | null,
    status: row.status,
    sellerId: row.seller_id,
    stateId: row.state_id,
    cityId: row.city_id,
    locationLabel,
    isFeatured: row.is_featured,
    viewsCount: row.views_count,
    images: [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapProductRowToListItem(row: ProductRow, imageUrl?: string, locationLabel: string = ''): ProductListItem {
  return {
    id: row.id,
    title: row.title,
    price: row.price,
    currency: row.currency,
    categoryId: row.category_id,
    condition: row.condition as ProductCondition | null,
    status: row.status,
    sellerId: row.seller_id,
    stateId: row.state_id,
    cityId: row.city_id,
    locationLabel,
    isFeatured: row.is_featured,
    viewsCount: row.views_count,
    imageUrl,
    createdAt: row.created_at,
  };
}
