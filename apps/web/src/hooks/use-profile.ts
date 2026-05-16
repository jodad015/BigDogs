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

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchProfile = useCallback(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data, error: err }) => {
        if (!mounted.current) return;
        if (err) {
          setError(err.message);
        } else {
          setProfile(data);
          setError(null);
        }
        setIsLoading(false);
      });
  }, [user]);

  useEffect(() => {
    mounted.current = true;
    fetchProfile();
    return () => { mounted.current = false; };
  }, [fetchProfile]);

  const updateProfile = async (updates: ProfileUpdate) => {
    if (!user) return { error: 'Not authenticated' };
    const { error: err } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (err) return { error: err.message };
    fetchProfile();
    return { error: null };
  };

  return { profile, isLoading, error, updateProfile, refetch: fetchProfile };
}
