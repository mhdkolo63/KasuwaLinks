import { supabase, isSupabaseConfigured } from './supabase';
import { PAGINATION } from '@/constants/config';
import type {
  Product,
  ProductListItem,
  ProductFilters,
  CreateProductInput,
} from '@/types/product';

export async function getProducts(
  filters?: ProductFilters,
  page: number = 0,
  pageSize: number = PAGINATION.defaultPageSize
): Promise<{ data: ProductListItem[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    let query = supabase!
      .from('products')
      .select('*')
      .eq('status', 'active')
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (filters?.search) {
      query = query.ilike('title', `%${filters.search}%`);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.location) {
      query = query.eq('location', filters.location);
    }
    if (filters?.minPrice !== undefined) {
      query = query.gte('price', filters.minPrice);
    }
    if (filters?.maxPrice !== undefined) {
      query = query.lte('price', filters.maxPrice);
    }
    if (filters?.condition) {
      query = query.eq('condition', filters.condition);
    }

    switch (filters?.sortBy) {
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'price-low':
        query = query.order('price', { ascending: true });
        break;
      case 'price-high':
        query = query.order('price', { ascending: false });
        break;
      case 'popular':
        query = query.order('views', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) return { data: [], error: error.message };

    const items: ProductListItem[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      price: row.price as number,
      currency: row.currency as string,
      categoryId: row.category_id as string,
      condition: row.condition as ProductListItem['condition'],
      status: row.status as ProductListItem['status'],
      location: row.location as string,
      sellerId: row.seller_id as string,
      imageUrl: row.image_url as string | undefined,
      featured: row.featured as boolean,
      views: row.views as number,
      createdAt: row.created_at as string,
    }));

    return { data: items, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch products.',
    };
  }
}

export async function getProductById(id: string): Promise<{ data: Product | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };

    return { data: data as unknown as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch product.',
    };
  }
}

export async function getFeaturedProducts(limit: number = 10): Promise<{ data: ProductListItem[]; error: string | null }> {
  return getProducts({ sortBy: 'popular' }, 0, limit);
}

export async function getRecentProducts(limit: number = 10): Promise<{ data: ProductListItem[]; error: string | null }> {
  return getProducts({ sortBy: 'newest' }, 0, limit);
}

export async function getProductsBySeller(
  sellerId: string,
  page: number = 0,
  pageSize: number = PAGINATION.defaultPageSize
): Promise<{ data: ProductListItem[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('seller_id', sellerId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) return { data: [], error: error.message };

    const items: ProductListItem[] = (data ?? []).map((row: Record<string, unknown>) => ({
      id: row.id as string,
      title: row.title as string,
      price: row.price as number,
      currency: row.currency as string,
      categoryId: row.category_id as string,
      condition: row.condition as ProductListItem['condition'],
      status: row.status as ProductListItem['status'],
      location: row.location as string,
      sellerId: row.seller_id as string,
      imageUrl: row.image_url as string | undefined,
      featured: row.featured as boolean,
      views: row.views as number,
      createdAt: row.created_at as string,
    }));

    return { data: items, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch seller products.',
    };
  }
}

export async function createProduct(
  input: CreateProductInput,
  sellerId: string
): Promise<{ data: Product | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('products')
      .insert({
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency,
        category_id: input.categoryId,
        condition: input.condition,
        location: input.location,
        seller_id: sellerId,
        status: 'active',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create product.',
    };
  }
}

export async function incrementViews(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase!.rpc('increment_product_views', { product_id: productId });
  } catch {
    // no-op — non-critical
  }
}
