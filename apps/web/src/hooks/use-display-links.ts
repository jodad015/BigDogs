import { useCallback } from 'react';
import type { DisplayLink } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export function displayUrl(token: string): string {
  return `${window.location.origin}/tv/${token}`;
}

/** TV display links for an org. Only owners and admins can see or manage them. */
export function useDisplayLinks(orgId: string) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('display_links')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false }),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery<DisplayLink[]>(fetcher);

  const createLink = async (name: string) => {
    const { error: err } = await supabase.from('display_links').insert({ org_id: orgId, name });
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  const revokeLink = async (id: string) => {
    const { error: err } = await supabase.from('display_links').delete().eq('id', id);
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  return { links: data ?? [], error, isLoading, createLink, revokeLink };
}
