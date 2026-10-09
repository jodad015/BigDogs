import { useCallback, useEffect, useState } from 'react';
import type { OrgRole, Organization } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface MyOrg extends Organization {
  role: OrgRole;
}

/** The signed-in user's organizations, plus whether they are a platform admin. */
export function useOrgs() {
  const { user } = useAuth();
  const [orgs, setOrgs] = useState<MyOrg[]>([]);
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!user) return;
    const [membershipsRes, adminRes] = await Promise.all([
      supabase
        .from('org_members')
        .select('role, organizations(*)')
        .eq('user_id', user.id)
        .order('created_at'),
      supabase.from('platform_admins').select('user_id').eq('user_id', user.id).maybeSingle(),
    ]);

    if (membershipsRes.error) {
      setError(membershipsRes.error.message);
    } else {
      setOrgs(
        membershipsRes.data.flatMap((m) =>
          m.organizations ? [{ ...m.organizations, role: m.role as OrgRole }] : [],
        ),
      );
      setError(null);
    }
    setIsPlatformAdmin(!!adminRes.data);
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    void refetch();
  }, [refetch]);

  const createOrg = async (name: string, slug: string) => {
    const { error: err } = await supabase.rpc('create_organization', {
      p_name: name,
      p_slug: slug,
      p_timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    });
    if (err) return { error: err.code === '23505' ? 'That URL name is taken' : err.message };
    await refetch();
    return { error: null };
  };

  const acceptInvite = async (code: string) => {
    const { error: err } = await supabase.rpc('accept_invite', { p_code: code });
    if (err) return { error: err.message };
    await refetch();
    return { error: null };
  };

  return { orgs, isPlatformAdmin, isLoading, error, createOrg, acceptInvite, refetch };
}
