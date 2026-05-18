import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { supabase } from '@/lib/supabase';
import { Trophy } from 'lucide-react';

interface PublicStanding {
  display_name: string;
  total_points: number;
  placement: number;
}

interface ChallengeInfo {
  name: string;
  status: string;
  duration_weeks: number;
  start_date: string | null;
}

const BADGE_STYLES: Record<number, string> = {
  1: 'bg-gold text-black',
  2: 'bg-silver text-black',
  3: 'bg-bronze text-white',
};

export default function PublicChallengePage() {
  const { id } = useParams<{ id: string }>();
  const [challenge, setChallenge] = useState<ChallengeInfo | null>(null);
  const [standings, setStandings] = useState<PublicStanding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const mounted = useRef(true);

  const fetchData = useCallback(() => {
    if (!id) return;

    supabase
      .from('challenges')
      .select('name, status, duration_weeks, start_date, is_public')
      .eq('id', id)
      .eq('is_public', true)
      .single()
      .then(({ data, error }) => {
        if (!mounted.current) return;
        if (error || !data) {
          setNotFound(true);
          setIsLoading(false);
          return;
        }
        setChallenge(data);

        // Get participants + points
        supabase
          .from('participants')
          .select('user_id, profiles(display_name)')
          .eq('challenge_id', id)
          .then(({ data: participants }) => {
            if (!mounted.current || !participants) {
              setIsLoading(false);
              return;
            }

            supabase
              .from('weekly_results')
              .select('participant_id, placement_points')
              .eq('challenge_id', id)
              .then(({ data: results }) => {
                if (!mounted.current) return;

                const pointsByParticipant: Record<string, number> = {};
                for (const r of results ?? []) {
                  pointsByParticipant[r.participant_id] = (pointsByParticipant[r.participant_id] ?? 0) + r.placement_points;
                }

                const s: PublicStanding[] = participants.map((p) => ({
                  display_name: (p.profiles as unknown as { display_name: string })?.display_name ?? 'Unknown',
                  total_points: pointsByParticipant[p.user_id] ?? 0,
                  placement: 0,
                }));

                s.sort((a, b) => b.total_points - a.total_points);
                s.forEach((item, i) => { item.placement = i + 1; });

                setStandings(s);
                setIsLoading(false);
              });
          });
      });
  }, [id]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    return () => { mounted.current = false; };
  }, [fetchData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
        <Trophy className="w-16 h-16 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-2">Challenge not found</h1>
        <p className="text-muted-foreground">This challenge doesn't exist or isn't public.</p>
      </div>
    );
  }

  const statusPill = (() => {
    switch (challenge?.status) {
      case 'active': return { label: 'In Progress', color: 'bg-success/20 text-success' };
      case 'complete': return { label: 'Complete', color: 'bg-muted text-muted-foreground' };
      case 'spinup': return { label: 'Starting Soon', color: 'bg-warning/20 text-warning' };
      default: return { label: challenge?.status ?? '', color: 'bg-muted text-muted-foreground' };
    }
  })();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="text-center pt-12 pb-6 px-4">
        <div className="flex items-center justify-center gap-2 mb-3">
          <img src="/avatars/bigdog-crimson.svg" alt="" className="w-5 h-5" />
          <span className="text-xs font-extrabold tracking-[0.15em] uppercase text-muted-foreground">BigDogs</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">{challenge?.name}</h1>
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusPill.color}`}>
          {statusPill.label}
        </span>
      </div>

      {/* Standings */}
      <div className="px-4 max-w-md mx-auto">
        <p className="text-sm text-muted-foreground uppercase tracking-wide mb-3">Standings</p>

        {standings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No results yet</p>
        ) : (
          <div className="space-y-2">
            {standings.map((s, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-card p-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold ${
                  BADGE_STYLES[s.placement] ?? 'bg-muted text-muted-foreground'
                }`}>
                  {s.placement}
                </div>
                <span className="flex-1 font-bold">{s.display_name}</span>
                <span className="text-lg font-extrabold">{s.total_points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center py-12 px-4">
        <p className="text-muted-foreground mb-3">Want to compete?</p>
        <a
          href="/signup"
          className="inline-block rounded-xl bg-primary px-8 py-3.5 text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          Join BigDogs
        </a>
        <p className="text-xs text-muted-foreground mt-3">Free to use. No ads. No nonsense.</p>
      </div>
    </div>
  );
}
