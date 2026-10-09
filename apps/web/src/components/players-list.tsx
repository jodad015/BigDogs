import { useState, type FormEvent } from 'react';
import { ChevronDown, UserPlus } from 'lucide-react';
import { playerNameSchema, type Player } from '@bigdogs/shared';
import { useAuth } from '@/lib/auth';
import { useCurrentOrg } from '@/lib/current-org';
import type { usePlayers } from '@/hooks/use-players';
import { inviteUrl, useInvites } from '@/hooks/use-invites';
import { AvatarPicker } from '@/components/avatar-picker';
import { AVATARS } from '@/lib/avatars';
import {
  Avatar,
  Badge,
  Card,
  CopyButton,
  dangerButtonClass,
  ErrorText,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui';
import { cn } from '@/lib/utils';

type Players = ReturnType<typeof usePlayers>;
type Result = Promise<{ error: string | null }>;

function randomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)]!;
}

function AddPlayerForm({ players }: { players: Players }) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = playerNameSchema.safeParse(name);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    setBusy(true);
    const { error: err } = await players.addPlayer(parsed.data, randomAvatar());
    setBusy(false);
    setError(err);
    if (!err) setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Add a coworker by name"
          aria-label="Player name"
          className={inputClass}
        />
        <button type="submit" disabled={busy || !name.trim()} className={primaryButtonClass}>
          <UserPlus className="h-4 w-4" /> Add
        </button>
      </div>
      <ErrorText>{error}</ErrorText>
    </form>
  );
}

function EditPlayer({ player, players }: { player: Player; players: Players }) {
  const [name, setName] = useState(player.display_name);
  const [error, setError] = useState<string | null>(null);

  const save = async (updates: { display_name?: string; avatar?: string }) => {
    const { error: err } = await players.updatePlayer(player.id, updates);
    setError(err);
  };

  const saveName = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = playerNameSchema.safeParse(name);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    if (parsed.data !== player.display_name) await save({ display_name: parsed.data });
  };

  return (
    <div className="space-y-3">
      <form onSubmit={saveName} className="flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Name"
          className={inputClass}
        />
        <button
          type="submit"
          disabled={name.trim() === player.display_name}
          className={secondaryButtonClass}
        >
          Save
        </button>
      </form>
      <AvatarPicker selected={player.avatar} onSelect={(avatar) => save({ avatar })} />
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function ClaimInvite({ player }: { player: Player }) {
  const { org } = useCurrentOrg();
  const { createInvite } = useInvites(org.id);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const create = async () => {
    const { invite, error: err } = await createInvite({
      role: 'member',
      playerId: player.id,
      maxUses: 1,
      expiresInDays: 30,
    });
    setError(err);
    if (invite) setLink(inviteUrl(invite.code));
  };

  if (link) {
    return (
      <div className="w-full space-y-2 rounded-lg bg-muted/40 p-3">
        <p className="text-xs text-muted-foreground">
          Send this to {player.display_name}. It joins {org.name} and claims this player. Works
          once, for 30 days.
        </p>
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate text-xs">{link}</code>
          <CopyButton text={link} label="Copy" />
        </div>
      </div>
    );
  }

  return (
    <>
      <button type="button" onClick={create} className={secondaryButtonClass}>
        Invite as {player.display_name}
      </button>
      <ErrorText>{error}</ErrorText>
    </>
  );
}

function PlayerRow({
  player,
  players,
  expanded,
  onToggle,
}: {
  player: Player;
  players: Players;
  expanded: boolean;
  onToggle: () => void;
}) {
  const { user } = useAuth();
  const { isAdmin } = useCurrentOrg();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const isMine = player.user_id === user?.id;
  const isClaimed = player.user_id !== null;
  const canEdit = isMine || player.created_by === user?.id || isAdmin;

  const act = async (op: () => Result, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    setBusy(true);
    const { error: err } = await op();
    setBusy(false);
    setError(err);
  };

  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30"
      >
        <Avatar name={player.avatar} />
        <span className="flex-1 truncate font-medium">{player.display_name}</span>
        {isMine ? (
          <Badge tone="primary">You</Badge>
        ) : isClaimed ? (
          <Badge>Member</Badge>
        ) : (
          <Badge>Not claimed</Badge>
        )}
        <ChevronDown
          className={cn('h-4 w-4 text-muted-foreground transition-transform', expanded && 'rotate-180')}
        />
      </button>

      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          {canEdit && <EditPlayer player={player} players={players} />}

          <div className="flex flex-wrap items-start gap-2">
            {!isClaimed && !players.myPlayer && (
              <button
                type="button"
                disabled={busy}
                onClick={() => act(() => players.claimPlayer(player.id))}
                className={primaryButtonClass}
              >
                This is me
              </button>
            )}
            {!isClaimed && <ClaimInvite player={player} />}
            {isClaimed && (isMine || isAdmin) && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  act(
                    () => players.unlinkPlayer(player.id),
                    isMine
                      ? 'Unlink this player from your account? Your scores stay with the player.'
                      : `Unlink ${player.display_name} from their account?`,
                  )
                }
                className={secondaryButtonClass}
              >
                Unlink account
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  act(
                    () => players.deletePlayer(player.id),
                    `Delete ${player.display_name}? All of their scores will be deleted too.`,
                  )
                }
                className={dangerButtonClass}
              >
                Delete
              </button>
            )}
          </div>
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </li>
  );
}

export function PlayersList({ players }: { players: Players }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <AddPlayerForm players={players} />
      {players.players.length === 0 ? (
        <Card className="px-4 py-8 text-center text-sm text-muted-foreground">
          No players yet. Add the people who play.
        </Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {players.players.map((p) => (
              <PlayerRow
                key={p.id}
                player={p}
                players={players}
                expanded={expanded === p.id}
                onToggle={() => setExpanded((cur) => (cur === p.id ? null : p.id))}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
