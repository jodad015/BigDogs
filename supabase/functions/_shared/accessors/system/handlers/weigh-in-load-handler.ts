import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { WeighInLoadCriteria, WeighInResult, WeighInRow } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function weighInLoadHandler(
  db: SupabaseClient,
  criteria: WeighInLoadCriteria,
): Promise<WeighInResult> {
  let query = db.from('weigh_ins').select('id, user_id, date, weight, trend_weight, created_at');

  if (criteria.id) {
    query = query.eq('id', criteria.id);
  }
  if (criteria.userId) {
    query = query.eq('user_id', criteria.userId);
  }
  if (criteria.userIds && criteria.userIds.length > 0) {
    query = query.in('user_id', criteria.userIds);
  }
  if (criteria.startDate) {
    query = query.gte('date', criteria.startDate);
  }
  if (criteria.endDate) {
    query = query.lte('date', criteria.endDate);
  }

  const order = criteria.orderBy === 'date_asc' ? true : false;
  query = query.order('date', { ascending: order });

  if (criteria.limit) {
    query = query.limit(criteria.limit);
  }

  const { data, error } = await query;

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    weighIns: (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      date: r.date,
      weight: r.weight,
      trendWeight: r.trend_weight,
      createdAt: r.created_at,
    })) as WeighInRow[],
  };
}
