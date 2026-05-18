import { NavLink, Outlet } from 'react-router';
import { Home, Scale, Trophy } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/lib/theme';
import { avatarSrc } from '@/components/avatar-picker';

const NAV_ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/weigh-in', label: 'Weigh In', icon: Scale },
  { to: '/leaderboard', label: 'Challenge', icon: Trophy },
];

function ProfileNavIcon({ isActive }: { isActive: boolean }) {
  const { profile } = useProfile();
  return (
    <img
      src={avatarSrc(profile?.avatar ?? 'crimson')}
      alt="Profile"
      className={`h-6 w-6 rounded-full transition-opacity ${isActive ? '' : 'opacity-50'}`}
    />
  );
}

function DesktopNav() {
  const { theme } = useTheme();
  const today = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <nav className="hidden md:flex items-center justify-between h-16 px-10 border-b border-border bg-nav">
      {/* Logo */}
      <div className="flex items-center gap-2.5">
        <img src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'} alt="" className="w-7 h-5" />
        <span className="text-sm font-extrabold tracking-[0.2em] uppercase">BigDogs</span>
      </div>

      {/* Nav icons */}
      <div className="flex items-center gap-6">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
            title={item.label}
          >
            {({ isActive }) => (
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            )}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className="p-1 rounded-lg"
          title="Profile"
        >
          {({ isActive }) => <ProfileNavIcon isActive={isActive} />}
        </NavLink>
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
              <item.icon className={`h-5 w-5 ${isActive ? 'text-primary' : ''}`} />
            )}
          </NavLink>
        ))}
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
              isActive ? 'text-primary' : 'text-muted-foreground'
            }`
          }
        >
          {({ isActive }) => <ProfileNavIcon isActive={isActive} />}
        </NavLink>
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
