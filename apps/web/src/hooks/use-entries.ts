import { useCallback } from 'react';
import type { Entry } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export interface NewEntry {
  player_id: string | null;
  team_id: string | null;
  value: number;
  attempts: number | null;
  achieved_at: string;
  note: string | null;
}

/** Recent entries on a board, newest first. */
export function useEntries(boardId: string, limit = 50) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('entries')
        .select('*')
        .eq('leaderboard_id', boardId)
        .order('achieved_at', { ascending: false })
        .limit(limit),
    [boardId, limit],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<Entry[]>(fetcher);

  const deleteEntry = async (id: string) => {
    const { error: err } = await supabase.from('entries').delete().eq('id', id);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  return { entries: data ?? [], error, isLoading, refetch, deleteEntry };
}

export function useEntry(entryId: string | null) {
  const fetcher = useCallback(
    () =>
      entryId
        ? supabase.from('entries').select('*').eq('id', entryId).maybeSingle()
        : Promise.resolve({ data: null, error: null }),
    [entryId],
  );
  return useSupabaseQuery<Entry>(fetcher);
}

export async function saveEntry(
  board: { id: string; org_id: string },
  entry: NewEntry,
  existingId?: string | null,
) {
  const { error } = existingId
    ? await supabase.from('entries').update(entry).eq('id', existingId)
    : await supabase
        .from('entries')
        .insert({ ...entry, leaderboard_id: board.id, org_id: board.org_id });
  return { error: friendlyError(error) };
}
