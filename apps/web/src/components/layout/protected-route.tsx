import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/lib/auth';
import { LoadingScreen } from './loading-screen';

export function ProtectedRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
