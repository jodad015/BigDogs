import { useCallback } from 'react';
import { usePlayers } from './use-players';
import { teamName, useTeams } from './use-teams';

export interface Competitor {
  name: string;
  avatars: string[];
  /** True when the signed-in user is this player or on this team. */
  isMe: boolean;
}

/** Players and teams for an org, with a resolver for standings and entries. */
export function useCompetitors(orgId: string) {
  const players = usePlayers(orgId);
  const teams = useTeams(orgId);
  const myPlayerId = players.myPlayer?.id ?? null;

  const resolve = useCallback(
    (playerId: string | null, teamId: string | null): Competitor => {
      if (playerId) {
        const p = players.players.find((x) => x.id === playerId);
        return {
          name: p?.display_name ?? 'Unknown player',
          avatars: [p?.avatar ?? 'slate'],
          isMe: playerId === myPlayerId,
        };
      }
      const t = teams.teams.find((x) => x.id === teamId);
      if (!t) return { name: 'Unknown team', avatars: ['slate'], isMe: false };
      return {
        name: teamName(t, players.players),
        avatars: t.player_ids.map(
          (id) => players.players.find((p) => p.id === id)?.avatar ?? 'slate',
        ),
        isMe: myPlayerId !== null && t.player_ids.includes(myPlayerId),
      };
    },
    [players.players, teams.teams, myPlayerId],
  );

  return {
    players,
    teams,
    resolve,
    isLoading: players.isLoading || teams.isLoading,
    refetch: async () => {
      await Promise.all([players.refetch(), teams.refetch()]);
    },
  };
}
