import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../../types/context.ts';
import type { ResultBase } from '../../../types/result-base.ts';
import type {
  WeighInResult,
  WeighInRow,
  ParticipantResult,
  ParticipantRow,
  ChallengeResult,
  WeeklyResultRow,
} from '../../../accessors/system/types.ts';
import { SystemAccessor } from '../../../accessors/system/system-accessor.ts';
import { SystemCriteriaType } from '../../../accessors/system/types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

interface ComputeWeeklyScoresCriteria {
  type: string;
  challengeId: string;
  weekNumber: number;
}

function computeTrendAtDate(entries: WeighInRow[], targetDate: string): number | null {
  const sorted = entries
    .filter((e) => e.date <= targetDate)
    .sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return null;

  const alpha = 2 / (Math.min(sorted.length, 7) + 1);
  let ema = sorted[0].weight;
  for (let i = 1; i < sorted.length; i++) {
    ema = alpha * sorted[i].weight + (1 - alpha) * ema;
  }
  return Math.round(ema * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isShowdownWeek(weekStartDate: string, weekEndDate: string, durationWeeks: number, weekNumber: number): boolean {
  // Last Friday of each month OR final week
  if (weekNumber === durationWeeks) return true;

  const endDate = new Date(weekEndDate + 'T12:00:00');
  const nextWeekEnd = new Date(endDate);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 7);

  // If this week's end and next week's end are in different months, this is the last week of the month
  return endDate.getMonth() !== nextWeekEnd.getMonth();
}

export async function computeWeeklyScoresHandler(
  db: SupabaseClient,
  _contexts: ContextBase[],
  criteria: ComputeWeeklyScoresCriteria,
): Promise<ResultBase> {
  const accessor = new SystemAccessor(db);

  // Load challenge
  const challengeResult = (await accessor.load({
    type: SystemCriteriaType.ChallengeLoad,
    id: criteria.challengeId,
  })) as ChallengeResult;

  if (challengeResult.errors?.length) return challengeResult;
  const challenge = challengeResult.challenges?.[0];
  if (!challenge) {
    return { errors: [{ code: ErrorCode.NotFound, message: 'Challenge not found' }] };
  }
  if (!challenge.startDate) {
    return { errors: [{ code: ErrorCode.ValidationError, message: 'Challenge has no start date' }] };
  }

  // Calculate week date range
  const startDate = new Date(challenge.startDate + 'T12:00:00');
  const weekStart = new Date(startDate);
  weekStart.setDate(weekStart.getDate() + (criteria.weekNumber - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);

  const weekStartStr = weekStart.toISOString().split('T')[0]!;
  const weekEndStr = weekEnd.toISOString().split('T')[0]!;

  // Load participants
  const participantResult = (await accessor.load({
    type: SystemCriteriaType.ParticipantLoad,
    challengeId: criteria.challengeId,
    status: ['active', 'spinup'],
  })) as ParticipantResult;

  if (participantResult.errors?.length) return participantResult;
  const participants = participantResult.participants ?? [];
  if (participants.length === 0) {
    return { errors: [{ code: ErrorCode.ValidationError, message: 'No active participants' }] };
  }

  // Load weigh-ins for all participants in the week range (plus some before for trend)
  const trendLookback = new Date(weekStart);
  trendLookback.setDate(trendLookback.getDate() - 14);
  const lookbackStr = trendLookback.toISOString().split('T')[0]!;

  const weighInResult = (await accessor.load({
    type: SystemCriteriaType.WeighInLoad,
    userIds: participants.map((p) => p.userId),
    startDate: lookbackStr,
    endDate: weekEndStr,
    orderBy: 'date_asc',
  })) as WeighInResult;

  if (weighInResult.errors?.length) return weighInResult;
  const allWeighIns = weighInResult.weighIns ?? [];

  // Check showdown
  const showdown = isShowdownWeek(weekStartStr, weekEndStr, challenge.durationWeeks, criteria.weekNumber);

  // Compute scores for each participant
  const scored: {
    participant: ParticipantRow;
    weeklyLoss: number;
    performanceRatio: number;
    performanceFactor: number;
    weeklyScore: number;
    startTrend: number;
    endTrend: number;
    isMaintenance: boolean;
  }[] = [];

  for (const participant of participants) {
    const userWeighIns = allWeighIns.filter((w) => w.userId === participant.userId);

    // Get trend at start and end of week
    const startTrend = computeTrendAtDate(userWeighIns, weekStartStr);
    const endTrend = computeTrendAtDate(userWeighIns, weekEndStr);

    if (startTrend === null || endTrend === null) {
      // Not enough data — skip or give 0
      scored.push({
        participant,
        weeklyLoss: 0,
        performanceRatio: 0,
        performanceFactor: 0,
        weeklyScore: 0,
        startTrend: startTrend ?? 0,
        endTrend: endTrend ?? 0,
        isMaintenance: participant.status === 'maintenance',
      });
      continue;
    }

    const weeklyLoss = startTrend - endTrend; // positive = lost weight
    const weeklyTarget = participant.weeklyTarget ?? 1.5;

    const isMaintenance = participant.status === 'maintenance';

    let performanceRatio: number;
    let performanceFactor: number;
    let weeklyScore: number;

    if (isMaintenance) {
      // Maintenance: score based on staying within ±2 lb of target
      const targetWeight = participant.targetWeight ?? endTrend;
      const deviation = Math.abs(endTrend - targetWeight);
      performanceRatio = deviation <= 2 ? 1.0 : 0;
      performanceFactor = performanceRatio;
      weeklyScore = performanceFactor;
    } else {
      performanceRatio = weeklyTarget > 0 ? weeklyLoss / weeklyTarget : 0;
      // Factor: 0 if gained, capped at 1.0 for meeting/exceeding target
      performanceFactor = clamp(performanceRatio, 0, 1.0);
      // Score: factor × difficulty multiplier (1.0 for now)
      weeklyScore = performanceFactor * 1.0;
    }

    scored.push({
      participant,
      weeklyLoss: Math.round(weeklyLoss * 100) / 100,
      performanceRatio: Math.round(performanceRatio * 10000) / 10000,
      performanceFactor: Math.round(performanceFactor * 10000) / 10000,
      weeklyScore: Math.round(weeklyScore * 1000) / 1000,
      startTrend,
      endTrend,
      isMaintenance,
    });
  }

  // Rank by weekly score (descending)
  scored.sort((a, b) => b.weeklyScore - a.weeklyScore);

  // Assign placements and points
  const numParticipants = scored.length;
  const results: WeeklyResultRow[] = scored.map((s, index) => {
    const placement = index + 1;
    let placementPoints = Math.max(numParticipants - index, 1);
    if (s.isMaintenance) placementPoints = 1; // Maintenance gets 1 point
    if (showdown) placementPoints *= 2;

    // Load previous cumulative values (simplified — use 0 for now)
    return {
      participantId: s.participant.id,
      challengeId: criteria.challengeId,
      weekNumber: criteria.weekNumber,
      weekStartDate: weekStartStr,
      weekEndDate: weekEndStr,
      startTrend: s.startTrend,
      endTrend: s.endTrend,
      weeklyLoss: s.weeklyLoss,
      performanceRatio: s.performanceRatio,
      performanceFactor: s.performanceFactor,
      cumulativeScoredLoss: s.weeklyLoss, // TODO: sum with previous weeks
      cumulativeProgressPct: 0, // TODO: compute from total goal
      difficultyMultiplier: 1.0,
      weeklyScore: s.weeklyScore,
      placement,
      placementPoints,
      isShowdown: showdown,
      isMaintenance: s.isMaintenance,
    };
  });

  // Store results
  const storeResult = await accessor.store({
    type: SystemCriteriaType.WeeklyResultStore,
    results,
  });

  if (storeResult.errors?.length) return storeResult;

  return { weekResults: results } as ResultBase;
}
