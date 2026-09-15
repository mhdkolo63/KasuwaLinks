import { supabase, isSupabaseConfigured } from './supabase';
import { CATEGORIES } from '@/constants/categories';
import type { Category } from '@/types/product';
import type { CategoryRow } from '@/types/database';
import { mapCategoryRow } from '@/types/product';

// =============================================================================
// LOCAL FALLBACK CATEGORIES
// =============================================================================

export function getLocalCategories(): Category[] {
  return CATEGORIES.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.id,
    icon: c.icon,
    description: c.description,
    isActive: true,
    sortOrder: 0,
  }));
}

export function getLocalCategoryById(id: string): Category | undefined {
  return getLocalCategories().find((c) => c.id === id || c.slug === id);
}

// =============================================================================
// READ: CATEGORIES FROM SUPABASE
// =============================================================================

export async function getCategories(): Promise<{ data: Category[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: getLocalCategories(), error: null };

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) return { data: getLocalCategories(), error: error.message };

    if (!data || data.length === 0) return { data: getLocalCategories(), error: null };

    const rows = data as CategoryRow[];
    return { data: rows.map(mapCategoryRow), error: null };
  } catch {
    return { data: getLocalCategories(), error: null };
  }
}

export async function getCategoryById(id: string): Promise<{ data: Category | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    const local = getLocalCategoryById(id);
    return { data: local ?? null, error: null };
  }

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Category not found.' };

    return { data: mapCategoryRow(data as CategoryRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch category.',
    };
  }
}

export async function getCategoryBySlug(slug: string): Promise<{ data: Category | null; error: string | null }> {
  if (!isSupabaseConfigured) {
    const local = getLocalCategoryById(slug);
    return { data: local ?? null, error: null };
  }

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Category not found.' };

    return { data: mapCategoryRow(data as CategoryRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch category.',
    };
  }
}
