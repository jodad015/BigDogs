import { useNavigate } from 'react-router';
import { useWeighIns } from '@/hooks/use-weigh-ins';
import { useProfile } from '@/hooks/use-profile';
import { useChallenges } from '@/hooks/use-challenges';
import { avatarSrc } from '@/components/avatar-picker';
import { Scale, ArrowDown, ArrowUp } from 'lucide-react';
import { TrendChart } from '@/components/trend-chart';

function getWeekEntries(entries: { date: string; weight: number }[]) {
  const now = Date.now();
  return entries.filter((e) => {
    const diff = (now - new Date(e.date).getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { today, entries, trend, streak, isLoading } = useWeighIns();
  const { activeChallenge, hasActiveChallenge } = useChallenges();

  const weekEntries = getWeekEntries(entries);
  const weekChange =
    weekEntries.length >= 2
      ? Math.round((weekEntries[0]!.weight - weekEntries[weekEntries.length - 1]!.weight) * 10) / 10
      : null;

  const formatDate = () =>
    new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Scale className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  // Empty state — no weigh-ins at all
  if (entries.length === 0 && !today) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center">
        <Scale className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-bold mb-2">Start tracking your weight</h2>
        <p className="text-muted-foreground mb-8">
          Log your first weigh-in to see your trends and stats.
        </p>
        <button
          onClick={() => navigate('/weigh-in')}
          className="w-full max-w-xs rounded-xl bg-primary py-4 text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity"
        >
          Log Your Weight
        </button>
        {!hasActiveChallenge && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-muted-foreground">Create a Challenge</p>
            <p className="text-sm text-muted-foreground">Join a Challenge</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <img src={avatarSrc(profile?.avatar ?? 'crimson')} alt="" className="w-6 h-6" />
          <span className="text-sm font-extrabold tracking-widest uppercase">BigDogs</span>
        </div>
        <span className="text-sm text-muted-foreground">{formatDate()}</span>
      </div>

      {/* Today's Status Card */}
      <div
        className={`rounded-xl bg-card p-4 mb-4 border-l-4 ${
          today ? 'border-l-success' : 'border-l-warning'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Today</p>
            {today ? (
              <p className="text-3xl font-extrabold mt-1">{today.weight} lb</p>
            ) : (
              <p className="text-lg font-semibold mt-1 text-muted-foreground">No weigh-in yet</p>
            )}
          </div>
          {today ? (
            <div className="flex items-center gap-1.5 rounded-full bg-success/20 px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs font-semibold text-success">Logged</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 rounded-full bg-warning/20 px-3 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-warning" />
              <span className="text-xs font-semibold text-warning">Pending</span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex justify-around mb-4">
        {trend && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Trend</p>
            <p className="text-xl font-extrabold">{trend}</p>
          </div>
        )}
        {weekChange !== null && (
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">This Week</p>
            <p className={`text-xl font-extrabold flex items-center justify-center gap-1 ${
              weekChange <= 0 ? 'text-success' : 'text-destructive'
            }`}>
              {weekChange <= 0 ? <ArrowDown className="w-4 h-4" /> : <ArrowUp className="w-4 h-4" />}
              {Math.abs(weekChange)} lb
            </p>
          </div>
        )}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Streak</p>
          <p className="text-xl font-extrabold">{streak} days</p>
        </div>
      </div>

      {/* Trend Chart */}
      {entries.length >= 2 && (
        <div className="mb-4">
          <TrendChart entries={entries} />
        </div>
      )}

      {/* Log Weight CTA (if not logged today) */}
      {!today && (
        <button
          onClick={() => navigate('/weigh-in')}
          className="w-full rounded-xl bg-primary py-4 text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity mb-4"
        >
          Log Today's Weight
        </button>
      )}

      {/* Challenge Section */}
      {hasActiveChallenge ? (
        <div className="rounded-xl bg-card border border-primary/20 p-4">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Challenge</p>
          <p className="font-bold">{activeChallenge!.challenge.name}</p>
          <p className="text-xs text-muted-foreground mt-1 capitalize">{activeChallenge!.status}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => navigate('/challenge/create')}
            className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            Create a Challenge
          </button>
          <button
            onClick={() => navigate('/join')}
            className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Join a Challenge
          </button>
        </div>
      )}
    </div>
  );
}
