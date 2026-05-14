import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../../types/context.ts';
import type { ResultBase } from '../../types/result-base.ts';
import { ManagerBase } from '../manager-base.ts';
import { ValidationEngine } from '../../engines/validation/validation-engine.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class EntityManager extends ManagerBase {
  constructor(db: SupabaseClient, contexts: ContextBase[]) {
    super(db, contexts);
  }

  async load(criteria: any): Promise<ResultBase> {
    return this.intercept('load', criteria);
  }

  async store(criteria: any): Promise<ResultBase> {
    return this.intercept('store', criteria);
  }

  async delete(criteria: any): Promise<ResultBase> {
    return this.intercept('delete', criteria);
  }

  protected getValidationEngine() {
    return new ValidationEngine();
  }

  protected getSchemas() {
    // Zod schemas will be added per request type
    return null;
  }

  protected getMapper() {
    // Mapper will be added when validation criteria are defined
    return null;
  }

  protected getHandlers() {
    return {
      load: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `EntityManager.load: ${criteria.type} not implemented` }],
        };
      },
      store: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `EntityManager.store: ${criteria.type} not implemented` }],
        };
      },
      delete: async (criteria: any): Promise<ResultBase> => {
        return {
          errors: [{ code: ErrorCode.NotImplemented, message: `EntityManager.delete: ${criteria.type} not implemented` }],
        };
      },
    };
  }
}
