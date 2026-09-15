import type { Session, User } from '@supabase/supabase-js';

// =============================================================================
// AUTH TYPES
// =============================================================================

export interface AuthSession {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
}

export interface SignUpData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  location?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

// =============================================================================
// DATABASE ROW TYPES (snake_case, matches Supabase schema exactly)
// =============================================================================

export type ProductStatus = 'active' | 'sold' | 'paused' | 'removed' | 'pending_review';
export type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed';
export type ProductCondition = 'new' | 'like-new' | 'good' | 'fair' | 'used';

export interface ProfileRow {
  id: string;
  full_name: string | null;
  username: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  state_id: string | null;
  city_id: string | null;
  is_seller: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface StateRow {
  id: string;
  name: string;
  country: string;
  created_at: string;
}

export interface CityRow {
  id: string;
  state_id: string;
  name: string;
  created_at: string;
}

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface ProductRow {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  condition: string | null;
  state_id: string | null;
  city_id: string | null;
  status: ProductStatus;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  updated_at: string;
}

export interface ProductImageRow {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string | null;
  sort_order: number;
  created_at: string;
}

export interface FavoriteRow {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
}

export interface ReportRow {
  id: string;
  reporter_id: string;
  product_id: string | null;
  reported_user_id: string | null;
  reason: string;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}
