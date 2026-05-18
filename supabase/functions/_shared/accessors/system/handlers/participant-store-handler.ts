import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ParticipantStoreCriteria, ParticipantResult } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function participantStoreHandler(
  db: SupabaseClient,
  criteria: ParticipantStoreCriteria,
): Promise<ParticipantResult> {
  const row: Record<string, unknown> = {
    challenge_id: criteria.challengeId,
    user_id: criteria.userId,
  };

  if (criteria.status !== undefined) row.status = criteria.status;
  if (criteria.startingWeight !== undefined) row.starting_weight = criteria.startingWeight;
  if (criteria.targetWeight !== undefined) row.target_weight = criteria.targetWeight;
  if (criteria.weeklyTarget !== undefined) row.weekly_target = criteria.weeklyTarget;
  if (criteria.goalMethod !== undefined) row.goal_method = criteria.goalMethod;
  if (criteria.goalInput !== undefined) row.goal_input = criteria.goalInput;
  if (criteria.totalLoss !== undefined) row.total_loss = criteria.totalLoss;

  const upsertOptions = criteria.id
    ? { onConflict: 'id' as const }
    : { onConflict: 'challenge_id,user_id' as const };

  if (criteria.id) row.id = criteria.id;

  const { data, error } = await db
    .from('participants')
    .upsert(row, upsertOptions)
    .select('id, challenge_id, user_id, starting_weight, target_weight, weekly_target, total_loss, goal_method, status')
    .single();

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    participants: [
      {
        id: data.id,
        challengeId: data.challenge_id,
        userId: data.user_id,
        startingWeight: data.starting_weight,
        targetWeight: data.target_weight,
        weeklyTarget: data.weekly_target,
        totalLoss: data.total_loss,
        goalMethod: data.goal_method,
        status: data.status,
      },
    ],
  };
}
