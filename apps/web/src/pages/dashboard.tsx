import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { useWeighIns } from '@/hooks/use-weigh-ins';
import { useChallenges } from '@/hooks/use-challenges';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/lib/theme';
import { supabase } from '@/lib/supabase';
import { Scale, ArrowDown, ArrowUp, ChevronRight } from 'lucide-react';
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
  const { user } = useAuth();
  const { today, entries, trend, streak, isLoading } = useWeighIns();
  const { activeChallenge, hasActiveChallenge } = useChallenges();
  const { theme } = useTheme();

  // Challenge stats
  const [challengeStats, setChallengeStats] = useState<{ points: number; placement: number; totalParticipants: number; weeksPlayed: number } | null>(null);
  const statsMounted = useRef(true);

  const fetchChallengeStats = useCallback(() => {
    if (!user || !activeChallenge) return;
    const cId = activeChallenge.challenge_id;

    // Get all participants + their points
    supabase
      .from('participants')
      .select('id, user_id')
      .eq('challenge_id', cId)
      .then(({ data: participants }) => {
        if (!statsMounted.current || !participants) return;

        supabase
          .from('weekly_results')
          .select('participant_id, placement_points')
          .eq('challenge_id', cId)
          .then(({ data: results }) => {
            if (!statsMounted.current) return;

            const pointsById: Record<string, number> = {};
            const weeksById: Record<string, number> = {};
            for (const r of results ?? []) {
              pointsById[r.participant_id] = (pointsById[r.participant_id] ?? 0) + r.placement_points;
              weeksById[r.participant_id] = (weeksById[r.participant_id] ?? 0) + 1;
            }

            const sorted = participants
              .map((p) => ({ id: p.id, user_id: p.user_id, pts: pointsById[p.id] ?? 0 }))
              .sort((a, b) => b.pts - a.pts);

            const myIdx = sorted.findIndex((s) => s.user_id === user.id);
            const me = participants.find((p) => p.user_id === user.id);

            setChallengeStats({
              points: me ? (pointsById[me.id] ?? 0) : 0,
              placement: myIdx >= 0 ? myIdx + 1 : 0,
              totalParticipants: participants.length,
              weeksPlayed: me ? (weeksById[me.id] ?? 0) : 0,
            });
          });
      });
  }, [user, activeChallenge]);

  useEffect(() => {
    statsMounted.current = true;
    fetchChallengeStats();
    return () => { statsMounted.current = false; };
  }, [fetchChallengeStats]);

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
          <img src={theme === 'dark' ? '/logo-white.svg' : '/logo-dark.svg'} alt="" className="w-7 h-5" />
          <span className="text-sm font-extrabold tracking-widest uppercase">Big Dogs</span>
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
        <div>
          {activeChallenge!.status === 'onboarding' ? (
            <div className="rounded-xl bg-card border border-primary/20 p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Active Challenge</p>
              <p className="font-bold">{activeChallenge!.challenge.name}</p>
              <button
                onClick={() => navigate(`/challenge/${activeChallenge!.challenge_id}/onboarding`)}
                className="w-full mt-3 rounded-lg bg-primary py-2.5 text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Finish Setup — Set Your Goal
              </button>
            </div>
          ) : (
            <div
              onClick={() => navigate('/leaderboard')}
              className="rounded-xl bg-card border border-primary/20 p-4 cursor-pointer hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Active Challenge</p>
                  <p className="font-bold">{activeChallenge!.challenge.name}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
              {challengeStats && (
                <div className="flex justify-around pt-2 border-t border-border">
                  {challengeStats.weeksPlayed > 0 ? (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Place</p>
                        <p className="text-lg font-extrabold">
                          {challengeStats.placement === 1 ? '1st' :
                           challengeStats.placement === 2 ? '2nd' :
                           challengeStats.placement === 3 ? '3rd' :
                           `${challengeStats.placement}th`}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Points</p>
                        <p className="text-lg font-extrabold">{challengeStats.points}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Weeks</p>
                        <p className="text-lg font-extrabold">{challengeStats.weeksPlayed}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Participants</p>
                        <p className="text-lg font-extrabold">{challengeStats.totalParticipants}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Status</p>
                        <p className="text-lg font-extrabold capitalize">{activeChallenge!.status}</p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
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
