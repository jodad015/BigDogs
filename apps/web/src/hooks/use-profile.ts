import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface Profile {
  id: string;
  email: string;
  display_name: string;
  avatar: string;
  height_inches: number | null;
  age: number | null;
  personal_target_weight: number | null;
  created_at: string;
  updated_at: string;
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'display_name' | 'height_inches' | 'age' | 'personal_target_weight' | 'avatar'>
>;

// Shared event so all useProfile instances stay in sync
const listeners = new Set<() => void>();
function notifyProfileChanged() {
  listeners.forEach((fn) => fn());
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const retryCount = useRef(0);
  const fetchRef = useRef<() => void>(undefined);
  const MAX_RETRIES = 3;

  const fetchProfile = useCallback(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error: err }) => {
        if (!mounted.current) return;
        if (err && err.code === 'PGRST116' && retryCount.current < MAX_RETRIES) {
          retryCount.current += 1;
          setTimeout(() => { if (mounted.current) fetchRef.current?.(); }, 1500);
          return;
        }
        if (err) {
          setError(err.message);
        } else {
          setProfile(data);
          setError(null);
          retryCount.current = 0;
        }
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => { fetchRef.current = fetchProfile; }, [fetchProfile]);

  useEffect(() => {
    mounted.current = true;
    fetchProfile();

    // Re-fetch when any instance updates the profile
    listeners.add(fetchProfile);
    return () => {
      mounted.current = false;
      listeners.delete(fetchProfile);
    };
  }, [fetchProfile]);

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: 'Not authenticated' };
    const { error: err } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (err) return { error: err.message };
    notifyProfileChanged();
    return { error: null };
  };

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
}
