import { supabase, isSupabaseConfigured } from './supabase';
import type { Report, CreateReportInput } from '@/types/navigation';

export async function createReport(
  input: CreateReportInput,
  reporterId: string
): Promise<{ data: Report | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data, error } = await supabase!
      .from('reports')
      .insert({
        reporter_id: reporterId,
        product_id: input.productId,
        seller_id: input.sellerId,
        reason: input.reason,
        description: input.description,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as unknown as Report, error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to submit report.',
    };
  }
}
