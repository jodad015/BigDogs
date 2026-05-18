import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { WeeklyResultLoadCriteria, WeeklyResultResult, WeeklyResultRow } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function weeklyResultLoadHandler(
  db: SupabaseClient,
  criteria: WeeklyResultLoadCriteria,
): Promise<WeeklyResultResult> {
  let query = db.from('weekly_results').select('*');

  if (criteria.challengeId) {
    query = query.eq('challenge_id', criteria.challengeId);
  }
  if (criteria.participantId) {
    query = query.eq('participant_id', criteria.participantId);
  }
  if (criteria.weekNumber !== undefined) {
    query = query.eq('week_number', criteria.weekNumber);
  }

  query = query.order('week_number', { ascending: true });

  const { data, error } = await query;

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    weekResults: (data ?? []).map((r: any) => ({
      participantId: r.participant_id,
      challengeId: r.challenge_id,
      weekNumber: r.week_number,
      weekStartDate: r.week_start_date,
      weekEndDate: r.week_end_date,
      startTrend: r.start_trend,
      endTrend: r.end_trend,
      weeklyLoss: r.weekly_loss,
      performanceRatio: r.performance_ratio,
      performanceFactor: r.performance_factor,
      cumulativeScoredLoss: r.cumulative_scored_loss,
      cumulativeProgressPct: r.cumulative_progress_pct,
      difficultyMultiplier: r.difficulty_multiplier,
      weeklyScore: r.weekly_score,
      placement: r.placement,
      placementPoints: r.placement_points,
      isShowdown: r.is_showdown,
      isMaintenance: r.is_maintenance,
    })) as WeeklyResultRow[],
  };
}
