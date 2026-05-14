import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from './loading-screen';

export function PublicOnlyRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
