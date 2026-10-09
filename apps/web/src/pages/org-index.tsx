import { useEffect, useState } from 'react';
import { Navigate } from 'react-router';
import { useOrgs } from '@/lib/orgs';
import { consumeNextPath } from '@/lib/next-path';
import { lastOrgSlug } from '@/lib/storage';
import { PageSpinner } from '@/components/ui';

/**
 * "/" sends you somewhere useful: a path saved before sign-in (e.g. an invite
 * link), else the org you used last, else your first org, else the org list.
 */
export default function OrgIndexPage() {
  const { orgs, isLoading } = useOrgs();
  const [next, setNext] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- read once after sign-in
    setNext(consumeNextPath());
  }, []);

  if (next === undefined || isLoading) return <PageSpinner />;
  if (next) return <Navigate to={next} replace />;

  const last = lastOrgSlug.get();
  const org = orgs.find((o) => o.slug === last) ?? orgs[0];
  return <Navigate to={org ? `/o/${org.slug}` : '/orgs'} replace />;
}
