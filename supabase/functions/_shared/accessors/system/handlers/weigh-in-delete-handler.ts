import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { WeighInDeleteCriteria } from '../types.ts';
import type { ResultBase } from '../../../types/result-base.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function weighInDeleteHandler(
  db: SupabaseClient,
  criteria: WeighInDeleteCriteria,
): Promise<ResultBase> {
  let query = db.from('weigh_ins').delete();

  if (criteria.id) {
    query = query.eq('id', criteria.id);
  }
  if (criteria.userId) {
    query = query.eq('user_id', criteria.userId);
  }
  if (criteria.date) {
    query = query.eq('date', criteria.date);
  }

  const { error } = await query;

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {};
}
