import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Trophy } from 'lucide-react';

interface Standing {
  user_id: string;
  display_name: string;
  total_points: number;
  weeks_played: number;
  placement: number;
}

const MEDAL_COLORS: Record<number, string> = {
  1: 'bg-gold text-black',
  2: 'bg-silver text-black',
  3: 'bg-bronze text-white',
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [standings, setStandings] = useState<Standing[]>([]);
  const [challengeName, setChallengeName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasChallenge, setHasChallenge] = useState(true);
  const mounted = useRef(true);

  const fetchStandings = useCallback(() => {
    if (!user) return;

    // Find user's active challenge
    supabase
      .from('participants')
      .select('challenge_id, challenges(id, name, status)')
      .eq('user_id', user.id)
      .in('status', ['active', 'spinup', 'onboarding'])
      .limit(1)
      .then(({ data: participantData }) => {
        if (!mounted.current) return;

        const participant = participantData?.[0];
        if (!participant) {
          setHasChallenge(false);
          setIsLoading(false);
          return;
        }

        const challenge = participant.challenges as unknown as { id: string; name: string; status: string };
        setChallengeName(challenge.name);

        // Get all participants + their total points
        supabase
          .from('participants')
          .select('id, user_id, profiles(display_name)')
          .eq('challenge_id', challenge.id)
          .then(({ data: participants }) => {
            if (!mounted.current || !participants) {
              setIsLoading(false);
              return;
            }

            // Get weekly results for total points
            supabase
              .from('weekly_results')
              .select('participant_id, placement_points')
              .eq('challenge_id', challenge.id)
              .then(({ data: results }) => {
                if (!mounted.current) return;

                // Map participant_id (participants.id) → points
                const pointsById: Record<string, number> = {};
                const weeksById: Record<string, number> = {};

                for (const r of results ?? []) {
                  pointsById[r.participant_id] = (pointsById[r.participant_id] ?? 0) + r.placement_points;
                  weeksById[r.participant_id] = (weeksById[r.participant_id] ?? 0) + 1;
                }

                const s: Standing[] = participants.map((p, i) => ({
                  user_id: p.user_id,
                  display_name: (p.profiles as unknown as { display_name: string })?.display_name ?? 'Unknown',
                  total_points: pointsById[p.id] ?? 0,
                  weeks_played: weeksById[p.id] ?? 0,
                  placement: i + 1,
                }));

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

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold text-center mb-1">{challengeName}</h1>
      <p className="text-sm text-muted-foreground text-center mb-6">Leaderboard</p>

      {standings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No results yet</p>
          <p className="text-sm text-muted-foreground mt-1">Standings appear after the first scored week</p>
        </div>
      ) : (
        <div className="space-y-3">
          {standings.map((s) => (
            <div
              key={s.user_id}
              className={`flex items-center gap-4 rounded-xl bg-card p-4 ${
                s.user_id === user?.id ? 'border border-primary/30' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-extrabold ${
                  MEDAL_COLORS[s.placement] ?? 'bg-muted text-muted-foreground'
                }`}
              >
                {s.placement}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold truncate">{s.display_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.weeks_played} week{s.weeks_played !== 1 ? 's' : ''} played
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-extrabold">{s.total_points}</p>
                <p className="text-xs text-muted-foreground">pts</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
