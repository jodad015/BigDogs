import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../../types/context.ts';
import type { ResultBase } from '../../../types/result-base.ts';
import type { WeighInResult, WeighInRow } from '../../../accessors/system/types.ts';
import { SystemAccessor } from '../../../accessors/system/system-accessor.ts';
import { SystemCriteriaType } from '../../../accessors/system/types.ts';
import { QueueUtility } from '../../../utilities/queue/queue-utility.ts';
import { QueueName } from '../../../types/queue-names.ts';
import { ErrorCode } from '../../../enums/error-code.ts';

interface WeighInStoreCriteria {
  type: string;
  userId: string;
  date: string;
  weight: number;
}

function computeTrendEMA(entries: WeighInRow[], newWeight: number): number {
  // 7-day exponential moving average
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const weights = sorted.map((e) => e.weight);
  weights.push(newWeight);

  const alpha = 2 / (Math.min(weights.length, 7) + 1);
  let ema = weights[0];
  for (let i = 1; i < weights.length; i++) {
    ema = alpha * weights[i] + (1 - alpha) * ema;
  }
  return Math.round(ema * 10) / 10;
}

function checkWeekBoundary(
  date: string,
  challengeStartDate: string,
): { shouldScore: boolean; weekNumber: number } {
  const d = new Date(date + 'T12:00:00');
  const start = new Date(challengeStartDate + 'T12:00:00');
  const daysSinceStart = Math.floor((d.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceStart < 0) return { shouldScore: false, weekNumber: 0 };

  const currentWeek = Math.floor(daysSinceStart / 7) + 1;
  const dayOfWeek = daysSinceStart % 7; // 0 = first day, 6 = last day

  // Score when it's the last day of a week (day 6)
  // or when it's a new week and the previous week hasn't been scored
  const isLastDayOfWeek = dayOfWeek === 6;
  const isFirstDayOfNewWeek = dayOfWeek === 0 && currentWeek > 1;

  return {
    shouldScore: isLastDayOfWeek || isFirstDayOfNewWeek,
    weekNumber: isFirstDayOfNewWeek ? currentWeek - 1 : currentWeek,
  };
}

export async function weighInStoreHandler(
  db: SupabaseClient,
  _contexts: ContextBase[],
  criteria: WeighInStoreCriteria,
): Promise<ResultBase> {
  const accessor = new SystemAccessor(db);

  // Load recent weigh-ins for trend computation
  const loadResult = (await accessor.load({
    type: SystemCriteriaType.WeighInLoad,
    userId: criteria.userId,
    limit: 7,
    orderBy: 'date_desc',
  })) as WeighInResult;

  if (loadResult.errors?.length) return loadResult;

  // Compute trend weight
  const recentEntries = loadResult.weighIns ?? [];
  const trendWeight = computeTrendEMA(recentEntries, criteria.weight);

  // Store the weigh-in
  const storeResult = (await accessor.store({
    type: SystemCriteriaType.WeighInStore,
    userId: criteria.userId,
    date: criteria.date,
    weight: criteria.weight,
    trendWeight,
  })) as WeighInResult;

  if (storeResult.errors?.length) return storeResult;

  // Check if user is in an active challenge
  const participantResult = await accessor.load({
    type: SystemCriteriaType.ParticipantLoad,
    userId: criteria.userId,
    status: ['active', 'spinup'],
  });

  if (!participantResult.errors?.length) {
    const participants = (participantResult as any).participants ?? [];
    if (participants.length > 0) {
      const participant = participants[0];

      // Load the challenge to get start date
      const challengeResult = await accessor.load({
        type: SystemCriteriaType.ChallengeLoad,
        id: participant.challengeId,
      });

      if (!challengeResult.errors?.length) {
        const challenges = (challengeResult as any).challenges ?? [];
        if (challenges.length > 0 && challenges[0].startDate) {
          const { shouldScore, weekNumber } = checkWeekBoundary(
            criteria.date,
            challenges[0].startDate,
          );

          if (shouldScore && weekNumber > 0) {
            // Check if this week is already scored
            const existingResult = await accessor.load({
              type: SystemCriteriaType.WeeklyResultLoad,
              challengeId: participant.challengeId,
              weekNumber,
            });

            const existingResults = (existingResult as any).weekResults ?? [];

            if (existingResults.length === 0) {
              // Enqueue scoring job
              const queue = new QueueUtility(db);
              await queue.send({
                queueName: QueueName.ScoringJobs,
                message: {
                  challengeId: participant.challengeId,
                  weekNumber,
                },
              });
            }
          }
        }
      }
    }
  }

  return {
    ...storeResult,
    weighIn: storeResult.weighIn,
  };
}
