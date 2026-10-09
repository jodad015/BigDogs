import { useState } from 'react';
import { Link } from 'react-router';
import { Check, ChevronsUpDown, LayoutGrid } from 'lucide-react';
import { useOrgs, type MyOrg } from '@/lib/orgs';
import { cn } from '@/lib/utils';

export function OrgSwitcher({ current }: { current: MyOrg | null }) {
  const { orgs } = useOrgs();
  const [open, setOpen] = useState(false);

  if (orgs.length === 0) return null;

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex max-w-[14rem] items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold hover:bg-muted/50 transition-colors"
      >
        <span className="truncate">{current?.name ?? 'Organizations'}</span>
        <ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="absolute left-0 top-full z-50 mt-1 w-64 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-xl"
          >
            {orgs.map((org) => (
              <Link
                key={org.id}
                to={`/o/${org.slug}`}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-muted/50',
                  org.id === current?.id && 'font-semibold',
                )}
              >
                <span className="truncate">{org.name}</span>
                {org.id === current?.id && <Check className="h-4 w-4 shrink-0 text-primary" />}
              </Link>
            ))}
            <div className="my-1 border-t border-border" />
            <Link
              to="/orgs"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            >
              <LayoutGrid className="h-4 w-4" /> All organizations
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
