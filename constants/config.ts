export const APP_CONFIG = {
  appName: 'KasuwaLink',
  tagline: 'Buy and sell locally with confidence.',
  description:
    'KasuwaLink connects buyers and sellers across Kaduna and Northern Nigeria. Browse local listings, find great deals, and sell your items with ease.',
  initialLocation: {
    city: 'Kaduna',
    state: 'Kaduna State',
    country: 'Nigeria',
  },
  locations: [
    'Kaduna',
    'Zaria',
    'Kafanchan',
    'Saminaka',
    'Kachia',
    'Jema\'a',
  ],
  currency: {
    code: 'NGN',
    symbol: '₦',
    locale: 'en-NG',
  },
  contactEmail: 'support@kasuwalink.com',
  version: '1.0.0',
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 50,
} as const;

export const STORAGE_BUCKETS = {
  productImages: 'product-images',
  avatars: 'avatars',
} as const;
