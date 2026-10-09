import { useState } from 'react';
import { Link } from 'react-router';
import { ChevronDown, Plus, Trophy } from 'lucide-react';
import {
  describeRules,
  formatScore,
  WINDOW_LABELS,
  type Leaderboard,
  type TimeWindow,
} from '@bigdogs/shared';
import { useCurrentOrg } from '@/lib/current-org';
import { cn } from '@/lib/utils';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { useStandings } from '@/hooks/use-standings';
import { useCompetitors, type Competitor } from '@/hooks/use-competitors';
import { ClaimPlayer } from '@/components/claim-player';
import { CompetitorAvatar, RankBadge } from '@/components/competitor-avatar';
import { Card, ErrorText, Page, PageSpinner, primaryButtonClass } from '@/components/ui';

type Resolve = (playerId: string | null, teamId: string | null) => Competitor;

function BoardCard({ board, resolve }: { board: Leaderboard; resolve: Resolve }) {
  const { org } = useCurrentOrg();
  const window = board.default_window as TimeWindow;
  const { standings, isLoading } = useStandings(board.id, window);
  const top = standings.slice(0, 3);

  return (
    <Link
      to={`/o/${org.slug}/b/${board.id}`}
      className="block rounded-xl bg-card p-4 transition-shadow hover:ring-1 hover:ring-primary"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl leading-none" aria-hidden="true">
          {board.icon}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold">{board.name}</p>
          <p className="truncate text-xs text-muted-foreground">
            {describeRules(board)} · {WINDOW_LABELS[window]}
          </p>
        </div>
      </div>

      <ol className="mt-3 space-y-1.5">
        {isLoading ? (
          <li className="h-[5.5rem]" />
        ) : top.length === 0 ? (
          <li className="py-6 text-center text-sm text-muted-foreground">No scores yet</li>
        ) : (
          top.map((s) => {
            const who = resolve(s.player_id, s.team_id);
            return (
              <li key={s.player_id ?? s.team_id} className="flex items-center gap-2 text-sm">
                <RankBadge rank={s.rank} className="h-6 w-6 text-[11px]" />
                <CompetitorAvatar avatars={who.avatars} className="h-6 w-6" />
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate',
                    who.isMe && 'font-semibold text-primary',
                  )}
                >
                  {who.name}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatScore(board, board.aggregation, s)}
                </span>
              </li>
            );
          })
        )}
      </ol>
    </Link>
  );
}

export default function BoardsPage() {
  const { org } = useCurrentOrg();
  const { boards, isLoading, error } = useLeaderboards(org.id);
  const competitors = useCompetitors(org.id);
  const [showArchived, setShowArchived] = useState(false);
  const { players } = competitors;

  const active = boards.filter((b) => !b.archived_at);
  const archived = boards.filter((b) => b.archived_at);

  return (
    <Page
      title={org.name}
      action={
        <Link to={`/o/${org.slug}/new`} className={primaryButtonClass}>
          <Plus className="h-4 w-4" /> New board
        </Link>
      }
    >
      {!players.isLoading && !players.myPlayer && (
        <Card className="p-4">
          <h2 className="mb-3 font-semibold">Which player are you?</h2>
          <ClaimPlayer players={players} />
        </Card>
      )}

      <ErrorText>{error}</ErrorText>

      {isLoading || competitors.isLoading ? (
        <PageSpinner />
      ) : active.length === 0 ? (
        <Card className="px-4 py-10 text-center">
          <Trophy className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
          <p className="font-semibold">No leaderboards yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick the game your office argues about most.
          </p>
          <Link to={`/o/${org.slug}/new`} className={cn(primaryButtonClass, 'mt-4')}>
            <Plus className="h-4 w-4" /> Create the first board
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {active.map((b) => (
            <BoardCard key={b.id} board={b} resolve={competitors.resolve} />
          ))}
        </div>
      )}

      {archived.length > 0 && (
        <section className="space-y-2">
          <button
            type="button"
            onClick={() => setShowArchived((s) => !s)}
            aria-expanded={showArchived}
            className="flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            Archived ({archived.length})
            <ChevronDown
              className={cn('h-4 w-4 transition-transform', showArchived && 'rotate-180')}
            />
          </button>
          {showArchived && (
            <div className="grid grid-cols-1 gap-3 opacity-70 sm:grid-cols-2">
              {archived.map((b) => (
                <BoardCard key={b.id} board={b} resolve={competitors.resolve} />
              ))}
            </div>
          )}
        </section>
      )}
    </Page>
  );
}
