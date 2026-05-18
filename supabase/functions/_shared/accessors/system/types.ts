import type { ResultBase } from '../../types/result-base.ts';

// ============================================================
// Criteria Type Enum
// ============================================================

export const SystemCriteriaType = {
  WeighInLoad: 'WeighInLoad',
  WeighInStore: 'WeighInStore',
  WeighInDelete: 'WeighInDelete',
  ParticipantLoad: 'ParticipantLoad',
  ParticipantStore: 'ParticipantStore',
  WeeklyResultLoad: 'WeeklyResultLoad',
  WeeklyResultStore: 'WeeklyResultStore',
  ChallengeLoad: 'ChallengeLoad',
} as const;

export type SystemCriteriaType = (typeof SystemCriteriaType)[keyof typeof SystemCriteriaType];

// ============================================================
// Load Criteria
// ============================================================

export interface WeighInLoadCriteria {
  type: typeof SystemCriteriaType.WeighInLoad;
  id?: string;
  userId?: string;
  userIds?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  orderBy?: 'date_asc' | 'date_desc';
}

export interface ParticipantLoadCriteria {
  type: typeof SystemCriteriaType.ParticipantLoad;
  id?: string;
  challengeId?: string;
  userId?: string;
  status?: string | string[];
  includeProfiles?: boolean;
}

export interface WeeklyResultLoadCriteria {
  type: typeof SystemCriteriaType.WeeklyResultLoad;
  challengeId?: string;
  participantId?: string;
  weekNumber?: number;
}

export interface ChallengeLoadCriteria {
  type: typeof SystemCriteriaType.ChallengeLoad;
  id?: string;
  inviteCode?: string;
  status?: string | string[];
  isPublic?: boolean;
  createdBy?: string;
}

// ============================================================
// Store Criteria
// ============================================================

export interface WeighInStoreCriteria {
  type: typeof SystemCriteriaType.WeighInStore;
  userId: string;
  date: string;
  weight: number;
  trendWeight?: number;
}

export interface ParticipantStoreCriteria {
  type: typeof SystemCriteriaType.ParticipantStore;
  id?: string;
  challengeId: string;
  userId: string;
  status?: string;
  startingWeight?: number;
  targetWeight?: number;
  weeklyTarget?: number;
  goalMethod?: string;
  goalInput?: number;
  totalLoss?: number;
}

export interface WeeklyResultStoreCriteria {
  type: typeof SystemCriteriaType.WeeklyResultStore;
  results: WeeklyResultRow[];
}

export interface WeeklyResultRow {
  participantId: string;
  challengeId: string;
  weekNumber: number;
  weekStartDate: string;
  weekEndDate: string;
  startTrend: number;
  endTrend: number;
  weeklyLoss: number;
  performanceRatio: number;
  performanceFactor: number;
  cumulativeScoredLoss: number;
  cumulativeProgressPct: number;
  difficultyMultiplier: number;
  weeklyScore: number;
  placement: number;
  placementPoints: number;
  isShowdown: boolean;
  isMaintenance: boolean;
}

// ============================================================
// Delete Criteria
// ============================================================

export interface WeighInDeleteCriteria {
  type: typeof SystemCriteriaType.WeighInDelete;
  id?: string;
  userId?: string;
  date?: string;
}

// ============================================================
// Union Types
// ============================================================

export type SystemLoadCriteria =
  | WeighInLoadCriteria
  | ParticipantLoadCriteria
  | WeeklyResultLoadCriteria
  | ChallengeLoadCriteria;

export type SystemStoreCriteria =
  | WeighInStoreCriteria
  | ParticipantStoreCriteria
  | WeeklyResultStoreCriteria;

export type SystemDeleteCriteria = WeighInDeleteCriteria;

// ============================================================
// Result Extensions
// ============================================================

export interface WeighInResult extends ResultBase {
  weighIns?: WeighInRow[];
  weighIn?: WeighInRow;
}

export interface WeighInRow {
  id: string;
  userId: string;
  date: string;
  weight: number;
  trendWeight: number | null;
  createdAt: string;
}

export interface ParticipantResult extends ResultBase {
  participants?: ParticipantRow[];
}

export interface ParticipantRow {
  id: string;
  challengeId: string;
  userId: string;
  startingWeight: number | null;
  targetWeight: number | null;
  weeklyTarget: number | null;
  totalLoss: number | null;
  goalMethod: string | null;
  status: string;
  displayName?: string;
  avatar?: string;
}

export interface WeeklyResultResult extends ResultBase {
  weekResults?: WeeklyResultRow[];
}

export interface ChallengeResult extends ResultBase {
  challenges?: ChallengeRow[];
}

export interface ChallengeRow {
  id: string;
  createdBy: string;
  name: string;
  inviteCode: string;
  durationWeeks: number;
  showdownsEnabled: boolean;
  isPublic: boolean;
  timezone: string;
  startDate: string | null;
  spinupStartDate: string | null;
  status: string;
}
