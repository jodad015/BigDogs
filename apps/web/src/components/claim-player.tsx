import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import type { usePlayers } from '@/hooks/use-players';
import { Avatar, ErrorText, primaryButtonClass, secondaryButtonClass } from '@/components/ui';

type Players = ReturnType<typeof usePlayers>;

/**
 * "Which player are you?" Lists unclaimed players so a new member can take
 * over scores someone already logged for them, or start fresh.
 */
export function ClaimPlayer({
  players,
  onDone,
}: {
  players: Players;
  onDone?: () => void;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const unclaimed = players.players.filter((p) => !p.user_id);

  const act = async (key: string, op: () => Promise<{ error: string | null }>) => {
    setBusy(key);
    const { error: err } = await op();
    setBusy(null);
    setError(err);
    if (!err) onDone?.();
  };

  return (
    <div className="space-y-3">
      {unclaimed.length > 0 && (
        <>
          <p className="text-sm text-muted-foreground">
            If someone already added you, claim your player to keep your scores.
          </p>
          <ul className="divide-y divide-border rounded-xl border border-border">
            {unclaimed.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-3 py-2.5">
                <Avatar name={p.avatar} className="h-8 w-8" />
                <span className="flex-1 truncate font-medium">{p.display_name}</span>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => act(p.id, () => players.claimPlayer(p.id))}
                  className={secondaryButtonClass}
                >
                  {busy === p.id ? 'Claiming…' : "That's me"}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        disabled={busy !== null}
        onClick={() => act('new', players.createMyPlayer)}
        className={`${primaryButtonClass} w-full`}
      >
        <UserPlus className="h-4 w-4" />
        {busy === 'new'
          ? 'Adding you…'
          : unclaimed.length > 0
            ? "I'm not on the list, add me"
            : 'Add me as a player'}
      </button>
      <ErrorText>{error}</ErrorText>
    </div>
  );
}
