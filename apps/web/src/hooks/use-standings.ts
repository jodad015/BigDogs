import { useCallback, useEffect } from 'react';
import type { Standing, TimeWindow } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useSupabaseQuery } from './use-supabase-query';

export function useStandings(boardId: string, window: TimeWindow) {
  const fetcher = useCallback(
    () =>
      supabase.rpc('leaderboard_standings', {
        p_leaderboard_id: boardId,
        p_window: window,
      }) as unknown as PromiseLike<{ data: Standing[] | null; error: { message: string } | null }>,
    [boardId, window],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<Standing[]>(fetcher);
  return { standings: data ?? [], error, isLoading, refetch };
}

/** Calls onChange whenever an entry on this board is added, edited or deleted. */
export function useEntriesRealtime(boardId: string, onChange: () => void) {
  useEffect(() => {
    const channel = supabase
      .channel(`entries:${boardId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entries', filter: `leaderboard_id=eq.${boardId}` },
        () => onChange(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [boardId, onChange]);
}
