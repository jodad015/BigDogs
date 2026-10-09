// The vocabulary for configuring a leaderboard. These mirror the check
// constraints on public.leaderboards; keep them in sync with the migration.

export const METRIC_TYPES = [
  'duration',
  'count',
  'points',
  'distance',
  'weight',
  'made_of_attempts',
] as const;
export type MetricType = (typeof METRIC_TYPES)[number];

export const DIRECTIONS = ['higher_better', 'lower_better'] as const;
export type Direction = (typeof DIRECTIONS)[number];

export const AGGREGATIONS = ['best', 'sum', 'average', 'latest', 'entry_count'] as const;
export type Aggregation = (typeof AGGREGATIONS)[number];

export const TIME_WINDOWS = ['all_time', 'year', 'quarter', 'month', 'week'] as const;
export type TimeWindow = (typeof TIME_WINDOWS)[number];

export const ENTRANT_TYPES = ['player', 'team'] as const;
export type EntrantType = (typeof ENTRANT_TYPES)[number];

export const ORG_ROLES = ['owner', 'admin', 'member'] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export interface MetricDefinition {
  type: MetricType;
  label: string;
  description: string;
  defaultUnit: string;
  /** Fixed unit choices, or null when the unit is a free-text label (e.g. "reps"). */
  unitOptions: readonly string[] | null;
  defaultDecimals: number;
  defaultDirection: Direction;
  /** made_of_attempts can only rank higher-is-better. */
  directionLocked: boolean;
}

export const METRICS: Record<MetricType, MetricDefinition> = {
  duration: {
    type: 'duration',
    label: 'Time',
    description: 'Longest hang, fastest solve',
    defaultUnit: 'sec',
    unitOptions: ['sec'],
    defaultDecimals: 1,
    defaultDirection: 'higher_better',
    directionLocked: false,
  },
  count: {
    type: 'count',
    label: 'Count',
    description: 'Reps, pull-ups, cups stacked',
    defaultUnit: 'reps',
    unitOptions: null,
    defaultDecimals: 0,
    defaultDirection: 'higher_better',
    directionLocked: false,
  },
  points: {
    type: 'points',
    label: 'Points',
    description: 'Game scores, trivia points',
    defaultUnit: 'pts',
    unitOptions: null,
    defaultDecimals: 0,
    defaultDirection: 'higher_better',
    directionLocked: false,
  },
  distance: {
    type: 'distance',
    label: 'Distance',
    description: 'Paper planes, long jumps',
    defaultUnit: 'ft',
    unitOptions: ['in', 'ft', 'yd', 'mi', 'cm', 'm', 'km'],
    defaultDecimals: 1,
    defaultDirection: 'higher_better',
    directionLocked: false,
  },
  weight: {
    type: 'weight',
    label: 'Weight',
    description: 'Heaviest lift, biggest fish',
    defaultUnit: 'lb',
    unitOptions: ['lb', 'kg'],
    defaultDecimals: 0,
    defaultDirection: 'higher_better',
    directionLocked: false,
  },
  made_of_attempts: {
    type: 'made_of_attempts',
    label: 'X of Y',
    description: 'Putts made, free throws, darts on target',
    defaultUnit: 'shots',
    unitOptions: null,
    defaultDecimals: 0,
    defaultDirection: 'higher_better',
    directionLocked: true,
  },
};

export const DIRECTION_LABELS: Record<Direction, string> = {
  higher_better: 'Higher is better',
  lower_better: 'Lower is better',
};

export const AGGREGATION_LABELS: Record<Aggregation, { label: string; description: string }> = {
  best: { label: 'Best entry', description: 'Your single best attempt counts' },
  sum: { label: 'Total', description: 'Everything you log adds up' },
  average: { label: 'Average', description: 'Your average across entries' },
  latest: { label: 'Most recent', description: 'Only your latest entry counts' },
  entry_count: { label: 'Most entries', description: 'Whoever logs the most wins' },
};

export const WINDOW_LABELS: Record<TimeWindow, string> = {
  all_time: 'All time',
  year: 'This year',
  quarter: 'This quarter',
  month: 'This month',
  week: 'This week',
};

export const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  member: 'Member',
};
