import { useEffect, useMemo } from 'react';
import { Navigate, Outlet, useParams } from 'react-router';
import { useOrgs } from '@/lib/orgs';
import { CurrentOrgContext } from '@/lib/current-org';
import { lastOrgSlug } from '@/lib/storage';
import { PageSpinner } from '@/components/ui';

/** Resolves /o/:slug to one of the user's orgs and provides it to child pages. */
export function OrgLayout() {
  const { slug } = useParams();
  const { orgs, isLoading } = useOrgs();
  const org = orgs.find((o) => o.slug === slug) ?? null;

  useEffect(() => {
    if (org) lastOrgSlug.set(org.slug);
    else if (!isLoading && lastOrgSlug.get() === slug) lastOrgSlug.set(null);
  }, [org, isLoading, slug]);

  const value = useMemo(
    () =>
      org && {
        org,
        role: org.role,
        isAdmin: org.role === 'owner' || org.role === 'admin',
        isOwner: org.role === 'owner',
      },
    [org],
  );

  if (isLoading) return <PageSpinner />;
  if (!value) return <Navigate to="/orgs" replace />;

  return (
    <CurrentOrgContext.Provider value={value}>
      <Outlet />
    </CurrentOrgContext.Provider>
  );
}
