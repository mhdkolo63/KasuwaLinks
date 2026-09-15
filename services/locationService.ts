import { supabase, isSupabaseConfigured } from './supabase';
import type { StateRow, CityRow } from '@/types/database';

export interface StateOption {
  id: string;
  name: string;
}

export interface CityOption {
  id: string;
  stateId: string;
  name: string;
}

export async function getStates(): Promise<{ data: StateOption[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data, error } = await supabase!
      .from('states')
      .select('*')
      .order('name', { ascending: true });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as StateRow[];
    return { data: rows.map((r) => ({ id: r.id, name: r.name })), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch states.',
    };
  }
}

export async function getCitiesByState(stateId: string): Promise<{ data: CityOption[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data, error } = await supabase!
      .from('cities')
      .select('*')
      .eq('state_id', stateId)
      .order('name', { ascending: true });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as CityRow[];
    return { data: rows.map((r) => ({ id: r.id, stateId: r.state_id, name: r.name })), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch cities.',
    };
  }
}
