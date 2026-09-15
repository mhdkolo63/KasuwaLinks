import { supabase, isSupabaseConfigured } from './supabase';
import { PAGINATION } from '@/constants/config';
import type {
  Product,
  ProductListItem,
  ProductFilters,
  CreateProductInput,
  UpdateProductInput,
  ProductImage,
} from '@/types/product';
import type { ProductRow, ProductImageRow, StateRow, CityRow } from '@/types/database';
import {
  mapProductRow,
  mapProductRowToListItem,
  mapProductImageRow,
} from '@/types/product';

// =============================================================================
// LOCATION RESOLUTION HELPER
// =============================================================================

async function resolveLocationLabel(stateId: string | null, cityId: string | null): Promise<string> {
  if (!stateId && !cityId) return '';

  try {
    let label = '';

    if (cityId) {
      const { data } = await supabase!
        .from('cities')
        .select('name')
        .eq('id', cityId)
        .maybeSingle();
      if (data) label = (data as CityRow).name;
    }

    if (stateId) {
      const { data } = await supabase!
        .from('states')
        .select('name')
        .eq('id', stateId)
        .maybeSingle();
      if (data) {
        const stateName = (data as StateRow).name;
        label = label ? `${label}, ${stateName}` : stateName;
      }
    }

    return label;
  } catch {
    return '';
  }
}

async function resolveLocationLabels(rows: ProductRow[]): Promise<string[]> {
  return Promise.all(rows.map((r) => resolveLocationLabel(r.state_id, r.city_id)));
}

// =============================================================================
// READ: PUBLIC PRODUCT LISTINGS
// =============================================================================

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
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }
    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    if (filters?.stateId) {
      query = query.eq('state_id', filters.stateId);
    }
    if (filters?.cityId) {
      query = query.eq('city_id', filters.cityId);
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
        query = query.order('views_count', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ProductRow[];
    const labels = await resolveLocationLabels(rows);
    const items: ProductListItem[] = rows.map((row, i) => mapProductRowToListItem(row, undefined, labels[i]));

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
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Product not found.' };

    const row = data as ProductRow;
    const locationLabel = await resolveLocationLabel(row.state_id, row.city_id);
    const product = mapProductRow(row, locationLabel);

    // Fetch images for this product
    const { data: imgData, error: imgError } = await supabase!
      .from('product_images')
      .select('*')
      .eq('product_id', id)
      .order('sort_order', { ascending: true });

    if (!imgError && imgData) {
      product.images = (imgData as ProductImageRow[]).map(mapProductImageRow);
    }

    return { data: product, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch product.',
    };
  }
}

export async function getFeaturedProducts(limit: number = 10): Promise<{ data: ProductListItem[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('status', 'active')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ProductRow[];
    const labels = await resolveLocationLabels(rows);
    return { data: rows.map((row, i) => mapProductRowToListItem(row, undefined, labels[i])), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch featured products.',
    };
  }
}

export async function getRecentProducts(limit: number = 10): Promise<{ data: ProductListItem[]; error: string | null }> {
  return getProducts({ sortBy: 'newest' }, 0, limit);
}

// =============================================================================
// READ: SELLER'S PRODUCTS
// =============================================================================

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

    const rows = (data ?? []) as ProductRow[];
    const labels = await resolveLocationLabels(rows);
    return { data: rows.map((row, i) => mapProductRowToListItem(row, undefined, labels[i])), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch seller products.',
    };
  }
}

// =============================================================================
// READ: CURRENT USER'S LISTINGS (all statuses)
// =============================================================================

export async function getUserListings(
  page: number = 0,
  pageSize: number = PAGINATION.defaultPageSize
): Promise<{ data: ProductListItem[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: [], error: 'You must be signed in.' };

    const { data, error } = await supabase!
      .from('products')
      .select('*')
      .eq('seller_id', userData.user.id)
      .order('created_at', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ProductRow[];
    const labels = await resolveLocationLabels(rows);
    return { data: rows.map((row, i) => mapProductRowToListItem(row, undefined, labels[i])), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch your listings.',
    };
  }
}

// =============================================================================
// CREATE / UPDATE / DELETE
// =============================================================================

export async function createProduct(
  input: CreateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: null, error: 'You must be signed in to create a listing.' };

    const { data, error } = await supabase!
      .from('products')
      .insert({
        seller_id: userData.user.id,
        category_id: input.categoryId,
        title: input.title,
        description: input.description,
        price: input.price,
        currency: input.currency,
        condition: input.condition ?? null,
        state_id: input.stateId ?? null,
        city_id: input.cityId ?? null,
        status: 'active',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    const row = data as ProductRow;
    const locationLabel = await resolveLocationLabel(row.state_id, row.city_id);
    return { data: mapProductRow(row, locationLabel), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create product.',
    };
  }
}

export async function updateProduct(
  productId: string,
  updates: UpdateProductInput
): Promise<{ data: Product | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const updateData: Record<string, unknown> = {};
    if (updates.title !== undefined) updateData.title = updates.title;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.condition !== undefined) updateData.condition = updates.condition;
    if (updates.stateId !== undefined) updateData.state_id = updates.stateId;
    if (updates.cityId !== undefined) updateData.city_id = updates.cityId;
    if (updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase!
      .from('products')
      .update(updateData)
      .eq('id', productId)
      .select()
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Product not found or you do not have permission.' };

    const row = data as ProductRow;
    const locationLabel = await resolveLocationLabel(row.state_id, row.city_id);
    return { data: mapProductRow(row, locationLabel), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update product.',
    };
  }
}

export async function deleteProduct(productId: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };

  try {
    const { error } = await supabase!
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product.',
    };
  }
}

export async function markProductStatus(
  productId: string,
  status: 'sold' | 'paused' | 'active'
): Promise<{ data: Product | null; error: string | null }> {
  return updateProduct(productId, { status });
}

// =============================================================================
// VIEWS
// =============================================================================

export async function incrementViews(productId: string): Promise<void> {
  if (!isSupabaseConfigured) return;

  try {
    await supabase!.rpc('increment_product_views', { product_id: productId });
  } catch {
    // non-critical
  }
}

// =============================================================================
// PRODUCT IMAGES
// =============================================================================

export async function getProductImages(productId: string): Promise<{ data: ProductImage[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data, error } = await supabase!
      .from('product_images')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ProductImageRow[];
    return { data: rows.map(mapProductImageRow), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch product images.',
    };
  }
}

export async function addProductImage(
  productId: string,
  imageUrl: string,
  storagePath?: string,
  sortOrder: number = 0
): Promise<{ data: ProductImage | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('product_images')
      .insert({
        product_id: productId,
        image_url: imageUrl,
        storage_path: storagePath ?? null,
        sort_order: sortOrder,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    return { data: mapProductImageRow(data as ProductImageRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to add product image.',
    };
  }
}

export async function deleteProductImage(imageId: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };

  try {
    const { error } = await supabase!
      .from('product_images')
      .delete()
      .eq('id', imageId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to delete product image.',
    };
  }
}
