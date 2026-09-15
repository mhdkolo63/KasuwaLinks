import { useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '@/services/supabase';

interface UseSupabaseQueryResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  refetch: () => void;
}

export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[] = []
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => setRefetchCount((c) => c + 1), []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      setData(null);
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    queryFn().then((result) => {
      if (!isMounted) return;
      setData(result.data);
      setError(result.error);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, refetchCount]);

  return { data, error, isLoading, refetch };
}

export { supabase, isSupabaseConfigured };
