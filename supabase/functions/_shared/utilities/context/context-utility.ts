import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { UserContext, ApiContextDraft } from '../../types/context.ts';
import type { ContextEnrichCriteria, ContextEnrichResult } from './criteria.ts';
import { ContextType } from '../../enums/context-type.ts';
import { ErrorCode } from '../../enums/error-code.ts';

export class ContextUtility {
  constructor(private db: SupabaseClient) {}

  async enrich(criteria: ContextEnrichCriteria): Promise<ContextEnrichResult> {
    switch (criteria.context.type) {
      case ContextType.System:
        return { contexts: [criteria.context] };

      case ContextType.Draft:
        return this.enrichUserContext(criteria.context as ApiContextDraft);

      default:
        return {
          errors: [
            { code: ErrorCode.UnknownContext, message: `Unknown context type: ${criteria.context.type}` },
          ],
        };
    }
  }

  private async enrichUserContext(_draft: ApiContextDraft): Promise<ContextEnrichResult> {
    const {
      data: { user },
      error,
    } = await this.db.auth.getUser();

    if (error || !user) {
      return {
        errors: [{ code: ErrorCode.Unauthorized, message: 'Not authenticated' }],
      };
    }

    const userContext: UserContext = {
      type: ContextType.User,
      requestId: crypto.randomUUID(),
      userId: user.id,
      userEmail: user.email!,
      userRole: user.user_metadata?.role ?? 'user',
    };

    return { contexts: [userContext] };
  }
}
