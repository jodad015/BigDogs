import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ResultBase } from '../../types/result-base.ts';
import { ErrorCode } from '../../enums/error-code.ts';
import { SystemCriteriaType } from './types.ts';
import type { SystemLoadCriteria, SystemStoreCriteria, SystemDeleteCriteria } from './types.ts';

import { weighInLoadHandler } from './handlers/weigh-in-load-handler.ts';
import { weighInStoreHandler } from './handlers/weigh-in-store-handler.ts';
import { weighInDeleteHandler } from './handlers/weigh-in-delete-handler.ts';
import { participantLoadHandler } from './handlers/participant-load-handler.ts';
import { participantStoreHandler } from './handlers/participant-store-handler.ts';
import { weeklyResultLoadHandler } from './handlers/weekly-result-load-handler.ts';
import { weeklyResultStoreHandler } from './handlers/weekly-result-store-handler.ts';
import { challengeLoadHandler } from './handlers/challenge-load-handler.ts';

export class SystemAccessor {
  constructor(private db: SupabaseClient) {}

  async load(criteria: SystemLoadCriteria): Promise<ResultBase> {
    switch (criteria.type) {
      case SystemCriteriaType.WeighInLoad:
        return weighInLoadHandler(this.db, criteria);
      case SystemCriteriaType.ParticipantLoad:
        return participantLoadHandler(this.db, criteria);
      case SystemCriteriaType.WeeklyResultLoad:
        return weeklyResultLoadHandler(this.db, criteria);
      case SystemCriteriaType.ChallengeLoad:
        return challengeLoadHandler(this.db, criteria);
      default:
        return { errors: [{ code: ErrorCode.NotImplemented, message: `SystemAccessor.load: unknown type` }] };
    }
  }

  async store(criteria: SystemStoreCriteria): Promise<ResultBase> {
    switch (criteria.type) {
      case SystemCriteriaType.WeighInStore:
        return weighInStoreHandler(this.db, criteria);
      case SystemCriteriaType.ParticipantStore:
        return participantStoreHandler(this.db, criteria);
      case SystemCriteriaType.WeeklyResultStore:
        return weeklyResultStoreHandler(this.db, criteria);
      default:
        return { errors: [{ code: ErrorCode.NotImplemented, message: `SystemAccessor.store: unknown type` }] };
    }
  }

  async delete(criteria: SystemDeleteCriteria): Promise<ResultBase> {
    switch (criteria.type) {
      case SystemCriteriaType.WeighInDelete:
        return weighInDeleteHandler(this.db, criteria);
      default:
        return { errors: [{ code: ErrorCode.NotImplemented, message: `SystemAccessor.delete: unknown type` }] };
    }
  }
}
