import { NavLink, Outlet } from 'react-router';
import { Home, Scale, Trophy, User } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/weigh-in', label: 'Weigh In', icon: Scale },
  { to: '/leaderboard', label: 'Challenge', icon: Trophy },
  { to: '/profile', label: 'Profile', icon: User },
];

function DesktopNav() {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <nav className="hidden md:flex items-center justify-between h-16 px-10 border-b border-border bg-nav">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img src="/avatars/bigdog-crimson.svg" alt="" className="w-6 h-6" />
        <span className="text-sm font-extrabold tracking-[0.2em] uppercase">BigDogs</span>
      </div>

      {/* Nav links */}
      <div className="flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `text-sm font-medium transition-colors ${
                isActive ? 'text-primary font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      {/* Date */}
      <span className="text-sm text-muted-foreground">{today}</span>
    </nav>
  );
}

function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-nav">
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
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DesktopNav />

      <main className="flex-1 bg-background pb-20 md:pb-0">
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
