import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useWeighIns } from '@/hooks/use-weigh-ins';
import { X, Check, Delete } from 'lucide-react';

type ViewState = 'entry' | 'success';

export default function WeighInPage() {
  const navigate = useNavigate();
  const { today, entries, trend, logWeight } = useWeighIns();
  const [digits, setDigits] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<ViewState>('entry');
  const [savedWeight, setSavedWeight] = useState<number | null>(null);

  const alreadyLogged = !!today;
  // If user hasn't typed yet, show today's weight (or empty)
  const activeDigits = digits ?? (today ? String(today.weight) : '');

  const yesterday = entries.find((e) => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return e.date === d.toISOString().split('T')[0];
  });

  const displayWeight = activeDigits || '0';
  const numericWeight = parseFloat(activeDigits) || 0;
  const isValid = numericWeight > 50 && numericWeight < 999;

  const handleKey = (key: string) => {
    const current = activeDigits;
    if (key === 'backspace') {
      setDigits(current.slice(0, -1));
      return;
    }
    if (key === '.' && current.includes('.')) return;
    if (current.includes('.') && (current.split('.')[1]?.length ?? 0) >= 1) return;
    if (current.length >= 5) return;
    setDigits(current + key);
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    const result = await logWeight(numericWeight);
    if (!result.error) {
      setSavedWeight(numericWeight);
      setView('success');
      setTimeout(() => navigate('/'), 2500);
    }
    setSubmitting(false);
  };


  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  // Success view
  if (view === 'success' && savedWeight) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-success" />
        </div>
        <p className="text-4xl font-extrabold mb-2">{savedWeight} lb</p>
        {trend && (
          <p className="text-muted-foreground mb-1">
            Trend: <span className="font-semibold text-foreground">{trend} lb</span>
          </p>
        )}
        <p className="text-sm text-muted-foreground mt-4 animate-pulse">
          Returning to dashboard...
        </p>
      </div>
    );
  }

  // Entry / Already logged view
  return (
    <div className="flex flex-col min-h-[calc(100vh-6rem)] max-w-md mx-auto px-4 pt-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => navigate('/')} className="p-2 -ml-2">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
        <div className="text-center">
          <p className="font-bold">Log Weight</p>
          <p className="text-xs text-muted-foreground">{todayFormatted}</p>
        </div>
        <div className="w-9" />
      </div>

      {alreadyLogged && digits === null && (
        <p className="text-center text-sm text-success mb-1">Already logged today</p>
      )}

      {/* Weight Display */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <p className="text-6xl font-extrabold tracking-tight">
          {displayWeight}
          <span className="text-2xl font-semibold text-muted-foreground ml-1">lb</span>
        </p>
        {yesterday && (
          <p className="text-sm text-muted-foreground mt-2">
            Yesterday: {yesterday.weight} lb
          </p>
        )}
        {alreadyLogged && (
          <p className="text-xs text-muted-foreground mt-1">Tap number to edit</p>
        )}
      </div>

      {/* Numpad */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((key) => (
          <button
            key={key}
            onClick={() => handleKey(key)}
            className="rounded-lg bg-card h-14 text-xl font-semibold hover:bg-muted/50 active:bg-muted transition-colors"
          >
            {key}
          </button>
        ))}
        <button
          onClick={() => handleKey('backspace')}
          className="rounded-lg bg-card h-14 flex items-center justify-center hover:bg-muted/50 active:bg-muted transition-colors"
        >
          <Delete className="w-5 h-5" />
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={!isValid || submitting}
        className="w-full rounded-xl bg-primary py-4 text-primary-foreground font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-40 mb-4"
      >
        {submitting ? '...' : alreadyLogged ? 'Update' : 'Log It'}
      </button>
    </div>
  );
}
