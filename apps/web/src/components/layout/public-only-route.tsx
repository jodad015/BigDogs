import { Navigate, Outlet, useSearchParams } from 'react-router';
import { useAuth } from '@/lib/auth';
import { rememberNextPath, safeNextPath } from '@/lib/next-path';
import { LoadingScreen } from './loading-screen';

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();
  const [params] = useSearchParams();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    // Email sign-in carries ?next=. Google sign-in lands on "/", which picks
    // up the stored path instead (see OrgIndexPage).
    const next = safeNextPath(params.get('next'));
    if (next) rememberNextPath(null);
    return <Navigate to={next ?? '/'} replace />;
  }

  return <Outlet />;
}
