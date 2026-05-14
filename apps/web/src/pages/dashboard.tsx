import { useAuth } from '@/lib/auth';

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">BigDogs</h1>
      <p className="mt-2 text-muted-foreground">Welcome, {user?.email}</p>
    </div>
  );
}
