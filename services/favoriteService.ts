import { supabase, isSupabaseConfigured } from './supabase';
import type { Favorite } from '@/types/navigation';
import type { FavoriteRow, ProductRow } from '@/types/database';
import { mapProductRowToListItem } from '@/types/product';
import type { ProductListItem } from '@/types/product';

// =============================================================================
// MAPPING HELPER
// =============================================================================

function mapFavoriteRow(row: FavoriteRow): Favorite {
  return {
    id: row.id,
    userId: row.user_id,
    productId: row.product_id,
    createdAt: row.created_at,
  };
}

// =============================================================================
// READ: CURRENT USER'S FAVORITES
// =============================================================================

export async function getFavorites(): Promise<{ data: Favorite[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: [], error: 'You must be signed in.' };

    const { data, error } = await supabase!
      .from('favorites')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as FavoriteRow[];
    return { data: rows.map(mapFavoriteRow), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch favorites.',
    };
  }
}

export async function getFavoriteProducts(): Promise<{ data: ProductListItem[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: [], error: 'You must be signed in.' };

    const { data, error } = await supabase!
      .from('favorites')
      .select('products(*)')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as unknown as { products: ProductRow }[];
    const items: ProductListItem[] = rows
      .map((r) => r.products)
      .filter((p): p is ProductRow => p !== null)
      .map((p) => mapProductRowToListItem(p));

    return { data: items, error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch favorite products.',
    };
  }
}

// =============================================================================
// CHECK IF FAVORITED
// =============================================================================

export async function isFavorited(productId: string): Promise<{ data: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { data: false, error: null };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: false, error: null };

    const { data, error } = await supabase!
      .from('favorites')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('product_id', productId)
      .maybeSingle();

    if (error) return { data: false, error: error.message };

    return { data: data !== null, error: null };
  } catch (err) {
    return {
      data: false,
      error: err instanceof Error ? err.message : 'Failed to check favorite.',
    };
  }
}

// =============================================================================
// ADD / REMOVE FAVORITE
// =============================================================================

export async function addFavorite(productId: string): Promise<{ data: Favorite | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: null, error: 'You must be signed in.' };

    const { data, error } = await supabase!
      .from('favorites')
      .insert({
        user_id: userData.user.id,
        product_id: productId,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    return { data: mapFavoriteRow(data as FavoriteRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to add favorite.',
    };
  }
}

export async function removeFavorite(productId: string): Promise<{ success: boolean; error: string | null }> {
  if (!isSupabaseConfigured) return { success: false, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { success: false, error: 'You must be signed in.' };

    const { error } = await supabase!
      .from('favorites')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('product_id', productId);

    if (error) return { success: false, error: error.message };
    return { success: true, error: null };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to remove favorite.',
    };
  }
}

export async function toggleFavorite(productId: string): Promise<{ data: boolean; error: string | null }> {
  const { data: isFav, error: checkError } = await isFavorited(productId);
  if (checkError) return { data: false, error: checkError };

  if (isFav) {
    const { error: removeError } = await removeFavorite(productId);
    if (removeError) return { data: true, error: removeError };
    return { data: false, error: null };
  } else {
    const { error: addError } = await addFavorite(productId);
    if (addError) return { data: false, error: addError };
    return { data: true, error: null };
  }
}
