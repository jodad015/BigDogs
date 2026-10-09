import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { Building2, ChevronRight, Plus, Ticket } from 'lucide-react';
import { orgNameSchema, orgSlugSchema, ROLE_LABELS } from '@bigdogs/shared';
import { useOrgs } from '@/lib/orgs';
import {
  Card,
  ErrorText,
  inputClass,
  Page,
  PageSpinner,
  primaryButtonClass,
} from '@/components/ui';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Accepts a bare code or a pasted invite link. */
function codeFromInput(value: string): string {
  const trimmed = value.trim();
  const match = trimmed.match(/\/join\/([A-Za-z0-9]+)/);
  return (match ? match[1]! : trimmed).toUpperCase();
}

function JoinForm() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const parsed = codeFromInput(code);
    if (parsed) navigate(`/join/${parsed}`);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit}>
        <label htmlFor="invite-code" className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <Ticket className="h-4 w-4 text-primary" /> Have an invite code?
        </label>
        <div className="flex gap-2">
          <input
            id="invite-code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Code or invite link"
            className={inputClass}
          />
          <button type="submit" disabled={!code.trim()} className={primaryButtonClass}>
            Join
          </button>
        </div>
      </form>
    </Card>
  );
}

function CreateOrgForm() {
  const navigate = useNavigate();
  const { createOrg } = useOrgs();
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
    const { error: err } = await createOrg(parsedName.data, parsedSlug.data);
    setBusy(false);
    setError(err);
    if (!err) navigate(`/o/${parsedSlug.data}`);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-dashed border-border p-4">
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
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
          className={inputClass}
        />
        <input
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          placeholder="url-name"
          aria-label="URL name"
          className={`${inputClass} font-mono`}
        />
        <button type="submit" disabled={busy || !name.trim()} className={`${primaryButtonClass} w-full`}>
          {busy ? 'Creating…' : 'Create organization'}
        </button>
        <ErrorText>{error}</ErrorText>
      </div>
    </form>
  );
}

export default function OrgsPage() {
  const { orgs, isPlatformAdmin, isLoading, error } = useOrgs();

  if (isLoading) return <PageSpinner />;

  return (
    <Page title="Your organizations">
      <ErrorText>{error}</ErrorText>

      {orgs.length === 0 ? (
        <Card className="px-4 py-8 text-center">
          <Building2 className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">You're not in an organization yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Ask a coworker for an invite link to join their leaderboards.
          </p>
        </Card>
      ) : (
        <Card className="divide-y divide-border">
          {orgs.map((org) => (
            <Link
              key={org.id}
              to={`/o/${org.slug}`}
              className="flex items-center justify-between gap-3 px-4 py-3.5 hover:bg-muted/30 first:rounded-t-xl last:rounded-b-xl"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{org.name}</p>
                <p className="text-xs text-muted-foreground">{ROLE_LABELS[org.role]}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))}
        </Card>
      )}

      <JoinForm />
      {isPlatformAdmin && <CreateOrgForm />}
    </Page>
  );
}
