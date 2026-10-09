import { useState, type FormEvent } from 'react';
import { Building2, Loader2, Plus, Ticket } from 'lucide-react';
import { orgNameSchema, orgSlugSchema, ROLE_LABELS } from '@bigdogs/shared';
import { useOrgs } from '@/hooks/use-orgs';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

function JoinForm({ onJoin }: { onJoin: (code: string) => Promise<{ error: string | null }> }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    const { error: err } = await onJoin(code.trim());
    setBusy(false);
    setError(err);
    if (!err) setCode('');
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl bg-card p-4">
      <label htmlFor="invite-code" className="flex items-center gap-2 text-sm font-semibold mb-2">
        <Ticket className="h-4 w-4 text-primary" /> Have an invite code?
      </label>
      <div className="flex gap-2">
        <input
          id="invite-code"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="ACMEJOIN"
          className="flex-1 min-w-0 rounded-lg border border-border bg-input px-3 py-2 text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={busy || !code.trim()}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Join'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}

function CreateOrgForm({
  onCreate,
}: {
  onCreate: (name: string, slug: string) => Promise<{ error: string | null }>;
}) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsedName = orgNameSchema.safeParse(name);
    const parsedSlug = orgSlugSchema.safeParse(slug);
    if (!parsedName.success) return setError(parsedName.error.issues[0]!.message);
    if (!parsedSlug.success) return setError(parsedSlug.error.issues[0]!.message);

    setBusy(true);
    const { error: err } = await onCreate(parsedName.data, parsedSlug.data);
    setBusy(false);
    setError(err);
    if (!err) {
      setName('');
      setSlug('');
      setSlugTouched(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-border p-4">
      <p className="flex items-center gap-2 text-sm font-semibold mb-3">
        <Plus className="h-4 w-4 text-primary" /> New organization
        <span className="ml-auto text-[10px] uppercase tracking-wider text-muted-foreground">
          Platform admin
        </span>
      </p>
      <div className="space-y-2">
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
          placeholder="Organization name"
          aria-label="Organization name"
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="url-name"
          aria-label="URL name"
          className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={busy || !name.trim()}
          className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create organization'}
        </button>
      </div>
      {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
    </form>
  );
}

export default function HomePage() {
  const { orgs, isPlatformAdmin, isLoading, error, createOrg, acceptInvite } = useOrgs();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-6 space-y-5">
      <h1 className="text-xl font-bold">Your organizations</h1>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {orgs.length === 0 ? (
        <div className="rounded-xl bg-card px-4 py-8 text-center">
          <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">You're not in an organization yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask a coworker for an invite code to join their leaderboards.
          </p>
        </div>
      ) : (
        <ul className="rounded-xl bg-card divide-y divide-border">
          {orgs.map((org) => (
            <li key={org.id} className="flex items-center justify-between px-4 py-3.5">
              <div>
                <p className="font-semibold">{org.name}</p>
                <p className="text-xs text-muted-foreground font-mono">{org.slug}</p>
              </div>
              <span className="text-xs text-muted-foreground">{ROLE_LABELS[org.role]}</span>
            </li>
          ))}
        </ul>
      )}

      <JoinForm onJoin={acceptInvite} />
      {isPlatformAdmin && <CreateOrgForm onCreate={createOrg} />}
    </div>
  );
}
