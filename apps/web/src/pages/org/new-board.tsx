import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { describeRules, LEADERBOARD_TEMPLATES, type LeaderboardTemplate } from '@bigdogs/shared';
import { useCurrentOrg } from '@/lib/current-org';
import { useLeaderboards } from '@/hooks/use-leaderboards';
import { LeaderboardForm, type LeaderboardValues } from '@/components/leaderboard-form';
import { Page, secondaryButtonClass } from '@/components/ui';

const BLANK: LeaderboardValues = {
  name: '',
  description: null,
  icon: '🏆',
  metric_type: 'count',
  unit: 'reps',
  decimals: 0,
  default_attempts: null,
  direction: 'higher_better',
  aggregation: 'best',
  default_window: 'all_time',
  entrant_type: 'player',
  team_size: null,
};

function fromTemplate(t: LeaderboardTemplate): LeaderboardValues {
  return {
    name: t.name,
    description: t.description,
    icon: t.icon,
    metric_type: t.metric_type,
    unit: t.unit,
    decimals: t.decimals,
    default_attempts: t.default_attempts,
    direction: t.direction,
    aggregation: t.aggregation,
    default_window: t.default_window,
    entrant_type: t.entrant_type,
    team_size: t.team_size,
  };
}

export default function NewBoardPage() {
  const navigate = useNavigate();
  const { org } = useCurrentOrg();
  const { createBoard } = useLeaderboards(org.id);
  const [start, setStart] = useState<LeaderboardValues | null>(null);

  if (!start) {
    return (
      <Page title="New leaderboard">
        <p className="text-sm text-muted-foreground">
          Start from a common game or from scratch. You can change everything on the next step.
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {LEADERBOARD_TEMPLATES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setStart(fromTemplate(t))}
              className="flex items-center gap-3 rounded-xl bg-card p-3 text-left hover:ring-1 hover:ring-primary"
            >
              <span className="text-2xl" aria-hidden="true">
                {t.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-semibold">{t.name}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {describeRules(t)}
                  {t.entrant_type === 'team' ? ` · teams of ${t.team_size}` : ''}
                </span>
              </span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setStart(BLANK)}
            className="flex items-center gap-3 rounded-xl border border-dashed border-border p-3 text-left hover:border-primary"
          >
            <Sparkles className="h-6 w-6 text-primary" />
            <span>
              <span className="block font-semibold">Start from scratch</span>
              <span className="block text-xs text-muted-foreground">Any game, any scoring</span>
            </span>
          </button>
        </div>
      </Page>
    );
  }

  return (
    <Page
      title="New leaderboard"
      action={
        <button type="button" onClick={() => setStart(null)} className={secondaryButtonClass}>
          <ArrowLeft className="h-4 w-4" /> Templates
        </button>
      }
    >
      <LeaderboardForm
        initial={start}
        submitLabel="Create leaderboard"
        onSubmit={async (values) => {
          const { board, error } = await createBoard(values);
          if (board) navigate(`/o/${org.slug}/b/${board.id}`, { replace: true });
          return { error };
        }}
      />
    </Page>
  );
}
