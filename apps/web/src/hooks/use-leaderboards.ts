import { useCallback } from 'react';
import type { Leaderboard, TablesInsert, TablesUpdate } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

type BoardFields = Omit<TablesInsert<'leaderboards'>, 'org_id'>;

/** All leaderboards in an org, newest first. Archived boards are included. */
export function useLeaderboards(orgId: string) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('leaderboards')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false }),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<Leaderboard[]>(fetcher);

  const createBoard = async (fields: BoardFields) => {
    const { data: board, error: err } = await supabase
      .from('leaderboards')
      .insert({ ...fields, org_id: orgId })
      .select()
      .single();
    if (!err) await refetch();
    return { board, error: friendlyError(err) };
  };

  return { boards: data ?? [], error, isLoading, refetch, createBoard };
}

/** One leaderboard, plus whether it already has entries (which locks its shape). */
export function useLeaderboard(boardId: string) {
  const fetcher = useCallback(
    () => supabase.from('leaderboards').select('*, entries(count)').eq('id', boardId).maybeSingle(),
    [boardId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery(fetcher);

  const { entries, ...row } = data ?? { entries: [] };
  const board: Leaderboard | null = data ? (row as Leaderboard) : null;
  const entryCount = entries[0]?.count ?? 0;

  const updateBoard = async (updates: TablesUpdate<'leaderboards'>) => {
    const { error: err } = await supabase.from('leaderboards').update(updates).eq('id', boardId);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  const deleteBoard = async () => {
    const { error: err } = await supabase.from('leaderboards').delete().eq('id', boardId);
    return { error: friendlyError(err) };
  };

  return { board, entryCount, error, isLoading, refetch, updateBoard, deleteBoard };
}
