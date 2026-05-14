import { createSupabaseClient } from '../_shared/supabase-client.ts';
import { buildContext, AuthenticationError } from '../_shared/context.ts';
import { EntityManager } from '../_shared/index.ts';
import { ErrorCode } from '../_shared/enums/error-code.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createSupabaseClient(req);
    const contexts = await buildContext(supabase, req);
    const criteria = await req.json();
    const manager = new EntityManager(supabase, contexts);
    const result = await manager.store(criteria);
    const status = result.errors?.length ? 400 : 200;
    return new Response(JSON.stringify(result), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return new Response(JSON.stringify({ errors: [{ code: ErrorCode.Unauthorized, message: error.message }] }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ errors: [{ code: ErrorCode.InternalError, message: 'An unexpected error occurred' }] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
