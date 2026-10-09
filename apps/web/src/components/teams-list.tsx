import { useState, type FormEvent } from 'react';
import { ChevronDown, Plus } from 'lucide-react';
import type { Player } from '@bigdogs/shared';
import { useCurrentOrg } from '@/lib/current-org';
import { cn } from '@/lib/utils';
import { findTeamByRoster, teamName, type TeamWithMembers, type useTeams } from '@/hooks/use-teams';
import { CompetitorAvatar } from '@/components/competitor-avatar';
import {
  Avatar,
  Card,
  dangerButtonClass,
  ErrorText,
  inputClass,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui';

type Teams = ReturnType<typeof useTeams>;

const NAME_MAX = 50;

function NewTeamForm({ teams, players }: { teams: Teams; players: Player[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const existing = selected.length >= 2 ? findTeamByRoster(teams.teams, selected) : undefined;

  const toggle = (id: string) =>
    setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected.length < 2) return setError('Pick at least two players');
    setBusy(true);
    const { error: err } = existing
      ? await teams.renameTeam(existing.id, name || existing.name)
      : await teams.findOrCreateTeam(selected, name);
    setBusy(false);
    setError(err);
    if (!err) {
      setSelected([]);
      setName('');
      setOpen(false);
    }
  };

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className={secondaryButtonClass}>
        <Plus className="h-4 w-4" /> New team
      </button>
    );
  }

  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-3">
        <p className="text-sm font-semibold">Who's on the team?</p>
        <div className="flex flex-wrap gap-2">
          {players.map((p) => {
            const on = selected.includes(p.id);
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggle(p.id)}
                className={cn(
                  'flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm',
                  on
                    ? 'border-primary bg-primary/15 font-semibold'
                    : 'border-border hover:bg-muted/40',
                )}
              >
                <Avatar name={p.avatar} className="h-7 w-7" />
                {p.display_name}
              </button>
            );
          })}
        </div>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={NAME_MAX}
          placeholder={existing ? `Rename ${teamName(existing, players)}` : 'Team name (optional)'}
          aria-label="Team name"
          className={inputClass}
        />
        {existing && (
          <p className="text-xs text-muted-foreground">
            These players are already a team: {teamName(existing, players)}.
          </p>
        )}
        <ErrorText>{error}</ErrorText>
        <div className="flex gap-2">
          <button type="button" onClick={() => setOpen(false)} className={secondaryButtonClass}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || selected.length < 2 || (!!existing && !name.trim())}
            className={primaryButtonClass}
          >
            {existing ? 'Rename team' : 'Create team'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function TeamRow({
  team,
  teams,
  players,
  expanded,
  onToggle,
}: {
  team: TeamWithMembers;
  teams: Teams;
  players: Player[];
  expanded: boolean;
  onToggle: () => void;
}) {
  const { isAdmin } = useCurrentOrg();
  const [name, setName] = useState(team.name ?? '');
  const [error, setError] = useState<string | null>(null);
  const members = team.player_ids
    .map((id) => players.find((p) => p.id === id))
    .filter((p): p is Player => !!p);
  const display = teamName(team, players);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    const { error: err } = await teams.renameTeam(team.id, name);
    setError(err);
  };

  const remove = async () => {
    const warning =
      team.entry_count > 0
        ? `Delete ${display}? Their ${team.entry_count} score${team.entry_count === 1 ? '' : 's'} will be deleted too.`
        : `Delete ${display}?`;
    if (!window.confirm(warning)) return;
    const { error: err } = await teams.deleteTeam(team.id);
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
        <CompetitorAvatar avatars={members.map((m) => m.avatar)} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{display}</span>
          {team.name && (
            <span className="block truncate text-xs text-muted-foreground">
              {members.map((m) => m.display_name).join(' & ')}
            </span>
          )}
        </span>
        <span className="text-xs text-muted-foreground">
          {team.entry_count} {team.entry_count === 1 ? 'score' : 'scores'}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            expanded && 'rotate-180',
          )}
        />
      </button>

      {expanded && (
        <div className="space-y-3 px-4 pb-4">
          <form onSubmit={save} className="flex gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={NAME_MAX}
              placeholder={members.map((m) => m.display_name).join(' & ')}
              aria-label="Team name"
              className={inputClass}
            />
            <button
              type="submit"
              disabled={name.trim() === (team.name ?? '')}
              className={secondaryButtonClass}
            >
              Save
            </button>
          </form>
          <p className="text-xs text-muted-foreground">
            Leave the name blank to show the players' names. A team's roster can't change; make a
            new team for a new lineup.
          </p>
          {isAdmin && (
            <button type="button" onClick={remove} className={dangerButtonClass}>
              Delete team
            </button>
          )}
          <ErrorText>{error}</ErrorText>
        </div>
      )}
    </li>
  );
}

export function TeamsList({ teams, players }: { teams: Teams; players: Player[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const sorted = [...teams.teams].sort((a, b) =>
    teamName(a, players).localeCompare(teamName(b, players)),
  );

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Teams are a fixed group of players. They're created automatically when you log a score on a
        team board, or you can set one up here and give it a name.
      </p>
      <NewTeamForm teams={teams} players={players} />
      {sorted.length === 0 ? (
        <Card className="px-4 py-8 text-center text-sm text-muted-foreground">No teams yet.</Card>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {sorted.map((t) => (
              <TeamRow
                key={t.id}
                team={t}
                teams={teams}
                players={players}
                expanded={expanded === t.id}
                onToggle={() => setExpanded((cur) => (cur === t.id ? null : t.id))}
              />
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
