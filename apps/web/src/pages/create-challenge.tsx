import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useChallenges, type Challenge } from '@/hooks/use-challenges';
import { ChevronLeft, Check, Copy, Share2 } from 'lucide-react';

const DURATIONS = [10, 12, 14, 16] as const;

export default function CreateChallengePage() {
  const navigate = useNavigate();
  const { createChallenge, hasActiveChallenge, isLoading: challengeLoading } = useChallenges();

  const [name, setName] = useState('');
  const [duration, setDuration] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [timezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [showdowns, setShowdowns] = useState(true);
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<Challenge | null>(null);
  const [copied, setCopied] = useState(false);

  // Redirect if already in a challenge
  if (!challengeLoading && hasActiveChallenge && !created) {
    navigate('/', { replace: true });
    return null;
  }

  const canSubmit = name.trim() && duration && startDate;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    setSubmitting(true);
    setError('');

    const result = await createChallenge({
      name: name.trim(),
      duration_weeks: duration,
      start_date: startDate,
      timezone,
      showdowns_enabled: showdowns,
      is_public: isPublic,
    });

    if (result.error) {
      setError(result.error);
      setSubmitting(false);
    } else {
      setCreated(result.data);
    }
  };

  const handleCopy = async () => {
    if (!created) return;
    await navigator.clipboard.writeText(created.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Success state
  if (created) {
    const startFormatted = new Date(created.start_date + 'T12:00:00').toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)] px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Challenge Created!</h2>
        <p className="text-muted-foreground mb-1">{created.name}</p>
        <p className="text-sm text-muted-foreground mb-8">
          {created.duration_weeks} weeks starting {startFormatted}
        </p>

        <p className="text-4xl font-mono font-bold tracking-widest mb-4">{created.invite_code}</p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors"
          >
            <Copy className="w-4 h-4" />
            {copied ? 'Copied!' : 'Copy Code'}
          </button>
          <button className="flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:bg-muted/50 transition-colors">
            <Share2 className="w-4 h-4" />
            Share Link
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-6">Share this code to invite others</p>

        <button
          onClick={() => navigate('/')}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Form
  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold">Create Challenge</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Challenge Name</label>
          <input
            type="text"
            placeholder="Name your challenge"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Duration</label>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDuration(d)}
                className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  duration === d
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                {d} wk
              </button>
            ))}
          </div>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          {startDate && (
            <p className="text-xs text-muted-foreground mt-1">
              Spin-up week begins{' '}
              {new Date(new Date(startDate + 'T12:00:00').getTime() - 7 * 86400000).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm text-muted-foreground mb-1.5">Timezone</label>
          <div className="rounded-lg border border-border bg-input px-4 py-3 text-sm text-muted-foreground">
            {timezone}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium">Showdown Weeks</p>
              <p className="text-xs text-muted-foreground">Double points on final Fridays</p>
            </div>
            <button
              type="button"
              onClick={() => setShowdowns(!showdowns)}
              className={`w-11 h-6 rounded-full transition-colors ${showdowns ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${showdowns ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between rounded-lg bg-card px-4 py-3">
            <div>
              <p className="text-sm font-medium">Public Challenge</p>
              <p className="text-xs text-muted-foreground">Anyone can view the leaderboard</p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`w-11 h-6 rounded-full transition-colors ${isPublic ? 'bg-primary' : 'bg-border'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isPublic ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={!canSubmit || submitting}
          className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          {submitting ? 'Creating...' : 'Create Challenge'}
        </button>
      </form>
    </div>
  );
}
