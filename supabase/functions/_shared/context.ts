import type { SupabaseClient } from 'jsr:@supabase/supabase-js@2';
import type { ContextBase, ApiContextDraft, SystemContext } from './types/context.ts';
import { ContextType } from './enums/context-type.ts';
import { ContextUtility } from './utilities/context/context-utility.ts';

export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

export function createSystemContext(): SystemContext {
  return {
    type: ContextType.System,
    requestId: crypto.randomUUID(),
  };
}

export function createApiContextDraft(): ApiContextDraft {
  return {
    type: ContextType.Draft,
    externalAuthId: '',
  };
}

export async function buildContext(
  supabase: SupabaseClient,
  _req: Request,
): Promise<ContextBase[]> {
  const contextUtility = new ContextUtility(supabase);
  const draft = createApiContextDraft();
  const result = await contextUtility.enrich({ context: draft });

  if (result.errors?.length || !result.contexts?.length) {
    throw new AuthenticationError('Not authenticated');
  }

  return result.contexts;
}
