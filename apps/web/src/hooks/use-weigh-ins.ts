import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export interface WeighIn {
  id: string;
  user_id: string;
  date: string;
  weight: number;
  trend_weight: number | null;
  created_at: string;
}

function computeTrend(entries: WeighIn[]): number | null {
  if (entries.length === 0) return null;
  const sorted = [...entries].sort((a, b) => a.date.localeCompare(b.date));
  const alpha = 2 / (Math.min(sorted.length, 7) + 1);
  let ema = sorted[0]!.weight;
  for (let i = 1; i < sorted.length; i++) {
    ema = alpha * sorted[i]!.weight + (1 - alpha) * ema;
  }
  return Math.round(ema * 10) / 10;
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0]!;
}

export function useWeighIns(limit = 30) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<WeighIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const fetchEntries = useCallback(() => {
    if (!user) return;
    supabase
      .from('weigh_ins')
      .select('id, user_id, date, weight, trend_weight, created_at')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(limit)
      .then(({ data, error: err }) => {
        if (!mounted.current) return;
        if (err) {
          setError(err.message);
        } else {
          setEntries(data ?? []);
          setError(null);
        }
        setIsLoading(false);
      });
  }, [user, limit]);

  useEffect(() => {
    mounted.current = true;
    fetchEntries();
    return () => { mounted.current = false; };
  }, [fetchEntries]);

  const today = entries.find((e) => e.date === todayStr()) ?? null;

  const streak = (() => {
    let count = 0;
    const sorted = [...entries].sort((a, b) => b.date.localeCompare(a.date));
    const d = new Date();
    for (const entry of sorted) {
      const expected = d.toISOString().split('T')[0];
      if (entry.date === expected) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return count;
  })();

  const trend = computeTrend(entries);

  const logWeight = async (weight: number, date?: string) => {
    if (!user) return { error: 'Not authenticated' };
    const dateStr = date ?? todayStr();

    const { data, error: err } = await supabase.functions.invoke('entity-store', {
      body: {
        type: 'WeighInStore',
        userId: user.id,
        date: dateStr,
        weight,
      },
    });

    if (err) return { error: err.message };
    if (data?.errors?.length) return { error: data.errors[0].message };
    fetchEntries();
    return { error: null };
  };

  const deleteEntry = async (id: string) => {
    const { error: err } = await supabase.from('weigh_ins').delete().eq('id', id);
    if (err) return { error: err.message };
    fetchEntries();
    return { error: null };
  };

  return { entries, today, streak, trend, isLoading, error, logWeight, deleteEntry, refetch: fetchEntries };
}
