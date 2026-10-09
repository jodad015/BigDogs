import { useCallback } from 'react';
import type { Player } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

const DUPLICATE_NAME = { '23505': 'Someone with that name is already on the roster' };

export function usePlayers(orgId: string) {
  const { user } = useAuth();
  const fetcher = useCallback(
    () => supabase.from('players').select('*').eq('org_id', orgId).order('display_name'),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<Player[]>(fetcher);

  const players = data ?? [];
  const myPlayer = players.find((p) => p.user_id === user?.id) ?? null;

  const run = async (
    op: PromiseLike<{ error: { code?: string; message: string } | null }>,
    messages?: Record<string, string>,
  ) => {
    const { error: err } = await op;
    if (!err) await refetch();
    return { error: friendlyError(err, messages) };
  };

  return {
    players,
    myPlayer,
    error,
    isLoading,
    refetch,
    addPlayer: async (displayName: string, avatar: string) => {
      const { data: player, error: err } = await supabase
        .from('players')
        .insert({ org_id: orgId, display_name: displayName, avatar })
        .select()
        .single();
      if (!err) await refetch();
      return { player, error: friendlyError(err, DUPLICATE_NAME) };
    },
    updatePlayer: (id: string, updates: { display_name?: string; avatar?: string }) =>
      run(supabase.from('players').update(updates).eq('id', id), DUPLICATE_NAME),
    deletePlayer: (id: string) => run(supabase.from('players').delete().eq('id', id)),
    claimPlayer: (id: string) => run(supabase.rpc('claim_player', { p_player_id: id })),
    unlinkPlayer: (id: string) =>
      run(supabase.from('players').update({ user_id: null }).eq('id', id)),
    createMyPlayer: () => run(supabase.rpc('ensure_my_player', { p_org_id: orgId })),
  };
}
