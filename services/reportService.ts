import { supabase, isSupabaseConfigured } from './supabase';
import type { Report, CreateReportInput } from '@/types/navigation';
import type { ReportRow } from '@/types/database';

// =============================================================================
// MAPPING HELPER
// =============================================================================

function mapReportRow(row: ReportRow): Report {
  return {
    id: row.id,
    reporterId: row.reporter_id,
    productId: row.product_id ?? undefined,
    reportedUserId: row.reported_user_id ?? undefined,
    reason: row.reason as Report['reason'],
    details: row.details ?? undefined,
    status: row.status,
    createdAt: row.created_at,
  };
}

// =============================================================================
// CREATE REPORT
// =============================================================================

export async function createReport(
  input: CreateReportInput
): Promise<{ data: Report | null; error: string | null }> {
  if (!isSupabaseConfigured) return { data: null, error: 'Supabase is not configured.' };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: null, error: 'You must be signed in to submit a report.' };

    const { data, error } = await supabase!
      .from('reports')
      .insert({
        reporter_id: userData.user.id,
        product_id: input.productId ?? null,
        reported_user_id: input.reportedUserId ?? null,
        reason: input.reason,
        details: input.details ?? null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    return { data: mapReportRow(data as ReportRow), error: null };
  } catch (err) {
    return {
      data: null,
      error: err instanceof Error ? err.message : 'Failed to submit report.',
    };
  }
}

export async function createProductReport(
  productId: string,
  reason: CreateReportInput['reason'],
  details?: string
): Promise<{ data: Report | null; error: string | null }> {
  return createReport({ productId, reason, details });
}

export async function createUserReport(
  reportedUserId: string,
  reason: CreateReportInput['reason'],
  details?: string
): Promise<{ data: Report | null; error: string | null }> {
  return createReport({ reportedUserId, reason, details });
}

// =============================================================================
// READ: USER'S OWN REPORTS
// =============================================================================

export async function getUserReports(): Promise<{ data: Report[]; error: string | null }> {
  if (!isSupabaseConfigured) return { data: [], error: null };

  try {
    const { data: userData } = await supabase!.auth.getUser();
    if (!userData.user) return { data: [], error: 'You must be signed in.' };

    const { data, error } = await supabase!
      .from('reports')
      .select('*')
      .eq('reporter_id', userData.user.id)
      .order('created_at', { ascending: false });

    if (error) return { data: [], error: error.message };

    const rows = (data ?? []) as ReportRow[];
    return { data: rows.map(mapReportRow), error: null };
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err.message : 'Failed to fetch your reports.',
    };
  }
}
