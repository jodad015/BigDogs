import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ChallengeLoadCriteria, ChallengeResult, ChallengeRow } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function challengeLoadHandler(
  db: SupabaseClient,
  criteria: ChallengeLoadCriteria,
): Promise<ChallengeResult> {
  let query = db.from('challenges').select('*');

  if (criteria.id) {
    query = query.eq('id', criteria.id);
  }
  if (criteria.inviteCode) {
    query = query.eq('invite_code', criteria.inviteCode);
  }
  if (criteria.status) {
    if (Array.isArray(criteria.status)) {
      query = query.in('status', criteria.status);
    } else {
      query = query.eq('status', criteria.status);
    }
  }
  if (criteria.isPublic !== undefined) {
    query = query.eq('is_public', criteria.isPublic);
  }
  if (criteria.createdBy) {
    query = query.eq('created_by', criteria.createdBy);
  }

  const { data, error } = await query;

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    challenges: (data ?? []).map((r: any) => ({
      id: r.id,
      createdBy: r.created_by,
      name: r.name,
      inviteCode: r.invite_code,
      durationWeeks: r.duration_weeks,
      showdownsEnabled: r.showdowns_enabled,
      isPublic: r.is_public,
      timezone: r.timezone,
      startDate: r.start_date,
      spinupStartDate: r.spinup_start_date,
      status: r.status,
    })) as ChallengeRow[],
  };
}
