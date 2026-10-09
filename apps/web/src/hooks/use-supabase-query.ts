import { useCallback, useEffect, useRef, useState } from 'react';

interface QueryResult<T> {
  data: T | null;
  error: { message: string } | null;
}

/**
 * Runs a supabase query on mount and whenever `fetcher` changes. Wrap the
 * fetcher in useCallback so it only changes when its inputs do.
 */
export function useSupabaseQuery<T>(fetcher: () => PromiseLike<QueryResult<T>>) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const latest = useRef(0);

  const refetch = useCallback(async () => {
    const call = ++latest.current;
    const result = await fetcher();
    if (call !== latest.current) return; // a newer fetch superseded this one
    setData(result.data);
    setError(result.error?.message ?? null);
    setIsLoading(false);
  }, [fetcher]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { data, error, isLoading, refetch };
}

/** Turns a Postgres/PostgREST error into something a person can read. */
export function friendlyError(
  err: { code?: string; message: string } | null,
  messages: Record<string, string> = {},
): string | null {
  if (!err) return null;
  if (err.code && messages[err.code]) return messages[err.code]!;
  if (err.code === '42501') return "You don't have permission to do that.";
  return err.message;
}
