import { useState } from 'react';
import { ORG_ROLES, ROLE_LABELS, type OrgRole } from '@bigdogs/shared';
import { useAuth } from '@/lib/auth';
import { useCurrentOrg } from '@/lib/current-org';
import type { Member, useMembers } from '@/hooks/use-members';
import { Avatar, Badge, Card, dangerButtonClass, ErrorText } from '@/components/ui';

type Members = ReturnType<typeof useMembers>;

function MemberRow({ member, members }: { member: Member; members: Members }) {
  const { user } = useAuth();
  const { isOwner, role: myRole } = useCurrentOrg();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isMe = member.user_id === user?.id;
  const name = member.profile?.display_name ?? 'Unknown';
  const canChangeRole = isOwner && !isMe;
  const canRemove = !isMe && (isOwner || (myRole === 'admin' && member.role === 'member'));

  const changeRole = async (role: OrgRole) => {
    setBusy(true);
    const { error: err } = await members.setRole(member.user_id, role);
    setBusy(false);
    setError(err);
  };

  const remove = async () => {
    if (!window.confirm(`Remove ${name} from the organization? Their scores stay on the boards.`)) {
      return;
    }
    setBusy(true);
    const { error: err } = await members.removeMember(member.user_id);
    setBusy(false);
    setError(err);
  };

  return (
    <li className="px-4 py-3">
      <div className="flex items-center gap-3">
        <Avatar name={member.profile?.avatar ?? 'crimson'} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 truncate font-medium">
            {name} {isMe && <Badge tone="primary">You</Badge>}
          </p>
          <p className="truncate text-xs text-muted-foreground">{member.profile?.email}</p>
        </div>
        {canChangeRole ? (
          <select
            value={member.role}
            disabled={busy}
            onChange={(e) => changeRole(e.target.value as OrgRole)}
            aria-label={`Role for ${name}`}
            className="rounded-lg border border-border bg-input px-2 py-1.5 text-sm"
          >
            {ORG_ROLES.map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-sm text-muted-foreground">{ROLE_LABELS[member.role]}</span>
        )}
        {canRemove && (
          <button type="button" disabled={busy} onClick={remove} className={dangerButtonClass}>
            Remove
          </button>
        )}
      </div>
      {error && (
        <div className="mt-2">
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </li>
  );
}

export function MembersList({ members }: { members: Members }) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Members have accounts. Owners manage roles; admins can remove members and manage any
        board or score.
      </p>
      <Card>
        <ul className="divide-y divide-border">
          {members.members.map((m) => (
            <MemberRow key={m.user_id} member={m} members={members} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
