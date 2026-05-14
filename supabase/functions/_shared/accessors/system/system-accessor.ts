import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ResultBase } from '../../types/result-base.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class SystemAccessor {
  constructor(private db: SupabaseClient) {}

  async load(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'SystemAccessor.load not implemented' }] };
  }

  async store(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'SystemAccessor.store not implemented' }] };
  }

  async delete(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'SystemAccessor.delete not implemented' }] };
  }
}
