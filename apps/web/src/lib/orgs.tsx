import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import type { OrgRole, Organization } from '@bigdogs/shared';
import { supabase } from './supabase';
import { useAuth } from './auth';

export interface MyOrg extends Organization {
  role: OrgRole;
}

interface OrgsContextValue {
  orgs: MyOrg[];
  isPlatformAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createOrg: (name: string, slug: string) => Promise<{ error: string | null }>;
}

const OrgsContext = createContext<OrgsContextValue | null>(null);

/** The signed-in user's organizations, shared by the nav and every org page. */
export function OrgsProvider({ children }: { children: ReactNode }) {
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

  return (
    <OrgsContext.Provider value={{ orgs, isPlatformAdmin, isLoading, error, refetch, createOrg }}>
      {children}
    </OrgsContext.Provider>
  );
}

export function useOrgs() {
  const context = useContext(OrgsContext);
  if (!context) throw new Error('useOrgs must be used within an OrgsProvider');
  return context;
}
