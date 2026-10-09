import { useState, type FormEvent } from 'react';
import { ExternalLink, Tv } from 'lucide-react';
import { useCurrentOrg } from '@/lib/current-org';
import { relativeTime } from '@/lib/time';
import { displayUrl, useDisplayLinks } from '@/hooks/use-display-links';
import {
  Card,
  CopyButton,
  dangerButtonClass,
  ErrorText,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui';

/** Settings section for creating and revoking read-only TV links. Admins only. */
export function DisplayLinks() {
  const { org } = useCurrentOrg();
  const { links, error, createLink, revokeLink } = useDisplayLinks(org.id);
  const [name, setName] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const create = async (e: FormEvent) => {
    e.preventDefault();
    const { error: err } = await createLink(name.trim() || 'Office display');
    setActionError(err);
    if (!err) setName('');
  };

  const revoke = async (id: string, linkName: string) => {
    if (!window.confirm(`Revoke "${linkName}"? Any screen using it will stop updating.`)) return;
    const { error: err } = await revokeLink(id);
    setActionError(err);
  };

  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="flex items-center gap-2 font-semibold">
          <Tv className="h-4 w-4 text-primary" /> TV displays
        </p>
        <p className="text-sm text-muted-foreground">
          A read-only link that rotates through your boards. Open it on the office TV or tablet; no
          sign-in needed. Anyone with the link can view, so revoke it if it leaks.
        </p>
      </div>

      <form onSubmit={create} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name, e.g. Kitchen tablet"
          aria-label="Display name"
          maxLength={50}
          className={inputClass}
        />
        <button type="submit" className={primaryButtonClass}>
          Create
        </button>
      </form>

      {links.length > 0 && (
        <ul className="divide-y divide-border rounded-lg border border-border">
          {links.map((link) => (
            <li key={link.id} className="flex flex-wrap items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{link.name}</p>
                <p className="text-xs text-muted-foreground">
                  {link.last_seen_at ? `Last seen ${relativeTime(link.last_seen_at)}` : 'Never opened'}
                </p>
              </div>
              <a
                href={displayUrl(link.token)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${link.name}`}
                className={secondaryButtonClass}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
              <CopyButton text={displayUrl(link.token)} label="Copy" />
              <button
                type="button"
                onClick={() => revoke(link.id, link.name)}
                className={dangerButtonClass}
              >
                Revoke
              </button>
            </li>
          ))}
        </ul>
      )}
      <ErrorText>{actionError ?? error}</ErrorText>
    </Card>
  );
}
