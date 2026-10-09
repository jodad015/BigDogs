import { useCallback } from 'react';
import type { OrgRole } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { friendlyError, useSupabaseQuery } from './use-supabase-query';

export interface Member {
  user_id: string;
  role: OrgRole;
  created_at: string;
  profile: { display_name: string; avatar: string; email: string } | null;
}

const ROLE_ORDER: Record<OrgRole, number> = { owner: 0, admin: 1, member: 2 };

export function useMembers(orgId: string) {
  const fetcher = useCallback(
    () =>
      supabase
        .from('org_members')
        .select('user_id, role, created_at, profiles(display_name, avatar, email)')
        .eq('org_id', orgId),
    [orgId],
  );
  const { data, error, isLoading, refetch } = useSupabaseQuery(fetcher);

  const members: Member[] = (data ?? [])
    .map((m) => ({
      user_id: m.user_id,
      role: m.role as OrgRole,
      created_at: m.created_at,
      profile: m.profiles,
    }))
    .sort(
      (a, b) =>
        ROLE_ORDER[a.role] - ROLE_ORDER[b.role] ||
        (a.profile?.display_name ?? '').localeCompare(b.profile?.display_name ?? ''),
    );

  const run = async (op: PromiseLike<{ error: { code?: string; message: string } | null }>) => {
    const { error: err } = await op;
    if (!err) await refetch();
    return { error: friendlyError(err) };
  };

  return {
    members,
    error,
    isLoading,
    refetch,
    setRole: (userId: string, role: OrgRole) =>
      run(
        supabase.from('org_members').update({ role }).eq('org_id', orgId).eq('user_id', userId),
      ),
    removeMember: (userId: string) =>
      run(supabase.from('org_members').delete().eq('org_id', orgId).eq('user_id', userId)),
  };
}
