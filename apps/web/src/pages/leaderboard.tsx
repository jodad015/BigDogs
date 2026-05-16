import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { avatarSrc } from '@/components/avatar-picker';
import { Trophy } from 'lucide-react';

interface Standing {
  user_id: string;
  display_name: string;
  avatar: string;
  total_points: number;
  max_possible_points: number;
  weeks_played: number;
  placement: number;
}

interface ChallengeInfo {
  name: string;
  status: string;
  duration_weeks: number;
  start_date: string | null;
}

const BADGE_COLORS: Record<number, string> = {
  1: 'bg-gold text-black',
  2: 'bg-silver text-black',
  3: 'bg-bronze text-white',
};

const BAR_COLORS: Record<number, string> = {
  1: 'bg-primary',
  2: 'bg-[#8B5CF6]',
  3: 'bg-success',
  4: 'bg-warning',
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChallenge, setHasChallenge] = useState(true);
  const mounted = useRef(true);

  const fetchStandings = useCallback(() => {
    if (!user) return;

    supabase
      .from('participants')
      .select('challenge_id, challenges(id, name, status, duration_weeks, start_date)')
      .eq('user_id', user.id)
      .in('status', ['active', 'spinup', 'onboarding'])
      .limit(1)
      .then(({ data: participantData }) => {
        if (!mounted.current) return;

        const row = participantData?.[0];
        if (!row) {
          setHasChallenge(false);
          setIsLoading(false);
          return;
        }

        const c = row.challenges as unknown as ChallengeInfo & { id: string };
        setChallenge(c);
        setChallengeId(c.id);

        // Calculate current week
        if (c.start_date) {
          const start = new Date(c.start_date + 'T12:00:00');
          const now = new Date();
          const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          setCurrentWeek(Math.max(1, Math.min(Math.ceil(diffDays / 7), c.duration_weeks)));
        }

        supabase
          .from('participants')
          .select('id, user_id, profiles(display_name, avatar)')
          .eq('challenge_id', c.id)
          .then(({ data: participants }) => {
            if (!mounted.current || !participants) {
              setIsLoading(false);
              return;
            }

            supabase
              .from('weekly_results')
              .select('participant_id, placement_points')
              .eq('challenge_id', c.id)
              .then(({ data: results }) => {
                if (!mounted.current) return;

                const pointsById: Record<string, number> = {};
                const weeksById: Record<string, number> = {};

                for (const r of results ?? []) {
                  pointsById[r.participant_id] = (pointsById[r.participant_id] ?? 0) + r.placement_points;
                  weeksById[r.participant_id] = (weeksById[r.participant_id] ?? 0) + 1;
                }

                // Max possible = 4 points per week * weeks played (for the leader)
                const maxWeeks = Math.max(...Object.values(weeksById), 1);
                const maxPossible = maxWeeks * participants.length;

                const s: Standing[] = participants.map((p) => {
                  const profile = p.profiles as unknown as { display_name: string; avatar: string };
                  return {
                    user_id: p.user_id,
                    display_name: profile?.display_name ?? 'Unknown',
                    avatar: profile?.avatar ?? 'crimson',
                    total_points: pointsById[p.id] ?? 0,
                    max_possible_points: maxPossible,
                    weeks_played: weeksById[p.id] ?? 0,
                    placement: 0,
                  };
                });

                s.sort((a, b) => b.total_points - a.total_points);
                s.forEach((item, i) => { item.placement = i + 1; });

                setStandings(s);
                setIsLoading(false);
              });
          });
      });
  }, [user]);

  useEffect(() => {
    mounted.current = true;
    fetchStandings();
    return () => { mounted.current = false; };
  }, [fetchStandings]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Trophy className="w-8 h-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  if (!hasChallenge) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 text-center py-20">
        <Trophy className="w-16 h-16 text-muted-foreground mb-6" />
        <h2 className="text-xl font-bold mb-2">No active challenge</h2>
        <p className="text-muted-foreground mb-8">Join or create a challenge to see the leaderboard.</p>
        <div className="space-y-3 w-full max-w-xs">
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
      </div>
    );
  }

  const isComplete = challenge?.status === 'complete';
  const winner = isComplete && standings.length > 0 ? standings[0] : null;

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      {/* Header */}
      <h1 className="text-xl font-bold text-center mb-0.5">
        {isComplete ? 'Final Standings' : 'Leaderboard'}
      </h1>
      <p className="text-sm text-muted-foreground text-center">
        {challenge?.name} — {isComplete ? 'Complete' : `Week ${currentWeek} of ${challenge?.duration_weeks}`}
      </p>

      {/* Winner banner */}
      {winner && (
        <div className="flex items-center justify-center gap-2 mt-3 mb-2">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-gold font-bold">{winner.display_name} wins!</span>
        </div>
      )}

      {/* Standings */}
      <div className="mt-5 space-y-3">
        {standings.map((s, i) => {
          const barPct = s.max_possible_points > 0
            ? Math.round((s.total_points / s.max_possible_points) * 100)
            : 0;

          return (
            <div
              key={s.user_id}
              onClick={() => challengeId && navigate(`/challenge/${challengeId}/participant/${s.user_id}`)}
              className={`rounded-xl bg-card p-4 cursor-pointer hover:bg-card/80 transition-colors ${
                s.user_id === user?.id ? 'border border-primary/30' : ''
              } ${i === 0 && isComplete ? 'border border-gold/40' : ''}`}
            >
              <div className="flex items-center gap-3 mb-3">
                {/* Placement badge */}
                <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                  BADGE_COLORS[s.placement] ?? 'bg-muted text-muted-foreground'
                }`}>
                  {s.placement === 1 ? '1st' : s.placement === 2 ? '2nd' : s.placement === 3 ? '3rd' : `${s.placement}th`}
                </span>

                {/* Avatar */}
                <img src={avatarSrc(s.avatar)} alt="" className="w-8 h-8 rounded-full" />

                {/* Name */}
                <span className="font-bold flex-1">{s.display_name}</span>

                {/* Points */}
                <span className="text-2xl font-extrabold">{s.total_points}</span>
                <span className="text-xs text-muted-foreground">pts</span>
              </div>

              {/* Progress bar */}
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${BAR_COLORS[s.placement] ?? 'bg-muted-foreground'}`}
                  style={{ width: `${barPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Share (complete state) */}
      {isComplete && (
        <button className="w-full flex items-center justify-center gap-2 mt-6 py-3 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Share Results
        </button>
      )}
    </div>
  );
}
