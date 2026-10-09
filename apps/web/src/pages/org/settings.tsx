import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { orgNameSchema } from '@bigdogs/shared';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { useOrgs } from '@/lib/orgs';
import { useCurrentOrg } from '@/lib/current-org';
import { lastOrgSlug } from '@/lib/storage';
import { friendlyError } from '@/hooks/use-supabase-query';
import { DisplayLinks } from '@/components/display-links';
import {
  Card,
  dangerButtonClass,
  ErrorText,
  inputClass,
  Page,
  primaryButtonClass,
} from '@/components/ui';

function timezones(current: string): string[] {
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf('timeZone');
  } catch {
    // Older browsers: just offer the current value
  }
  return zones.includes(current) ? zones : [current, ...zones];
}

function OrgDetailsForm() {
  const { org, isAdmin } = useCurrentOrg();
  const { refetch } = useOrgs();
  const [name, setName] = useState(org.name);
  const [timezone, setTimezone] = useState(org.timezone);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const zones = useMemo(() => timezones(org.timezone), [org.timezone]);

  const dirty = name.trim() !== org.name || timezone !== org.timezone;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = orgNameSchema.safeParse(name);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    setBusy(true);
    const { error: err } = await supabase
      .from('organizations')
      .update({ name: parsed.data, timezone })
      .eq('id', org.id);
    setBusy(false);
    setError(friendlyError(err));
    if (!err) {
      setSaved(true);
      await refetch();
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">Name</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            disabled={!isAdmin}
            className={inputClass}
          />
        </label>
        <div className="space-y-1">
          <span className="text-xs text-muted-foreground">URL</span>
          <p className="font-mono text-sm">/o/{org.slug}</p>
        </div>
        <label className="block space-y-1">
          <span className="text-xs text-muted-foreground">
            Timezone (decides when "this week" and "this month" start)
          </span>
          <select
            value={timezone}
            onChange={(e) => {
              setTimezone(e.target.value);
              setSaved(false);
            }}
            disabled={!isAdmin}
            className={inputClass}
          >
            {zones.map((z) => (
              <option key={z} value={z}>
                {z.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </label>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <button type="submit" disabled={busy || !dirty} className={primaryButtonClass}>
              {busy ? 'Saving…' : 'Save'}
            </button>
            {saved && !dirty && <span className="text-sm text-success">Saved</span>}
          </div>
        )}
        <ErrorText>{error}</ErrorText>
      </form>
    </Card>
  );
}

function LeaveOrg() {
  const { user } = useAuth();
  const { org } = useCurrentOrg();
  const { refetch } = useOrgs();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const leave = async () => {
    if (!user) return;
    if (!window.confirm(`Leave ${org.name}? You'll need a new invite to come back.`)) return;
    const { error: err } = await supabase
      .from('org_members')
      .delete()
      .eq('org_id', org.id)
      .eq('user_id', user.id);
    if (err) {
      setError(
        err.message.includes('at least one owner')
          ? "You're the only owner. Make someone else an owner before leaving."
          : friendlyError(err),
      );
      return;
    }
    lastOrgSlug.set(null);
    await refetch();
    navigate('/orgs', { replace: true });
  };

  return (
    <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
      <div>
        <p className="font-semibold">Leave organization</p>
        <p className="text-sm text-muted-foreground">Your scores stay on the boards.</p>
      </div>
      <button type="button" onClick={leave} className={dangerButtonClass}>
        Leave {org.name}
      </button>
      <div className="w-full">
        <ErrorText>{error}</ErrorText>
      </div>
    </Card>
  );
}

export default function OrgSettingsPage() {
  const { isAdmin } = useCurrentOrg();
  return (
    <Page title="Settings">
      <OrgDetailsForm />
      {isAdmin && <DisplayLinks />}
      <LeaveOrg />
    </Page>
  );
}
