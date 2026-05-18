import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ParticipantLoadCriteria, ParticipantResult, ParticipantRow } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function participantLoadHandler(
  db: SupabaseClient,
  criteria: ParticipantLoadCriteria,
): Promise<ParticipantResult> {
  const selectCols = criteria.includeProfiles
    ? 'id, challenge_id, user_id, starting_weight, target_weight, weekly_target, total_loss, goal_method, status, profiles(display_name, avatar)'
    : 'id, challenge_id, user_id, starting_weight, target_weight, weekly_target, total_loss, goal_method, status';

  let query = db.from('participants').select(selectCols);

  if (criteria.id) {
    query = query.eq('id', criteria.id);
  }
  if (criteria.challengeId) {
    query = query.eq('challenge_id', criteria.challengeId);
  }
  if (criteria.userId) {
    query = query.eq('user_id', criteria.userId);
  }
  if (criteria.status) {
    if (Array.isArray(criteria.status)) {
      query = query.in('status', criteria.status);
    } else {
      query = query.eq('status', criteria.status);
    }
  }

  const { data, error } = await query;

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    participants: (data ?? []).map((r: any) => {
      const row: ParticipantRow = {
        id: r.id,
        challengeId: r.challenge_id,
        userId: r.user_id,
        startingWeight: r.starting_weight,
        targetWeight: r.target_weight,
        weeklyTarget: r.weekly_target,
        totalLoss: r.total_loss,
        goalMethod: r.goal_method,
        status: r.status,
      };
      if (r.profiles) {
        row.displayName = r.profiles.display_name;
        row.avatar = r.profiles.avatar;
      }
      return row;
    }),
  };
}
