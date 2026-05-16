import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, TrendingDown, Target, Calendar } from 'lucide-react';

interface ParticipantData {
  display_name: string;
  starting_weight: number | null;
  target_weight: number | null;
  weekly_target: number | null;
  total_loss: number | null;
  goal_method: string | null;
  status: string;
}

interface WeekSummary {
  week_number: number;
  weekly_loss: number;
  weekly_score: number;
  placement: number;
  placement_points: number;
  is_showdown: boolean;
}

export default function ParticipantPage() {
  const { challengeId, userId } = useParams<{ challengeId: string; userId: string }>();
  const navigate = useNavigate();
  const [participant, setParticipant] = useState<ParticipantData | null>(null);
  const [weeks, setWeeks] = useState<WeekSummary[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchData = useCallback(() => {
    if (!challengeId || !userId) return;

    supabase
      .from('participants')
      .select('starting_weight, target_weight, weekly_target, total_loss, goal_method, status, profiles(display_name)')
      .eq('challenge_id', challengeId)
      .eq('user_id', userId)
      .single()
      .then(({ data }) => {
        if (!mounted.current || !data) return;
        const profile = data.profiles as unknown as { display_name: string };
        setParticipant({
          display_name: profile?.display_name ?? 'Unknown',
          starting_weight: data.starting_weight,
          target_weight: data.target_weight,
          weekly_target: data.weekly_target,
          total_loss: data.total_loss,
          goal_method: data.goal_method,
          status: data.status,
        });
      });

    supabase
      .from('weekly_results')
      .select('week_number, weekly_loss, weekly_score, placement, placement_points, is_showdown')
      .eq('challenge_id', challengeId)
      .eq('participant_id', userId)
      .order('week_number', { ascending: true })
      .then(({ data }) => {
        if (!mounted.current) return;
        const results = data ?? [];
        setWeeks(results);
        setTotalPoints(results.reduce((sum, r) => sum + r.placement_points, 0));
        setIsLoading(false);
      });
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

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold">{participant.display_name}</h1>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="rounded-xl bg-card p-3 text-center">
          <TrendingDown className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Target</p>
          <p className="text-lg font-extrabold">
            {participant.target_weight ? `${participant.target_weight}` : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-card p-3 text-center">
          <Target className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Pace</p>
          <p className="text-lg font-extrabold">
            {participant.weekly_target ? `${participant.weekly_target}/wk` : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-card p-3 text-center">
          <Calendar className="w-4 h-4 text-muted-foreground mx-auto mb-1" />
          <p className="text-xs text-muted-foreground">Points</p>
          <p className="text-lg font-extrabold">{totalPoints}</p>
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 mb-6">
        <div className={`w-2 h-2 rounded-full ${
          participant.status === 'active' ? 'bg-success' :
          participant.status === 'maintenance' ? 'bg-maintenance' :
          'bg-muted-foreground'
        }`} />
        <span className="text-sm text-muted-foreground capitalize">{participant.status}</span>
      </div>

      {/* Weekly History */}
      <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        Weekly Results
      </h2>

      {weeks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No scored weeks yet</p>
      ) : (
        <div className="space-y-2">
          {weeks.map((w) => (
            <div key={w.week_number} className="flex items-center justify-between rounded-lg bg-card px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-12">Wk {w.week_number}</span>
                <span className={`text-sm font-semibold ${
                  w.weekly_loss < 0 ? 'text-success' : w.weekly_loss > 0 ? 'text-destructive' : ''
                }`}>
                  {w.weekly_loss > 0 ? '+' : ''}{w.weekly_loss.toFixed(1)} lb
                </span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm">{w.weekly_score.toFixed(2)}</span>
                <span className="text-sm font-bold w-12 text-right">+{w.placement_points}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
