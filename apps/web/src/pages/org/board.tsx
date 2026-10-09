import { useCallback, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { Archive, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  describeRules,
  formatEntryValue,
  formatScore,
  formatScoreDetail,
  TIME_WINDOWS,
  WINDOW_LABELS,
  type Entry,
  type Leaderboard,
  type Standing,
  type TimeWindow,
} from '@bigdogs/shared';
import { useAuth } from '@/lib/auth';
import { useCurrentOrg } from '@/lib/current-org';
import { relativeTime } from '@/lib/time';
import { cn } from '@/lib/utils';
import { useLeaderboard } from '@/hooks/use-leaderboards';
import { useEntriesRealtime, useStandings } from '@/hooks/use-standings';
import { useEntries } from '@/hooks/use-entries';
import { useCompetitors, type Competitor } from '@/hooks/use-competitors';
import { CompetitorAvatar, RankBadge } from '@/components/competitor-avatar';
import {
  Badge,
  Card,
  ErrorText,
  Page,
  PageSpinner,
  primaryButtonClass,
  secondaryButtonClass,
} from '@/components/ui';

type Resolve = (playerId: string | null, teamId: string | null) => Competitor;

function competitorKey(x: { player_id: string | null; team_id: string | null }) {
  return x.player_id ?? x.team_id ?? '';
}

function WindowTabs({ value, onChange }: { value: TimeWindow; onChange: (w: TimeWindow) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Time window"
      className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1"
    >
      {TIME_WINDOWS.map((w) => (
        <button
          key={w}
          role="tab"
          type="button"
          aria-selected={value === w}
          onClick={() => onChange(w)}
          className={cn(
            'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors',
            value === w ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground',
          )}
        >
          {WINDOW_LABELS[w]}
        </button>
      ))}
    </div>
  );
}

function StandingsList({
  board,
  standings,
  resolve,
  selected,
  onSelect,
}: {
  board: Leaderboard;
  standings: Standing[];
  resolve: Resolve;
  selected: string | null;
  onSelect: (key: string | null) => void;
}) {
  if (standings.length === 0) {
    return (
      <Card className="px-4 py-10 text-center">
        <p className="font-semibold">No scores yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Log the first one and take the top spot.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <ol className="divide-y divide-border">
        {standings.map((s) => {
          const who = resolve(s.player_id, s.team_id);
          const key = competitorKey(s);
          const detail = formatScoreDetail(board, board.aggregation, s);
          return (
            <li key={key}>
              <button
                type="button"
                onClick={() => onSelect(selected === key ? null : key)}
                aria-pressed={selected === key}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-muted/30',
                  selected === key && 'bg-primary/10',
                )}
              >
                <RankBadge rank={s.rank} />
                <CompetitorAvatar avatars={who.avatars} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate font-semibold">{who.name}</span>
                    {who.isMe && <Badge tone="primary">You</Badge>}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {s.entry_count} {s.entry_count === 1 ? 'entry' : 'entries'} ·{' '}
                    {relativeTime(s.last_achieved_at)}
                  </span>
                </span>
                <span className="text-right">
                  <span className="block text-lg font-bold tabular-nums">
                    {formatScore(board, board.aggregation, s)}
                  </span>
                  {detail && <span className="block text-xs text-muted-foreground">{detail}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}

function RecentEntries({
  board,
  entries,
  resolve,
  filter,
  onClearFilter,
  onDelete,
}: {
  board: Leaderboard;
  entries: Entry[];
  resolve: Resolve;
  filter: string | null;
  onClearFilter: () => void;
  onDelete: (entry: Entry) => void;
}) {
  const { user } = useAuth();
  const { org, isAdmin } = useCurrentOrg();
  const shown = filter ? entries.filter((e) => competitorKey(e) === filter) : entries;
  const filtered = filter ? entries.find((e) => competitorKey(e) === filter) : undefined;
  const filterName = filtered ? resolve(filtered.player_id, filtered.team_id).name : null;

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground">
          {filter ? 'Scores' : 'Recent scores'}
        </h2>
        {filter && (
          <button
            type="button"
            onClick={onClearFilter}
            className="flex items-center gap-1 text-xs font-semibold text-primary"
          >
            <X className="h-3.5 w-3.5" /> Show everyone
          </button>
        )}
      </div>
      {shown.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {filterName ? `No recent scores for ${filterName}.` : 'Nothing logged yet.'}
        </p>
      ) : (
        <Card>
          <ul className="divide-y divide-border">
            {shown.map((e) => {
              const who = resolve(e.player_id, e.team_id);
              const canManage = isAdmin || e.recorded_by === user?.id || who.isMe;
              return (
                <li key={e.id} className="flex items-center gap-3 px-4 py-2.5">
                  <CompetitorAvatar avatars={who.avatars} className="h-7 w-7" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">
                      <span className="font-semibold">{who.name}</span>{' '}
                      <span className="tabular-nums">
                        {formatEntryValue(board, e.value, e.attempts)}
                      </span>
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {relativeTime(e.achieved_at)}
                      {e.note ? ` · ${e.note}` : ''}
                    </p>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 gap-1">
                      <Link
                        to={`/o/${org.slug}/b/${board.id}/log?entry=${e.id}`}
                        aria-label="Edit score"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => onDelete(e)}
                        aria-label="Delete score"
                        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </section>
  );
}

export default function BoardPage() {
  const { boardId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { org, isAdmin } = useCurrentOrg();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { board, isLoading } = useLeaderboard(boardId);
  const requested = params.get('w') as TimeWindow | null;
  const timeWindow: TimeWindow =
    requested && TIME_WINDOWS.includes(requested)
      ? requested
      : ((board?.default_window as TimeWindow | undefined) ?? 'all_time');

  const standings = useStandings(boardId, timeWindow);
  const entries = useEntries(boardId);
  const competitors = useCompetitors(org.id);

  const refetchStandings = standings.refetch;
  const refetchEntries = entries.refetch;
  const refetchCompetitors = competitors.refetch;
  const onRealtime = useCallback(() => {
    // A new score may come with a new team, so refresh names too
    void Promise.all([refetchStandings(), refetchEntries(), refetchCompetitors()]);
  }, [refetchStandings, refetchEntries, refetchCompetitors]);
  useEntriesRealtime(boardId, onRealtime);

  if (isLoading || competitors.isLoading) return <PageSpinner />;
  if (!board) {
    return (
      <Page title="Leaderboard not found">
        <Link to={`/o/${org.slug}`} className="text-sm font-semibold text-primary">
          Back to boards
        </Link>
      </Page>
    );
  }

  const canEditBoard = isAdmin || board.created_by === user?.id;
  const archived = board.archived_at !== null;

  const deleteEntry = async (entry: Entry) => {
    if (!window.confirm('Delete this score?')) return;
    const { error: err } = await entries.deleteEntry(entry.id);
    setError(err);
    if (!err) void standings.refetch();
  };

  return (
    <Page
      title={`${board.icon} ${board.name}`}
      action={
        canEditBoard && (
          <Link
            to={`/o/${org.slug}/b/${board.id}/edit`}
            aria-label="Edit leaderboard"
            className={secondaryButtonClass}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        )
      }
    >
      <div className="-mt-3 space-y-1">
        <p className="text-sm text-muted-foreground">
          {describeRules(board)}
          {board.entrant_type === 'team' ? ` · teams of ${board.team_size}` : ''}
        </p>
        {board.description && <p className="text-sm">{board.description}</p>}
      </div>

      {archived ? (
        <p className="flex items-center gap-2 rounded-lg bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
          <Archive className="h-4 w-4" /> This board is archived. Scores are read-only.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => navigate(`/o/${org.slug}/b/${board.id}/log`)}
          className={cn(primaryButtonClass, 'w-full py-3 text-base')}
        >
          <Plus className="h-5 w-5" /> Log a score
        </button>
      )}

      <WindowTabs
        value={timeWindow}
        onChange={(w) => setParams(w === board.default_window ? {} : { w }, { replace: true })}
      />
      <ErrorText>{standings.error ?? error}</ErrorText>
      {standings.isLoading ? (
        <PageSpinner />
      ) : (
        <StandingsList
          board={board}
          standings={standings.standings}
          resolve={competitors.resolve}
          selected={selected}
          onSelect={setSelected}
        />
      )}

      <RecentEntries
        board={board}
        entries={entries.entries}
        resolve={competitors.resolve}
        filter={selected}
        onClearFilter={() => setSelected(null)}
        onDelete={deleteEntry}
      />
    </Page>
  );
}
