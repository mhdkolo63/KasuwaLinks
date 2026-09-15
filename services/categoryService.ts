import { supabase, isSupabaseConfigured } from './supabase';
import { CATEGORIES } from '@/constants/categories';
import type { Category } from '@/types/product';

export function getLocalCategories(): Category[] {
  return CATEGORIES;
}

export function getLocalCategoryById(id: string): Category | undefined {
  return CATEGORIES.find((c) => c.id === id);
}

export async function getCategories(): Promise<{ data: Category[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: CATEGORIES, error: null };

  try {
    const { data, error } = await supabase!
      .from('categories')
      .select('*')
      .order('name', { ascending: true });

    if (error) return { data: CATEGORIES, error: error.message };

    if (!data || data.length === 0) return { data: CATEGORIES, error: null };

    const categories: Category[] = (data as Record<string, unknown>[]).map((row) => ({
      id: row.id as string,
      name: row.name as string,
      icon: (row.icon as string) ?? 'Package',
      description: row.description as string | undefined,
    }));

    return { data: categories, error: null };
  } catch {
    return { data: CATEGORIES, error: null };
  }
}
