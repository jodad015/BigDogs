import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Challenge {
  id: string;
  created_by: string;
  name: string;
  invite_code: string;
  duration_weeks: number;
  max_participants: number;
  showdowns_enabled: boolean;
  is_public: boolean;
  timezone: string;
  spinup_start_date: string | null;
  start_date: string | null;
  status: string;
  created_at: string;
}

export interface ActiveParticipant {
  challenge_id: string;
  challenge: Challenge;
  status: string;
}

export interface CreateChallengeInput {
  name: string;
  duration_weeks: number;
  start_date: string;
  timezone: string;
  showdowns_enabled: boolean;
  is_public: boolean;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BDOG-${code}`;
}

export function useChallenges() {
  const { user } = useAuth();
  const [activeChallenge, setActiveChallenge] = useState<ActiveParticipant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const mounted = useRef(true);

  const fetchActive = useCallback(() => {
    if (!user) return;
    supabase
      .from('participants')
      .select('challenge_id, status, challenges(*)')
      .eq('user_id', user.id)
      .in('status', ['onboarding', 'spinup', 'active', 'maintenance'])
      .limit(1)
      .then(({ data }) => {
        if (!mounted.current) return;
        const row = data?.[0];
        if (row) {
          setActiveChallenge({
            challenge_id: row.challenge_id,
            challenge: row.challenges as unknown as Challenge,
            status: row.status,
          });
        } else {
          setActiveChallenge(null);
        }
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    mounted.current = true;
    fetchActive();
    return () => { mounted.current = false; };
  }, [fetchActive]);

  const hasActiveChallenge = activeChallenge !== null;

  const createChallenge = async (input: CreateChallengeInput) => {
    if (!user) return { data: null, error: 'Not authenticated' };
    if (hasActiveChallenge) return { data: null, error: 'You are already in a challenge' };

    const spinupStart = new Date(input.start_date);
    spinupStart.setDate(spinupStart.getDate() - 7);

    const { data, error } = await supabase
      .from('challenges')
      .insert({
        created_by: user.id,
        name: input.name,
        invite_code: generateInviteCode(),
        duration_weeks: input.duration_weeks,
        showdowns_enabled: input.showdowns_enabled,
        is_public: input.is_public,
        timezone: input.timezone,
        start_date: input.start_date,
        spinup_start_date: spinupStart.toISOString().split('T')[0]!,
        status: 'setup',
      })
      .select()
      .single();

    if (error) return { data: null, error: error.message };

    await supabase.from('participants').insert({
      challenge_id: data.id,
      user_id: user.id,
      status: 'onboarding',
    });

    fetchActive();
    return { data, error: null };
  };

  const lookupChallenge = async (inviteCode: string) => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase().trim())
      .single();

    if (error) return { data: null, error: 'Challenge not found' };
    return { data, error: null };
  };

  const joinChallenge = async (challengeId: string) => {
    if (!user) return { error: 'Not authenticated' };
    if (hasActiveChallenge) return { error: 'You are already in a challenge' };

    const { error } = await supabase.from('participants').insert({
      challenge_id: challengeId,
      user_id: user.id,
      status: 'onboarding',
    });

    if (error) return { error: error.message };
    fetchActive();
    return { error: null };
  };

  const leaveChallenge = async () => {
    if (!user || !activeChallenge) return { error: 'No active challenge' };

    const { error } = await supabase
      .from('participants')
      .delete()
      .eq('challenge_id', activeChallenge.challenge_id)
      .eq('user_id', user.id);

    if (error) return { error: error.message };
    fetchActive();
    return { error: null };
  };

  return {
    activeChallenge,
    hasActiveChallenge,
    isLoading,
    createChallenge,
    lookupChallenge,
    joinChallenge,
    leaveChallenge,
    refetch: fetchActive,
  };
}
