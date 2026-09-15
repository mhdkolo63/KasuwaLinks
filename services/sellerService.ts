import { supabase, isSupabaseConfigured } from './supabase';
import type { Seller, CreateSellerInput } from '@/types/seller';

export async function getSellerById(id: string): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('sellers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return { data: null, error: error.message };

    return { data: data as unknown as Seller, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch seller.',
    };
  }
}

export async function getSellerByUserId(userId: string): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('sellers')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) return { data: null, error: error.message };

    return { data: data as unknown as Seller, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch seller.',
    };
  }
}

export async function createSeller(
  input: CreateSellerInput,
  userId: string,
  email: string
): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('sellers')
      .insert({
        user_id: userId,
        store_name: input.storeName,
        full_name: input.fullName,
        email,
        phone: input.phone,
        location: input.location,
        bio: input.bio,
        verified: false,
        rating: 0,
        total_listings: 0,
        total_sales: 0,
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Seller, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to create seller profile.',
    };
  }
}

export async function updateSeller(
  id: string,
  updates: Partial<CreateSellerInput>
): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('sellers')
      .update({
        store_name: updates.storeName,
        full_name: updates.fullName,
        phone: updates.phone,
        location: updates.location,
        bio: updates.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Seller, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update seller.',
    };
  }
}
