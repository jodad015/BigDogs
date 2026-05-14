import { NavLink, Outlet } from 'react-router';
import { Home, Scale, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/weigh-in', label: 'Weigh In', icon: Scale },
  { to: '/leaderboard', label: 'Board', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-background pb-20">
        <Outlet />
      </main>

      {/* Bottom navigation — mobile-first */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card">
        <div className="mx-auto flex max-w-lg">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
