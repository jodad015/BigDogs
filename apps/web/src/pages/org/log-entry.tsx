import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Check, Search, UserPlus } from 'lucide-react';
import {
  entryValueToInput,
  formatEntryValue,
  parseEntryValue,
  playerNameSchema,
  type Entry,
  type Leaderboard,
  type Player,
} from '@bigdogs/shared';
import { useCurrentOrg } from '@/lib/current-org';
import { toDateTimeLocal } from '@/lib/time';
import { cn } from '@/lib/utils';
import { AVATARS } from '@/lib/avatars';
import { useLeaderboard } from '@/hooks/use-leaderboards';
import { saveEntry, useEntry } from '@/hooks/use-entries';
import { useCompetitors } from '@/hooks/use-competitors';
import { findTeamByRoster, teamName } from '@/hooks/use-teams';
import {
  Avatar,
  ErrorText,
  inputClass,
  Page,
  PageSpinner,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui';

const bigInputClass = cn(inputClass, 'py-3 text-center text-3xl font-bold tabular-nums');

function PlayerPicker({
  players,
  selected,
  max,
  myPlayerId,
  onToggle,
  onAdd,
}: {
  players: Player[];
  selected: string[];
  max: number;
  myPlayerId: string | null;
  onToggle: (id: string) => void;
  onAdd: (name: string) => Promise<string | null>;
}) {
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // You first, then alphabetical
  const sorted = useMemo(
    () =>
      [...players].sort((a, b) =>
        a.id === myPlayerId
          ? -1
          : b.id === myPlayerId
            ? 1
            : a.display_name.localeCompare(b.display_name),
      ),
    [players, myPlayerId],
  );
  const q = query.trim().toLowerCase();
  const shown = q ? sorted.filter((p) => p.display_name.toLowerCase().includes(q)) : sorted;
  const exactMatch = players.some((p) => p.display_name.toLowerCase() === q);

  const add = async () => {
    const parsed = playerNameSchema.safeParse(query);
    if (!parsed.success) return setError(parsed.error.issues[0]!.message);
    setAdding(true);
    const err = await onAdd(parsed.data);
    setAdding(false);
    setError(err);
    if (!err) setQuery('');
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find or add a player"
          aria-label="Find or add a player"
          className={cn(inputClass, 'pl-9')}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {shown.map((p) => {
          const isSelected = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onToggle(p.id)}
              className={cn(
                'flex items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-sm transition-colors',
                isSelected
                  ? 'border-primary bg-primary/15 font-semibold'
                  : 'border-border hover:bg-muted/40',
              )}
            >
              <Avatar name={p.avatar} className="h-7 w-7" />
              {p.display_name}
              {p.id === myPlayerId && <span className="text-xs text-muted-foreground">(you)</span>}
              {isSelected && max > 1 && <Check className="h-3.5 w-3.5 text-primary" />}
            </button>
          );
        })}
      </div>
      {q && !exactMatch && (
        <button type="button" onClick={add} disabled={adding} className={secondaryButtonClass}>
          <UserPlus className="h-4 w-4" /> {adding ? 'Adding…' : `Add "${query.trim()}"`}
        </button>
      )}
      <ErrorText>{error}</ErrorText>
    </div>
  );
}

function ValueInput({
  board,
  value,
  attempts,
  onValue,
  onAttempts,
}: {
  board: Leaderboard;
  value: string;
  attempts: string;
  onValue: (v: string) => void;
  onAttempts: (v: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => ref.current?.focus(), []);

  if (board.metric_type === 'made_of_attempts') {
    return (
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          inputMode="numeric"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder="7"
          aria-label={`${board.unit} made`}
          className={bigInputClass}
        />
        <span className="shrink-0 text-muted-foreground">of</span>
        <input
          inputMode="numeric"
          value={attempts}
          onChange={(e) => onAttempts(e.target.value)}
          placeholder="10"
          aria-label="Attempts"
          className={bigInputClass}
        />
      </div>
    );
  }

  const isDuration = board.metric_type === 'duration';
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3">
        <input
          ref={ref}
          inputMode="decimal"
          value={value}
          onChange={(e) => onValue(e.target.value)}
          placeholder={isDuration ? '1:12.4' : '0'}
          aria-label="Score"
          className={bigInputClass}
        />
        {!isDuration && <span className="shrink-0 text-muted-foreground">{board.unit}</span>}
      </div>
      {isDuration && (
        <p className="text-center text-xs text-muted-foreground">
          Seconds (72.4) or minutes:seconds (1:12.4)
        </p>
      )}
    </div>
  );
}

