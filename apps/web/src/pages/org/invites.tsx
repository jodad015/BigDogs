import { useState, type FormEvent } from 'react';
import { ROLE_LABELS, type OrgInvite, type OrgRole } from '@bigdogs/shared';
import { useAuth } from '@/lib/auth';
import { useCurrentOrg } from '@/lib/current-org';
import { inviteUrl, isInviteActive, useInvites } from '@/hooks/use-invites';
import { usePlayers } from '@/hooks/use-players';
import {
  Badge,
  Card,
  CopyButton,
  dangerButtonClass,
  ErrorText,
  Page,
  PageSpinner,
  primaryButtonClass,
} from '@/components/ui';

const EXPIRY_OPTIONS = [
  { label: 'Never', days: null },
  { label: '1 day', days: 1 },
  { label: '7 days', days: 7 },
  { label: '30 days', days: 30 },
] as const;

const USE_OPTIONS = [
  { label: 'Unlimited', uses: null },
  { label: '1 person', uses: 1 },
  { label: '10 people', uses: 10 },
] as const;

const selectClass = 'w-full rounded-lg border border-border bg-input px-3 py-2 text-sm';

function invitableRoles(role: OrgRole): OrgRole[] {
  if (role === 'owner') return ['member', 'admin', 'owner'];
  if (role === 'admin') return ['member', 'admin'];
  return ['member'];
}

function describe(invite: OrgInvite): string {
  const parts: string[] = [];
  parts.push(
    invite.max_uses === null
      ? `${invite.use_count} joined`
      : `${invite.use_count}/${invite.max_uses} used`,
  );
  if (invite.expires_at) {
    parts.push(`expires ${new Date(invite.expires_at).toLocaleDateString()}`);
  }
  return parts.join(' · ');
}

function CreateInviteForm({ invites }: { invites: ReturnType<typeof useInvites> }) {
  const { role: myRole } = useCurrentOrg();
  const roles = invitableRoles(myRole);
  const [role, setRole] = useState<OrgRole>('member');
  const [expiry, setExpiry] = useState(0);
  const [uses, setUses] = useState(0);
  const [created, setCreated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { invite, error: err } = await invites.createInvite({
      role,
      expiresInDays: EXPIRY_OPTIONS[expiry]!.days,
      maxUses: USE_OPTIONS[uses]!.uses,
    });
    setBusy(false);
    setError(err);
    setCreated(invite ? inviteUrl(invite.code) : null);
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <h2 className="font-semibold">New invite link</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {roles.length > 1 && (
            <label className="space-y-1 text-xs text-muted-foreground">
              <span>Joins as</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as OrgRole)}
                className={selectClass}
              >
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Expires</span>
            <select
              value={expiry}
              onChange={(e) => setExpiry(Number(e.target.value))}
              className={selectClass}
            >
              {EXPIRY_OPTIONS.map((o, i) => (
                <option key={o.label} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            <span>Can be used by</span>
            <select
              value={uses}
              onChange={(e) => setUses(Number(e.target.value))}
              className={selectClass}
            >
              {USE_OPTIONS.map((o, i) => (
                <option key={o.label} value={i}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" disabled={busy} className={`${primaryButtonClass} w-full`}>
          {busy ? 'Creating…' : 'Create invite link'}
        </button>
        <ErrorText>{error}</ErrorText>
        {created && (
          <div className="flex items-center gap-2 rounded-lg bg-muted/40 p-3">
            <code className="min-w-0 flex-1 truncate text-xs">{created}</code>
            <CopyButton text={created} label="Copy" />
          </div>
        )}
      </form>
    </Card>
  );
}

export default function InvitesPage() {
  const { user } = useAuth();
  const { org, isAdmin } = useCurrentOrg();
  const invites = useInvites(org.id);
  const { players } = usePlayers(org.id);
  const [error, setError] = useState<string | null>(null);

  // A player invite is spent once someone claims that player
  const active = invites.invites.filter(
    (i) => isInviteActive(i) && !players.find((p) => p.id === i.player_id)?.user_id,
  );
  const playerName = (id: string | null) =>
    id ? players.find((p) => p.id === id)?.display_name : undefined;

  const revoke = async (invite: OrgInvite) => {
    if (!window.confirm('Revoke this invite? The link will stop working.')) return;
    const { error: err } = await invites.revokeInvite(invite.id);
    setError(err);
  };

  return (
    <Page title="Invites">
      <p className="text-sm text-muted-foreground">
        Anyone with a link can join {org.name}. To invite a specific coworker who's already on the
        boards, use "Invite as" on their player in People.
      </p>

      <CreateInviteForm invites={invites} />

      <section className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Active links</h2>
        <ErrorText>{error ?? invites.error}</ErrorText>
        {invites.isLoading ? (
          <PageSpinner />
        ) : active.length === 0 ? (
          <Card className="px-4 py-6 text-center text-sm text-muted-foreground">
            No active invite links.
          </Card>
        ) : (
          <Card>
            <ul className="divide-y divide-border">
              {active.map((invite) => {
                const forPlayer = playerName(invite.player_id);
                return (
                  <li key={invite.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2">
                        <code className="font-semibold tracking-wider">{invite.code}</code>
                        <Badge>{ROLE_LABELS[invite.role as OrgRole]}</Badge>
                        {forPlayer && <Badge tone="primary">Claims {forPlayer}</Badge>}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{describe(invite)}</p>
                    </div>
                    <CopyButton text={inviteUrl(invite.code)} label="Copy" />
                    {(isAdmin || invite.created_by === user?.id) && (
                      <button type="button" onClick={() => revoke(invite)} className={dangerButtonClass}>
                        Revoke
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        )}
      </section>
    </Page>
  );
}
