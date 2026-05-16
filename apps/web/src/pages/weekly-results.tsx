import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { avatarSrc } from '@/components/avatar-picker';
import { ChevronLeft, ChevronRight, Zap } from 'lucide-react';

interface WeekResult {
  participant_id: string;
  display_name: string;
  avatar: string;
  weekly_target: number;
  weekly_loss: number;
  performance_factor: number;
  weekly_score: number;
  placement: number;
  placement_points: number;
  is_showdown: boolean;
  is_maintenance: boolean;
}

const BADGE_STYLES: Record<number, string> = {
  1: 'bg-gold text-black',
  2: 'bg-silver text-black',
  3: 'bg-bronze text-white',
};

const FACTOR_COLOR = (f: number) =>
  f >= 0.7 ? 'text-success' : f >= 0.4 ? 'text-warning' : 'text-destructive';

export default function WeeklyResultsPage() {
  const { id: challengeId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [results, setResults] = useState<WeekResult[]>([]);
  const [weekNumber, setWeekNumber] = useState(1);
  const [maxWeek, setMaxWeek] = useState(1);
  const [weekDates, setWeekDates] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    const week = weekNumber;
    const cId = challengeId;
    if (!cId) return;

    supabase
      .from('weekly_results')
      .select('participant_id, weekly_loss, performance_factor, weekly_score, placement, placement_points, is_showdown, is_maintenance, week_start_date, week_end_date, participants(user_id, weekly_target, profiles(display_name, avatar))')
      .eq('challenge_id', cId)
      .eq('week_number', week)
      .order('placement', { ascending: true })
      .then(({ data }) => {
        if (!mounted.current) return;
        if (data && data.length > 0) {
          const first = data[0]!;
          const start = new Date(first.week_start_date + 'T12:00:00');
          const end = new Date(first.week_end_date + 'T12:00:00');
          setWeekDates(`${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`);
          setResults(data.map((r) => {
            const p = r.participants as unknown as { user_id: string; weekly_target: number; profiles: { display_name: string; avatar: string } };
            return {
              participant_id: r.participant_id,
              display_name: p?.profiles?.display_name ?? 'Unknown',
              avatar: p?.profiles?.avatar ?? 'crimson',
              weekly_target: p?.weekly_target ?? 0,
              weekly_loss: r.weekly_loss,
              performance_factor: r.performance_factor,
              weekly_score: r.weekly_score,
              placement: r.placement,
              placement_points: r.placement_points,
              is_showdown: r.is_showdown,
              is_maintenance: r.is_maintenance,
            };
          }));
        } else {
          setResults([]);
        }
        setIsLoading(false);
      });

    supabase
      .from('weekly_results')
      .select('week_number')
      .eq('challenge_id', cId)
      .order('week_number', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0] && mounted.current) setMaxWeek(data[0].week_number);
      });

    return () => { mounted.current = false; };
  }, [challengeId, weekNumber]);

  const isShowdown = results.some((r) => r.is_showdown);

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/leaderboard')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      {/* Week Nav */}
      <div className="flex items-center justify-center gap-5 mb-1">
        <button
          onClick={() => weekNumber > 1 && setWeekNumber(weekNumber - 1)}
          disabled={weekNumber <= 1}
          className="p-1 disabled:opacity-30"
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <span className="text-lg font-bold">Week {weekNumber} of {maxWeek}</span>
        <button
          onClick={() => weekNumber < maxWeek && setWeekNumber(weekNumber + 1)}
          disabled={weekNumber >= maxWeek}
          className="p-1 disabled:opacity-30"
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>
      <p className="text-sm text-muted-foreground text-center mb-4">{weekDates}</p>

      {/* Showdown Banner */}
      {isShowdown && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-showdown to-purple-900 px-4 py-2.5 mb-4">
          <Zap className="w-4 h-4 text-gold" />
          <span className="text-sm font-extrabold tracking-wide text-white">SHOWDOWN WEEK — 2x Points</span>
          <Zap className="w-4 h-4 text-gold" />
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results for this week</p>
        </div>
      ) : (
        <div className="space-y-3">
          {results.map((r) => (
            <div
              key={r.participant_id}
              className={`rounded-xl bg-card p-4 ${
                r.placement === 1 ? 'border border-gold/30' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-3">
                  {r.is_maintenance ? (
                    <span className="rounded-full bg-maintenance px-3 py-1 text-xs font-bold text-white">
                      Maintenance
                    </span>
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold ${
                      BADGE_STYLES[r.placement] ?? 'bg-muted text-muted-foreground'
                    }`}>
                      {r.placement}
                    </div>
                  )}
                  <img src={avatarSrc(r.avatar)} alt="" className="w-7 h-7 rounded-full" />
                  <span className="font-bold">{r.display_name}</span>
                </div>
                <span className={`font-extrabold ${
                  BADGE_STYLES[r.placement] ? 'text-gold' : 'text-muted-foreground'
                }`}>
                  +{r.placement_points} pts{isShowdown ? ' 2x' : ''}
                </span>
              </div>

              {!r.is_maintenance && (
                <div className="flex justify-around text-center">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Loss</p>
                    <p className={`text-sm font-semibold ${
                      r.weekly_loss < 0 ? 'text-success' : r.weekly_loss > 0 ? 'text-destructive' : ''
                    }`}>
                      {r.weekly_loss > 0 ? '+' : ''}{r.weekly_loss.toFixed(1)} lb
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      goal: {r.weekly_target.toFixed(1)}/wk
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Factor</p>
                    <p className={`text-sm font-semibold ${FACTOR_COLOR(r.performance_factor)}`}>
                      {r.performance_factor.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</p>
                    <p className="text-sm font-semibold">{r.weekly_score.toFixed(2)}</p>
                  </div>
                </div>
              )}

              {r.is_maintenance && (
                <p className="text-sm text-maintenance text-center">Within ±2 lb of target</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