function LogForm({
  board,
  existing,
  competitors,
}: {
  board: Leaderboard;
  existing: Entry | null;
  competitors: ReturnType<typeof useCompetitors>;
}) {
  const navigate = useNavigate();
  const { org } = useCurrentOrg();
  const { players, teams } = competitors;
  const myPlayerId = players.myPlayer?.id ?? null;
  const teamSize = board.entrant_type === 'team' ? (board.team_size ?? 2) : 1;
  const boardUrl = `/o/${org.slug}/b/${board.id}`;

  const [selected, setSelected] = useState<string[]>(() => {
    if (existing?.player_id) return [existing.player_id];
    if (existing?.team_id)
      return teams.teams.find((t) => t.id === existing.team_id)?.player_ids ?? [];
    return myPlayerId ? [myPlayerId] : [];
  });
  const [value, setValue] = useState(existing ? entryValueToInput(board, existing.value) : '');
  const [attempts, setAttempts] = useState(
    existing?.attempts?.toString() ?? board.default_attempts?.toString() ?? '',
  );
  const [when, setWhen] = useState<string | null>(
    existing ? toDateTimeLocal(new Date(existing.achieved_at)) : null,
  );
  const [note, setNote] = useState(existing?.note ?? '');
  const [newTeamName, setNewTeamName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const toggle = (id: string) =>
    setSelected((cur) =>
      cur.includes(id)
        ? cur.filter((x) => x !== id)
        : teamSize === 1
          ? [id]
          : cur.length < teamSize
            ? [...cur, id]
            : cur,
    );

  const addPlayer = async (name: string) => {
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)]!;
    const { player, error: err } = await players.addPlayer(name, avatar);
    if (player) toggle(player.id);
    return err;
  };

  const parsed = parseEntryValue(board, value, attempts);
  const rosterComplete = teamSize > 1 && selected.length === teamSize;
  const matchedTeam = rosterComplete ? findTeamByRoster(teams.teams, selected) : undefined;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (selected.length !== teamSize) {
      return setError(teamSize === 1 ? 'Pick who scored' : `Pick ${teamSize} players`);
    }
    if (!parsed.ok) return setError(parsed.error);

    setBusy(true);
    let teamId: string | null = null;
    if (teamSize > 1) {
      const res = await teams.findOrCreateTeam(selected, matchedTeam ? null : newTeamName);
      if (res.error || !res.teamId) {
        setBusy(false);
        return setError(res.error ?? 'Could not create the team');
      }
      teamId = res.teamId;
    }

    const { error: err } = await saveEntry(
      board,
      {
        player_id: teamSize === 1 ? selected[0]! : null,
        team_id: teamId,
        value: parsed.value,
        attempts: parsed.attempts,
        achieved_at: when ? new Date(when).toISOString() : new Date().toISOString(),
        note: note.trim() || null,
      },
      existing?.id,
    );
    setBusy(false);
    if (err) return setError(err);
    navigate(boardUrl, { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="space-y-2">
        <h2 className="text-sm font-semibold">
          {teamSize === 1 ? 'Who?' : `Who's on the team? (${selected.length}/${teamSize})`}
        </h2>
        <PlayerPicker
          players={players.players}
          selected={selected}
          max={teamSize}
          myPlayerId={myPlayerId}
          onToggle={toggle}
          onAdd={addPlayer}
        />
        {rosterComplete &&
          (matchedTeam ? (
            <p className="text-sm text-muted-foreground">
              Team:{' '}
              <span className="font-semibold text-foreground">
                {teamName(matchedTeam, players.players)}
              </span>
            </p>
          ) : (
            <input
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              maxLength={50}
              placeholder="New team! Give it a name (optional)"
              aria-label="Team name"
              className={inputClass}
            />
          ))}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">Score</h2>
        <ValueInput
          board={board}
          value={value}
          attempts={attempts}
          onValue={setValue}
          onAttempts={setAttempts}
        />
        {parsed.ok && (
          <p className="text-center text-sm text-muted-foreground">
            {formatEntryValue(board, parsed.value, parsed.attempts)}
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">When</h2>
        {when === null ? (
          <div className="flex items-center gap-3 text-sm">
            <span>Just now</span>
            <button
              type="button"
              onClick={() => setWhen(toDateTimeLocal(new Date()))}
              className="font-semibold text-primary"
            >
              Earlier…
            </button>
          </div>
        ) : (
          <input
            type="datetime-local"
            value={when}
            max={toDateTimeLocal(new Date())}
            onChange={(e) => setWhen(e.target.value || null)}
            aria-label="When"
            className={inputClass}
          />
        )}
      </section>

      <input
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={280}
        placeholder="Note (optional): witnesses, trash talk…"
        aria-label="Note"
        className={inputClass}
      />

      <ErrorText>{error}</ErrorText>
      <div className="flex gap-2">
        <Link to={boardUrl} className={cn(secondaryButtonClass, 'py-3')}>
          Cancel
        </Link>
        <button
          type="submit"
          disabled={busy}
          className={cn(primaryButtonClass, 'flex-1 py-3 text-base')}
        >
          {busy ? 'Saving…' : existing ? 'Save changes' : 'Log score'}
        </button>
      </div>
    </form>
  );
}

export default function LogEntryPage() {
  const { boardId = '' } = useParams();
  const [params] = useSearchParams();
  const entryId = params.get('entry');
  const { org } = useCurrentOrg();
  const { board, isLoading } = useLeaderboard(boardId);
  const existing = useEntry(entryId);
  const competitors = useCompetitors(org.id);

  if (isLoading || competitors.isLoading || (entryId && existing.isLoading)) return <PageSpinner />;
  if (!board) {
    return (
      <Page title="Leaderboard not found">
        <Link to={`/o/${org.slug}`} className="text-sm font-semibold text-primary">
          Back to boards
        </Link>
      </Page>
    );
  }

  return (
    <Page title={`${board.icon} ${existing.data ? 'Edit score' : board.name}`}>
      <LogForm board={board} existing={existing.data} competitors={competitors} />
    </Page>
  );
}
