import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../types/context.ts';
import type { ResultBase } from '../../types/result-base.ts';
import { ManagerBase } from '../manager-base.ts';
import { ValidationEngine } from '../../engines/validation/validation-engine.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class FeedManager extends ManagerBase {
  constructor(db: SupabaseClient, contexts: ContextBase[]) {
    super(db, contexts);
  }

  async schedule(criteria: any): Promise<ResultBase> {
    return this.intercept('schedule', criteria);
  }

  async ingest(criteria: any): Promise<ResultBase> {
    return this.intercept('ingest', criteria);
  }

  async digest(criteria: any): Promise<ResultBase> {
    return this.intercept('digest', criteria);
  }

  protected getValidationEngine() {
    return new ValidationEngine();
  }

  protected getSchemas() {
    return null;
  }

  protected getMapper() {
    return null;
  }

  protected getHandlers() {
    return {
      schedule: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `FeedManager.schedule: ${criteria.type} not implemented` }],
        };
      },
      ingest: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `FeedManager.ingest: ${criteria.type} not implemented` }],
        };
      },
      digest: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `FeedManager.digest: ${criteria.type} not implemented` }],
        };
      },
    };
  }
}
