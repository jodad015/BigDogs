import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../types/context.ts';
import type { ResultBase } from '../../types/result-base.ts';
import { ManagerBase } from '../manager-base.ts';
import { ValidationEngine } from '../../engines/validation/validation-engine.ts';
import { ErrorCode } from '../../enums/error-code.ts';
import { computeWeeklyScoresHandler } from './handlers/compute-weekly-scores-handler.ts';

export class TransactionManager extends ManagerBase {
  constructor(db: SupabaseClient, contexts: ContextBase[]) {
    super(db, contexts);
  }

  async load(criteria: any): Promise<ResultBase> {
    return this.intercept('load', criteria);
  }

  async execute(criteria: any): Promise<ResultBase> {
    return this.intercept('execute', criteria);
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
      load: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `TransactionManager.load: ${criteria.type} not implemented` }],
        };
      },
      execute: async (criteria: any): Promise<ResultBase> => {
        switch (criteria.type) {
          case 'ComputeWeeklyScores':
            return computeWeeklyScoresHandler(this.db, this.contexts, criteria);
          default:
            return {
              errors: [{ code: ErrorCode.NotImplemented, message: `TransactionManager.execute: ${criteria.type} not implemented` }],
            };
        }
      },
    };
  }
}
