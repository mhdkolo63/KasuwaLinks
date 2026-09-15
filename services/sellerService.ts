import { supabase, isSupabaseConfigured } from './supabase';
import type { Seller, UpdateSellerInput } from '@/types/seller';
import type { ProfileRow, StateRow, CityRow } from '@/types/database';
import { mapProfileRowToSeller } from '@/types/seller';

// =============================================================================
// READ: SELLER PROFILE
// =============================================================================

export async function getSellerById(id: string): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Seller not found.' };

    const profile = data as ProfileRow;
    const locationLabel = await resolveLocationLabel(profile.state_id, profile.city_id);

    return { data: mapProfileRowToSeller(profile, locationLabel), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch seller.',
    };
  }
}

export async function getCurrentProfile(): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: null, error: 'You must be signed in.' };

    return getSellerById(userData.user.id);
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to fetch your profile.',
    };
  }
}

// =============================================================================
// UPDATE: CURRENT USER'S PROFILE
// =============================================================================

export async function updateCurrentProfile(
  updates: UpdateSellerInput
): Promise<{ data: Seller | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: null, error: 'You must be signed in.' };

    const updateData: Record<string, unknown> = {};
    if (updates.fullName !== undefined) updateData.full_name = updates.fullName;
    if (updates.username !== undefined) updateData.username = updates.username;
    if (updates.phone !== undefined) updateData.phone = updates.phone;
    if (updates.bio !== undefined) updateData.bio = updates.bio;
    if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
    if (updates.stateId !== undefined) updateData.state_id = updates.stateId;
    if (updates.cityId !== undefined) updateData.city_id = updates.cityId;
    if (updates.isSeller !== undefined) updateData.is_seller = updates.isSeller;

    const { data, error } = await supabase!
      .from('profiles')
      .update(updateData)
      .eq('id', userData.user.id)
      .select()
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (!data) return { data: null, error: 'Profile not found.' };

    const profile = data as ProfileRow;
    const locationLabel = await resolveLocationLabel(profile.state_id, profile.city_id);

    return { data: mapProfileRowToSeller(profile, locationLabel), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to update profile.',
    };
  }
}

// =============================================================================
// HELPER: RESOLVE LOCATION LABEL FROM STATE + CITY
// =============================================================================

async function resolveLocationLabel(stateId: string | null, cityId: string | null): Promise<string> {
  if (!stateId && !cityId) return 'Nigeria';

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

    return label || 'Nigeria';
  } catch {
    return 'Nigeria';
  }
}
