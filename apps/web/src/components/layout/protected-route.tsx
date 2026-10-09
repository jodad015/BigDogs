import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/lib/auth';
import { OrgsProvider } from '@/lib/orgs';
import { rememberNextPath, withNext } from '@/lib/next-path';
import { LoadingScreen } from './loading-screen';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    const here = location.pathname + location.search;
    const next = here === '/' ? null : here;
    rememberNextPath(next);
    return <Navigate to={withNext('/signup', next)} replace />;
  }

  return (
    <OrgsProvider>
      <Outlet />
    </OrgsProvider>
  );
}
