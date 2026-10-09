import { useCallback } from 'react';
import type { Player } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export interface TeamWithMembers {
  id: string;
  name: string | null;
  player_ids: string[];
}

/** A team's display name: its own name, or its players joined with "&". */
export function teamName(team: TeamWithMembers, players: Player[]): string {
  if (team.name) return team.name;
  const names = team.player_ids
    .map((id) => players.find((p) => p.id === id)?.display_name)
    .filter(Boolean)
    .sort();
  return names.length ? names.join(' & ') : 'Team';
}

export function useTeams(orgId: string) {
  const fetcher = useCallback(
    () => supabase.from('teams').select('id, name, team_members(player_id)').eq('org_id', orgId),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery(fetcher);

  const teams: TeamWithMembers[] = (data ?? []).map((t) => ({
    id: t.id,
    name: t.name,
    player_ids: t.team_members.map((m) => m.player_id),
  }));

  /** Teams are identified by roster, so this reuses an existing team when one matches. */
  const findOrCreateTeam = async (playerIds: string[]) => {
    const { data: teamId, error: err } = await supabase.rpc('find_or_create_team', {
      p_org_id: orgId,
      p_player_ids: playerIds,
    });
    if (!err) await refetch();
    return { teamId, error: friendlyError(err) };
  };

  return { teams, error, isLoading, refetch, findOrCreateTeam };
}
