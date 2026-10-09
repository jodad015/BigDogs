import { useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import type { LeaderboardValues } from '@/components/leaderboard-form';
import type { Leaderboard } from '@bigdogs/shared';
import { useAuth } from '@/lib/auth';
import { useCurrentOrg } from '@/lib/current-org';
import { useLeaderboard } from '@/hooks/use-leaderboards';
import { LeaderboardForm } from '@/components/leaderboard-form';
import {
  Card,
  dangerButtonClass,
  ErrorText,
  Page,
  PageSpinner,
  secondaryButtonClass,
} from '@/components/ui';

function toValues(b: Leaderboard): LeaderboardValues {
  return {
    name: b.name,
    description: b.description,
    icon: b.icon,
    metric_type: b.metric_type as LeaderboardValues['metric_type'],
    unit: b.unit,
    decimals: b.decimals,
    default_attempts: b.default_attempts,
    direction: b.direction as LeaderboardValues['direction'],
    aggregation: b.aggregation as LeaderboardValues['aggregation'],
    default_window: b.default_window as LeaderboardValues['default_window'],
    entrant_type: b.entrant_type as LeaderboardValues['entrant_type'],
    team_size: b.team_size,
  };
}

export default function EditBoardPage() {
  const { boardId = '' } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { org, isAdmin } = useCurrentOrg();
  const { board, entryCount, isLoading, updateBoard, deleteBoard } = useLeaderboard(boardId);
  const [error, setError] = useState<string | null>(null);

  if (isLoading) return <PageSpinner />;
  if (!board) return <Navigate to={`/o/${org.slug}`} replace />;
  if (!isAdmin && board.created_by !== user?.id) {
    return <Navigate to={`/o/${org.slug}/b/${board.id}`} replace />;
  }

  const boardUrl = `/o/${org.slug}/b/${board.id}`;
  const archived = board.archived_at !== null;

  const toggleArchive = async () => {
    const { error: err } = await updateBoard({
      archived_at: archived ? null : new Date().toISOString(),
    });
    setError(err);
  };

  const remove = async () => {
    const warning =
      entryCount > 0
        ? `Delete ${board.name} and all ${entryCount} of its scores? This can't be undone. Archiving keeps the history.`
        : `Delete ${board.name}?`;
    if (!window.confirm(warning)) return;
    const { error: err } = await deleteBoard();
    if (err) return setError(err);
    navigate(`/o/${org.slug}`, { replace: true });
  };

  return (
    <Page
      title="Edit leaderboard"
      action={
        <Link to={boardUrl} className={secondaryButtonClass}>
          Done
        </Link>
      }
    >
      <LeaderboardForm
        initial={toValues(board)}
        shapeLocked={entryCount > 0}
        submitLabel="Save changes"
        onSubmit={async (values) => {
          const { error: err } = await updateBoard(values);
          if (!err) navigate(boardUrl, { replace: true });
          return { error: err };
        }}
      />

      <Card className="space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold">{archived ? 'Archived' : 'Archive'}</p>
            <p className="text-sm text-muted-foreground">
              {archived
                ? 'Hidden from the boards list and closed to new scores.'
                : 'Hide it and stop new scores, but keep the history.'}
            </p>
          </div>
          <button type="button" onClick={toggleArchive} className={secondaryButtonClass}>
            {archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
            {archived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
          <div>
            <p className="font-semibold">Delete</p>
            <p className="text-sm text-muted-foreground">
              Removes the board and every score on it.
            </p>
          </div>
          <button type="button" onClick={remove} className={dangerButtonClass}>
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
        <ErrorText>{error}</ErrorText>
      </Card>
    </Page>
  );
}
