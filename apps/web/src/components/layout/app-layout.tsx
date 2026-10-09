import { NavLink, Outlet, useMatch } from 'react-router';
import { LayoutGrid, Settings, Trophy, Users } from 'lucide-react';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/lib/theme';
import { useOrgs } from '@/lib/orgs';
import { lastOrgSlug } from '@/lib/storage';
import { avatarSrc } from '@/lib/avatars';
import { OrgSwitcher } from './org-switcher';

/** The org the nav points at: the one in the URL, else the last one visited. */
function useNavItems() {
  const { orgs } = useOrgs();
  const match = useMatch('/o/:slug/*');
  const slug = match?.params.slug ?? lastOrgSlug.get();
  const org = orgs.find((o) => o.slug === slug) ?? null;

  if (!org) {
    return { org, items: [{ to: '/orgs', label: 'Orgs', icon: LayoutGrid, end: true }] };
  }
  const base = `/o/${org.slug}`;
  return {
    org,
    items: [
      { to: base, label: 'Boards', icon: Trophy, end: true },
      { to: `${base}/people`, label: 'People', icon: Users, end: false },
      { to: `${base}/settings`, label: 'Settings', icon: Settings, end: false },
    ],
  };
}

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

function Logo() {
  const { theme } = useTheme();
  return (
    <img
      src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'}
      alt=""
      className="h-5 w-7 shrink-0"
    />
  );
}

function DesktopNav() {
  const { org, items } = useNavItems();

  return (
    <nav className="hidden md:flex items-center h-16 px-10 border-b border-border bg-nav">
      <div className="flex-1 flex items-center gap-3 min-w-0">
        <Logo />
        <span className="text-sm font-extrabold tracking-[0.2em] uppercase">BigDogs</span>
        <span className="text-muted-foreground">/</span>
        <OrgSwitcher current={org} />
      </div>

      <div className="flex items-center gap-6">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `p-2 rounded-lg transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`
            }
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </NavLink>
        ))}
      </div>

      <div className="flex-1 flex justify-end">
        <NavLink to="/profile" className="p-1 rounded-lg" title="Profile">
          {({ isActive }) => <ProfileNavIcon isActive={isActive} />}
        </NavLink>
      </div>
    </nav>
  );
}

function MobileTopBar() {
  const { org } = useNavItems();
  return (
    <header className="md:hidden sticky top-0 z-40 flex h-12 items-center gap-2 border-b border-border bg-nav px-3">
      <Logo />
      <OrgSwitcher current={org} />
    </header>
  );
}

function MobileNav() {
  const { items } = useNavItems();
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center gap-1 py-3 text-xs ${
      isActive ? 'text-primary' : 'text-muted-foreground'
    }`;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-nav pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg">
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
            <item.icon className="h-5 w-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink to="/profile" className={linkClass}>
          {({ isActive }) => (
            <>
              <ProfileNavIcon isActive={isActive} />
              <span>Profile</span>
            </>
          )}
        </NavLink>
      </div>
    </nav>
  );
}

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <DesktopNav />
      <MobileTopBar />

      <main className="flex-1 bg-background pb-20 md:pb-0">
        <Outlet />
      </main>

      <MobileNav />
    </div>
  );
}
