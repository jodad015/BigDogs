import type { Database } from './database';

export type { Database, Json } from './database';

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Profile = Tables<'profiles'>;
export type Organization = Tables<'organizations'>;
export type OrgMember = Tables<'org_members'>;
export type Player = Tables<'players'>;
export type Team = Tables<'teams'>;
export type TeamMember = Tables<'team_members'>;
export type Leaderboard = Tables<'leaderboards'>;
export type Entry = Tables<'entries'>;
export type OrgInvite = Tables<'org_invites'>;
export type DisplayLink = Tables<'display_links'>;

/**
 * A row from leaderboard_standings(). Generated function types can't express
 * nullability, so the nullable columns are corrected here.
 */
export interface Standing {
  rank: number;
  player_id: string | null;
  team_id: string | null;
  score: number;
  made: number | null;
  attempts: number | null;
  entry_count: number;
  last_achieved_at: string;
}

/** The JSON returned by get_display(token) for the TV view. */
export interface DisplayStanding {
  id: string;
  rank: number;
  name: string;
  avatars: string[];
  score: number;
  made: number | null;
  attempts: number | null;
  entry_count: number;
  last_achieved_at: string;
}

export interface DisplayBoard {
  id: string;
  name: string;
  icon: string;
  description: string | null;
  metric_type: string;
  unit: string;
  decimals: number;
  direction: string;
  aggregation: string;
  window: string;
  entrant_type: string;
  standings: DisplayStanding[];
}

export interface DisplayData {
  org: { name: string; slug: string; timezone: string };
  display_name: string;
  generated_at: string;
  leaderboards: DisplayBoard[];
}
