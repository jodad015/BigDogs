import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useChallenges, type Challenge } from '@/hooks/use-challenges';
import { ChevronLeft, Trophy } from 'lucide-react';

export default function JoinChallengePage() {
  const navigate = useNavigate();
  const { lookupChallenge, joinChallenge, hasActiveChallenge, isLoading: challengeLoading } = useChallenges();

  const [code, setCode] = useState('');
  const [preview, setPreview] = useState<Challenge | null>(null);
  const [error, setError] = useState('');
  const [looking, setLooking] = useState(false);
  const [joining, setJoining] = useState(false);

  // Redirect if already in a challenge
  if (!challengeLoading && hasActiveChallenge) {
    navigate('/', { replace: true });
    return null;
  }

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || looking) return;
    setLooking(true);
    setError('');
    setPreview(null);

    const result = await lookupChallenge(code);
    if (result.error) {
      setError(result.error);
    } else {
      setPreview(result.data);
    }
    setLooking(false);
  };

  const handleJoin = async () => {
    if (!preview || joining) return;
    setJoining(true);
    setError('');

    const result = await joinChallenge(preview.id);
    if (result.error) {
      setError(result.error);
      setJoining(false);
    } else {
      navigate(`/challenge/${preview.id}/onboarding`);
    }
  };

  return (
    <div className="px-4 pt-2 pb-4 max-w-md mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/')} className="p-1 -ml-1">
          <ChevronLeft className="w-5 h-5 text-muted-foreground" />
        </button>
        <h1 className="text-xl font-bold">Join Challenge</h1>
      </div>

      {!preview ? (
        <>
          {/* Code Entry */}
          <div className="flex flex-col items-center py-8">
            <Trophy className="w-12 h-12 text-muted-foreground mb-6" />
            <p className="text-lg font-medium mb-6">Enter your invite code</p>

            <form onSubmit={handleLookup} className="w-full space-y-4">
              <input
                type="text"
                placeholder="BDOG-XXXX"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className={`w-full rounded-lg border bg-input px-4 py-3.5 text-center text-lg font-mono font-bold tracking-[0.2em] placeholder:text-placeholder placeholder:font-normal placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-ring ${
                  error ? 'border-destructive' : 'border-border'
                }`}
              />

              {error && <p className="text-sm text-destructive text-center">{error}</p>}

              <button
                type="submit"
                disabled={!code.trim() || looking}
                className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                {looking ? 'Looking up...' : 'Join'}
              </button>
            </form>

            <p className="text-xs text-muted-foreground mt-6">
              Got a link? Just open it in your browser.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* Challenge Preview */}
          <div className="rounded-xl bg-card border border-border p-5 mb-6">
            <div className="text-center mb-4">
              <p className="text-xs text-muted-foreground font-mono tracking-wider mb-2">
                {preview.invite_code}
              </p>
              <h2 className="text-xl font-bold">{preview.name}</h2>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration</span>
                <span className="font-medium">{preview.duration_weeks} weeks</span>
              </div>
              {preview.start_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Starts</span>
                  <span className="font-medium">
                    {new Date(preview.start_date + 'T12:00:00').toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {preview.showdowns_enabled && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Showdowns</span>
                  <span className="font-medium text-showdown">Enabled</span>
                </div>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-destructive text-center mb-4">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full rounded-xl bg-success py-3.5 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 mb-3"
          >
            {joining ? 'Joining...' : 'Join This Challenge'}
          </button>

          <p className="text-xs text-muted-foreground text-center">
            You'll set your goal after joining
          </p>

          <button
            onClick={() => { setPreview(null); setCode(''); setError(''); }}
            className="w-full text-center text-sm text-muted-foreground mt-4 hover:text-foreground transition-colors"
          >
            Try a different code
          </button>
        </>
      )}
    </div>
  );
}
