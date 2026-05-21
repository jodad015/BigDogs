import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { avatarSrc } from '@/components/avatar-picker';
import { TrendChart } from '@/components/trend-chart';
import type { WeighIn } from '@/hooks/use-weigh-ins';
import { ChevronLeft } from 'lucide-react';

interface ParticipantData {
  participant_id: string;
  display_name: string;
  avatar: string;
  starting_weight: number | null;
  starting_trend_weight: number | null;
  target_weight: number | null;
  weekly_target: number | null;
  total_loss: number | null;
  status: string;
  challenge_start_date: string | null;
  has_started: boolean;
}

interface WeekSummary {
  week_number: number;
  weekly_loss: number;
  weekly_score: number;
  placement: number;
  placement_points: number;
  is_showdown: boolean;
  is_maintenance: boolean;
}

const BADGE_COLORS: Record<number, string> = {
  1: 'bg-gold text-black',
  2: 'bg-silver text-black',
  3: 'bg-bronze text-white',
};

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-success/20 text-success',
  maintenance: 'bg-maintenance/20 text-maintenance',
  spinup: 'bg-warning/20 text-warning',
  onboarding: 'bg-muted text-muted-foreground',
  complete: 'bg-muted text-muted-foreground',
};

function formatStartDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function ParticipantPage() {
  const { challengeId, userId } = useParams<{ challengeId: string; userId: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [weighIns, setWeighIns] = useState<WeighIn[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [bestWeek, setBestWeek] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    if (!challengeId || !userId) return;

    const { data } = await supabase
      .from('participants')
      .select('id, starting_weight, starting_trend_weight, target_weight, weekly_target, total_loss, status, profiles(display_name, avatar), challenges(start_date, status)')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single();

    if (!mounted.current || !data) return;

    const profile = data.profiles as unknown as { display_name: string; avatar: string };
    const challenge = data.challenges as unknown as { start_date: string | null; status: string };

    const todayStr = new Date().toISOString().split('T')[0]!;
    const hasStarted = challenge.start_date !== null && challenge.start_date <= todayStr;

    let startingTrend = data.starting_trend_weight as number | null;

    if (hasStarted && startingTrend === null) {
      await supabase.rpc('ensure_starting_trend_weight', { p_participant_id: data.id });
      const { data: refreshed } = await supabase
        .from('participants')
        .select('starting_trend_weight')
        .eq('id', data.id)
        .single();
      if (mounted.current && refreshed) {
        startingTrend = refreshed.starting_trend_weight;
      }
    }

    setParticipant({
      participant_id: data.id,
      display_name: profile?.display_name ?? 'Unknown',
      avatar: profile?.avatar ?? 'crimson',
      starting_weight: data.starting_weight,
      starting_trend_weight: startingTrend,
      target_weight: data.target_weight,
      weekly_target: data.weekly_target,
      total_loss: data.total_loss,
      status: data.status,
      challenge_start_date: challenge.start_date,
      has_started: hasStarted,
    });

    if (hasStarted) {
      supabase
        .from('weekly_results')
        .select('week_number, weekly_loss, weekly_score, placement, placement_points, is_showdown, is_maintenance')
        .eq('challenge_id', challengeId)
        .eq('participant_id', data.id)
        .order('week_number', { ascending: false })
        .then(({ data: results }) => {
          if (!mounted.current) return;
          const rows = results ?? [];
          setWeeks(rows);
          const pts = rows.reduce((sum, r) => sum + r.placement_points, 0);
          setTotalPoints(pts);
          setBestWeek(rows.length > 0 ? Math.max(...rows.map((r) => r.placement_points)) : 0);
        });
    }

    const { data: weighInRows } = await supabase
      .from('weigh_ins')
      .select('id, user_id, date, weight, trend_weight, created_at')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(60);

    if (!mounted.current) return;
    setWeighIns(weighInRows ?? []);

    let count = 0;
    const sorted = [...(weighInRows ?? [])].sort((a, b) => b.date.localeCompare(a.date));
    const d = new Date();
    for (const entry of sorted) {
      if (entry.date === d.toISOString().split('T')[0]) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(count);
    setIsLoading(false);
  }, [challengeId, userId]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  if (isLoading || !participant) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const baseline = participant.starting_trend_weight ?? participant.starting_weight;
  const currentWeight = weighIns.length > 0 ? weighIns[0]!.weight : baseline;
  const progressPct = baseline && participant.target_weight && currentWeight
    ? Math.min(100, Math.round(
        ((baseline - currentWeight) /
          (baseline - participant.target_weight)) * 100
      ))
    : 0;

  const startsLabel = participant.challenge_start_date
    ? formatStartDate(participant.challenge_start_date)
    : null;

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-lg font-bold">{participant.display_name}</span>
        <div className="w-7" />
      </div>

      {/* Avatar + Status + Progress */}
      <div className="flex items-center gap-4 mb-4">
        <img src={avatarSrc(participant.avatar)} alt="" className="w-14 h-14 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-lg">{participant.display_name}</span>
            {participant.has_started ? (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                STATUS_STYLES[participant.status] ?? 'bg-muted text-muted-foreground'
              }`}>
                {participant.status}
              </span>
            ) : (
              startsLabel && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Starts {startsLabel}
                </span>
              )
            )}
          </div>
          {participant.has_started ? (
            <>
              <div className="h-2 rounded-full bg-muted overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.max(0, progressPct)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {progressPct > 0 ? `${progressPct}% toward goal` : 'Getting started'}
              </p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">
              Challenge hasn't started yet
            </p>
          )}
        </div>
      </div>

      {/* Goal Info — post-start uses the official starting_trend_weight baseline */}
      {participant.target_weight && (() => {
        const startValue = participant.has_started
          ? participant.starting_trend_weight
          : participant.starting_weight;
        return (
          <div className="flex justify-around rounded-xl bg-card p-3 mb-4">
            {startValue && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Start</p>
                <p className="text-sm font-bold">{startValue} lb</p>
              </div>
            )}
            <div className="text-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Goal</p>
              <p className="text-sm font-bold">{participant.target_weight} lb</p>
            </div>
            {participant.weekly_target && (
              <div className="text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Pace</p>
                <p className="text-sm font-bold">{participant.weekly_target} lb/wk</p>
              </div>
            )}
          </div>
        );
      })()}

      {/* Stats Row — challenge stats only after start; streak always */}
      <div className="flex justify-around mb-5">
        {participant.has_started && (
          <>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Pts</p>
              <p className="text-2xl font-extrabold">{totalPoints}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Best Week</p>
              <p className="text-2xl font-extrabold">{bestWeek} pts</p>
            </div>
          </>
        )}
        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Streak</p>
          <p className="text-2xl font-extrabold">{streak} days</p>
        </div>
      </div>

      {/* Trend Chart */}
      {weighIns.length >= 2 && (
        <div className="mb-5">
          <TrendChart entries={weighIns} />
        </div>
      )}

      {/* Weekly Scores — only after challenge starts */}
      {participant.has_started && (
        <>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Weekly Scores
          </h2>

          {weeks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No scored weeks yet</p>
          ) : (
            <div className="space-y-2">
              {weeks.map((w) => (
                <div
                  key={w.week_number}
                  onClick={() => challengeId && navigate(`/challenge/${challengeId}/week?w=${w.week_number}`)}
                  className="flex items-center gap-3 rounded-xl bg-card px-4 py-3 cursor-pointer hover:bg-card/80 transition-colors"
                >
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold ${
                    BADGE_COLORS[w.placement] ?? 'bg-muted text-muted-foreground'
                  }`}>
                    {w.placement}
                  </span>

                  <div className="flex-1">
                    <p className="text-sm font-semibold">Week {w.week_number}</p>
                    {w.is_maintenance ? (
                      <p className="text-xs text-maintenance">Within ±2 lb</p>
                    ) : (
                      <p className={`text-xs ${
                        w.weekly_loss < 0 ? 'text-success' : w.weekly_loss > 0 ? 'text-destructive' : 'text-muted-foreground'
                      }`}>
                        {w.weekly_loss > 0 ? '+' : ''}{w.weekly_loss.toFixed(1)} lb
                        {participant?.weekly_target ? (
                          <span className="text-muted-foreground"> / {participant.weekly_target} goal</span>
                        ) : null}
                      </p>
                    )}
                  </div>

                  <span className={`text-sm font-bold ${
                    w.placement <= 2 ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    +{w.placement_points} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
