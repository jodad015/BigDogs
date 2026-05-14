import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ResultBase } from '../../types/result-base.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class UserAccessor {
  constructor(private db: SupabaseClient) {}

  async load(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'UserAccessor.load not implemented' }] };
  }

  async store(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'UserAccessor.store not implemented' }] };
  }

  async delete(criteria: any): Promise<ResultBase> {
    return { errors: [{ code: ErrorCode.NotImplemented, message: 'UserAccessor.delete not implemented' }] };
  }
}
