import type { ProfileRow } from '@/types/database';

// =============================================================================
// SELLER / PROFILE TYPES
// The seller is a profile row where is_seller = true.
// The SellerCard and seller screen use these app-facing types.
// =============================================================================

export interface Seller {
  id: string;
  storeName: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  location: string;
  stateId: string | null;
  cityId: string | null;
  isSeller: boolean;
  isVerified: boolean;
  joinedAt: string;
}

export interface UpdateSellerInput {
  fullName?: string;
  username?: string;
  phone?: string;
  bio?: string;
  avatarUrl?: string;
  stateId?: string | null;
  cityId?: string | null;
  isSeller?: boolean;
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
}

// =============================================================================
// MAPPING HELPER
// =============================================================================

export function mapProfileRowToSeller(row: ProfileRow, locationLabel: string): Seller {
  return {
    id: row.id,
    storeName: row.username ?? row.full_name ?? 'KasuwaLink Seller',
    fullName: row.full_name ?? '',
    avatarUrl: row.avatar_url ?? undefined,
    bio: row.bio ?? undefined,
    location: locationLabel,
    stateId: row.state_id,
    cityId: row.city_id,
    isSeller: row.is_seller,
    isVerified: row.is_verified,
    joinedAt: row.created_at,
  };
}
