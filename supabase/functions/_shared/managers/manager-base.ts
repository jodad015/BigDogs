import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase } from '../types/context.ts';
import type { ResultBase } from '../types/result-base.ts';
import type { ValidationResult } from '../types/validation-result.ts';
import { ErrorCode } from '../enums/error-code.ts';

export abstract class ManagerBase {
  constructor(
    protected db: SupabaseClient,
    protected contexts: ContextBase[],
  ) {}

  protected getRequiredContext<T extends ContextBase>(type: string): T {
    const ctx = this.contexts.find((c) => c.type === type);
    if (!ctx) {
      throw new Error(`Required context '${type}' not found`);
    }
    return ctx as T;
  }

  protected async intercept(method: string, criteria: any): Promise<ResultBase> {
    // Stage 1: Input validation (Zod schemas)
    const schemas = this.getSchemas();
    const methodSchemas = schemas?.[method];
    if (methodSchemas) {
      const schema = methodSchemas[criteria.type];
      if (schema) {
        const parsed = schema.safeParse(criteria);
        if (!parsed.success) {
          return {
            errors: parsed.error.issues.map((issue: any) => ({
              code: ErrorCode.ValidationError,
              message: issue.message,
              field: issue.path.join('.'),
            })),
          };
        }
      }
    }

    // Stage 2: Map manager criteria → validation criteria
    const mapper = this.getMapper();
    const validationCriteria = mapper ? mapper(method, criteria, this.contexts) : null;

    // Stage 3: Business validation (permissions, state, entity existence)
    if (validationCriteria) {
      const engine = this.getValidationEngine();
      const check: ValidationResult = await engine.validate(validationCriteria);
      if (!check.valid) {
        return { errors: check.errors };
      }
    }

    // Stage 4: All validation passed — dispatch to handler
    const handlers = this.getHandlers();
    const handler = handlers[method];
    return handler(criteria);
  }

  protected abstract getValidationEngine(): {
    validate(criteria: any): Promise<ValidationResult>;
  };
  protected abstract getSchemas(): Record<string, Record<string, any>> | null;
  protected abstract getMapper():
    | ((method: string, criteria: any, contexts: ContextBase[]) => any)
    | null;
  protected abstract getHandlers(): Record<string, (criteria: any) => Promise<ResultBase>>;
}
