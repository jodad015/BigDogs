import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type {
  SignedUrlCriteria,
  SignedUrlResult,
  SignedUploadUrlCriteria,
  SignedUploadUrlResult,
  ObjectDeleteCriteria,
  ObjectDeleteResult,
} from './criteria.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class StorageUtility {
  constructor(private db: SupabaseClient) {}

  async signedUrl(criteria: SignedUrlCriteria): Promise<SignedUrlResult> {
    const { data, error } = await this.db.storage
      .from(criteria.bucket)
      .createSignedUrl(criteria.path, criteria.expiresIn ?? 3600);

    if (error) {
      return { errors: [{ code: ErrorCode.StorageError, message: error.message }] };
    }
    return { signedUrl: data.signedUrl };
  }

  async signedUploadUrl(criteria: SignedUploadUrlCriteria): Promise<SignedUploadUrlResult> {
    const { data, error } = await this.db.storage
      .from(criteria.bucket)
      .createSignedUploadUrl(criteria.path);

    if (error) {
      return { errors: [{ code: ErrorCode.StorageError, message: error.message }] };
    }
    return { signedUrl: data.signedUrl, token: data.token };
  }

  async delete(criteria: ObjectDeleteCriteria): Promise<ObjectDeleteResult> {
    const { error } = await this.db.storage.from(criteria.bucket).remove(criteria.paths);

    if (error) {
      return { errors: [{ code: ErrorCode.StorageError, message: error.message }] };
    }
    return {};
  }
}
