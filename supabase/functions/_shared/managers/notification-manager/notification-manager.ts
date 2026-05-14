import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../types/context.ts';
import type { ResultBase } from '../../types/result-base.ts';
import { ManagerBase } from '../manager-base.ts';
import { ValidationEngine } from '../../engines/validation/validation-engine.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class NotificationManager extends ManagerBase {
  constructor(db: SupabaseClient, contexts: ContextBase[]) {
    super(db, contexts);
  }

  async notify(criteria: any): Promise<ResultBase> {
    return this.intercept('notify', criteria);
  }

  async send(criteria: any): Promise<ResultBase> {
    return this.intercept('send', criteria);
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
      notify: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `NotificationManager.notify: ${criteria.type} not implemented` }],
        };
      },
      send: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `NotificationManager.send: ${criteria.type} not implemented` }],
        };
      },
    };
  }
}
