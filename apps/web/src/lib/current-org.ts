import { createContext, useContext } from 'react';
import type { OrgRole } from '@bigdogs/shared';
import type { MyOrg } from './orgs';

/** The org for the current /o/:slug route, provided by OrgLayout. */
export interface CurrentOrg {
  org: MyOrg;
  role: OrgRole;
  isAdmin: boolean;
  isOwner: boolean;
}

export const CurrentOrgContext = createContext<CurrentOrg | null>(null);

export function useCurrentOrg(): CurrentOrg {
  const context = useContext(CurrentOrgContext);
  if (!context) throw new Error('useCurrentOrg must be used within an org route');
  return context;
}
