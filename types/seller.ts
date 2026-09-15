export interface Seller {
  id: string;
  userId: string;
  storeName: string;
  fullName: string;
  email: string;
  phone?: string;
  location: string;
  avatarUrl?: string;
  bio?: string;
  verified: boolean;
  rating: number;
  totalListings: number;
  totalSales: number;
  joinedAt: string;
}

export interface CreateSellerInput {
  storeName: string;
  fullName: string;
  phone?: string;
  location: string;
  bio?: string;
}

export interface SellerStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  rating: number;
}
