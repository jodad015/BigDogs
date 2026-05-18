import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { WeeklyResultStoreCriteria, WeeklyResultResult } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function weeklyResultStoreHandler(
  db: SupabaseClient,
  criteria: WeeklyResultStoreCriteria,
): Promise<WeeklyResultResult> {
  const rows = criteria.results.map((r) => ({
    participant_id: r.participantId,
    challenge_id: r.challengeId,
    week_number: r.weekNumber,
    week_start_date: r.weekStartDate,
    week_end_date: r.weekEndDate,
    start_trend: r.startTrend,
    end_trend: r.endTrend,
    weekly_loss: r.weeklyLoss,
    performance_ratio: r.performanceRatio,
    performance_factor: r.performanceFactor,
    cumulative_scored_loss: r.cumulativeScoredLoss,
    cumulative_progress_pct: r.cumulativeProgressPct,
    difficulty_multiplier: r.difficultyMultiplier,
    weekly_score: r.weeklyScore,
    placement: r.placement,
    placement_points: r.placementPoints,
    is_showdown: r.isShowdown,
    is_maintenance: r.isMaintenance,
  }));

  const { error } = await db
    .from('weekly_results')
    .upsert(rows, { onConflict: 'participant_id,week_number' });

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return { weekResults: criteria.results };
}
