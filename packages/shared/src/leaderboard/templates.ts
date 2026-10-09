import type { Aggregation, Direction, EntrantType, MetricType, TimeWindow } from './config';

export interface LeaderboardTemplate {
  key: string;
  name: string;
  description: string;
  icon: string;
  metric_type: MetricType;
  unit: string;
  decimals: number;
  default_attempts: number | null;
  direction: Direction;
  aggregation: Aggregation;
  default_window: TimeWindow;
  entrant_type: EntrantType;
  team_size: number | null;
}

const base = {
  default_attempts: null,
  default_window: 'all_time',
  entrant_type: 'player',
  team_size: null,
} as const;

/** Starting points for the create-leaderboard flow. Everything stays editable. */
export const LEADERBOARD_TEMPLATES: readonly LeaderboardTemplate[] = [
  {
    ...base,
    key: 'dead-hang',
    name: 'Dead Hang',
    description: 'Longest hang from the bar.',
    icon: '🧗',
    metric_type: 'duration',
    unit: 'sec',
    decimals: 1,
    direction: 'higher_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'pull-ups',
    name: 'Pull-ups',
    description: 'Most strict pull-ups in one set.',
    icon: '💪',
    metric_type: 'count',
    unit: 'reps',
    decimals: 0,
    direction: 'higher_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'putting',
    name: 'Putting',
    description: 'Putts made out of 10.',
    icon: '⛳',
    metric_type: 'made_of_attempts',
    unit: 'putts',
    decimals: 0,
    default_attempts: 10,
    direction: 'higher_better',
    aggregation: 'sum',
    default_window: 'month',
  },
  {
    ...base,
    key: 'free-throws',
    name: 'Free Throws',
    description: 'Shots made out of 10.',
    icon: '🏀',
    metric_type: 'made_of_attempts',
    unit: 'shots',
    decimals: 0,
    default_attempts: 10,
    direction: 'higher_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'plank',
    name: 'Plank',
    description: 'Longest forearm plank.',
    icon: '🪵',
    metric_type: 'duration',
    unit: 'sec',
    decimals: 0,
    direction: 'higher_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'speed-solve',
    name: "Rubik's Cube",
    description: 'Fastest solve wins.',
    icon: '🧊',
    metric_type: 'duration',
    unit: 'sec',
    decimals: 2,
    direction: 'lower_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'paper-plane',
    name: 'Paper Plane',
    description: 'Farthest flight.',
    icon: '✈️',
    metric_type: 'distance',
    unit: 'ft',
    decimals: 1,
    direction: 'higher_better',
    aggregation: 'best',
  },
  {
    ...base,
    key: 'trivia',
    name: 'Trivia',
    description: 'Points add up all week.',
    icon: '🧠',
    metric_type: 'points',
    unit: 'pts',
    decimals: 0,
    direction: 'higher_better',
    aggregation: 'sum',
    default_window: 'week',
  },
  {
    ...base,
    key: 'cornhole',
    name: 'Cornhole Doubles',
    description: 'Average points per game, with a partner.',
    icon: '🌽',
    metric_type: 'points',
    unit: 'pts',
    decimals: 0,
    direction: 'higher_better',
    aggregation: 'average',
    entrant_type: 'team',
    team_size: 2,
  },
];
