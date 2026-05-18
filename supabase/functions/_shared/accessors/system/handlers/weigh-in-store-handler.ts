import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { WeighInStoreCriteria, WeighInResult } from '../types.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

export async function weighInStoreHandler(
  db: SupabaseClient,
  criteria: WeighInStoreCriteria,
): Promise<WeighInResult> {
  const { data, error } = await db
    .from('weigh_ins')
    .upsert(
      {
        user_id: criteria.userId,
        date: criteria.date,
        weight: criteria.weight,
        trend_weight: criteria.trendWeight ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,date' },
    )
    .select('id, user_id, date, weight, trend_weight, created_at')
    .single();

  if (error) {
    return { errors: [{ code: ErrorCode.InternalError, message: error.message }] };
  }

  return {
    weighIn: {
      id: data.id,
      userId: data.user_id,
      date: data.date,
      weight: data.weight,
      trendWeight: data.trend_weight,
      createdAt: data.created_at,
    },
  };
}
