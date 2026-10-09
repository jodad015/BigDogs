import { useCallback } from 'react';
import type { Player } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export interface TeamWithMembers {
  id: string;
  name: string | null;
  player_ids: string[];
  entry_count: number;
}

/** A team's display name: its own name, or its players joined with "&". */
export function teamName(
  team: Pick<TeamWithMembers, 'name' | 'player_ids'>,
  players: Player[],
): string {
  if (team.name) return team.name;
  const names = team.player_ids
    .map((id) => players.find((p) => p.id === id)?.display_name)
    .filter(Boolean)
    .sort();
  return names.length ? names.join(' & ') : 'Team';
}

/** The existing team with exactly these players, if any. Teams are identified by roster. */
export function findTeamByRoster(
  teams: TeamWithMembers[],
  playerIds: string[],
): TeamWithMembers | undefined {
  const key = [...playerIds].sort().join(',');
  return teams.find((t) => [...t.player_ids].sort().join(',') === key);
}

export function useTeams(orgId: string) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('teams')
        .select('id, name, team_members(player_id), entries(count)')
        .eq('org_id', orgId),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery(fetcher);

  const teams: TeamWithMembers[] = (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    player_ids: t.team_members.map((m) => m.player_id),
    entry_count: t.entries[0]?.count ?? 0,
  }));

  /** Reuses an existing team when the roster matches; a name is only applied to unnamed teams. */
  const findOrCreateTeam = async (playerIds: string[], name?: string | null) => {
    const { data: teamId, error: err } = await supabase.rpc('find_or_create_team', {
      p_org_id: orgId,
      p_player_ids: playerIds,
      p_name: name?.trim() || undefined,
    });
    if (!err) await refetch();
    return { teamId, error: friendlyError(err) };
  };

  const renameTeam = async (id: string, name: string | null) => {
    const { error: err } = await supabase
      .from('teams')
      .update({ name: name?.trim() || null })
      .eq('id', id);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  const deleteTeam = async (id: string) => {
    const { error: err } = await supabase.from('teams').delete().eq('id', id);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  return { teams, error, isLoading, refetch, findOrCreateTeam, renameTeam, deleteTeam };
}
