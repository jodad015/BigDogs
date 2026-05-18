import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { createAuthService } from '@bigdogs/shared';

const authService = createAuthService(supabase);
const enableEmailAuth = import.meta.env.VITE_ENABLE_EMAIL_AUTH === 'true';

function getStrength(pw: string): { level: number; label: string; color: string } {
  if (!pw) return { level: 0, label: '', color: 'bg-border' };
  if (pw.length < 6) return { level: 1, label: 'Weak', color: 'bg-destructive' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return { level: 4, label: 'Strong', color: 'bg-success' };
  if (score >= 2) return { level: 3, label: 'Fair', color: 'bg-warning' };
  return { level: 2, label: 'Weak', color: 'bg-destructive' };
}

export default function SignupPage() {
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getStrength(password);
  const canSubmit = displayName.trim() && email.trim() && password.length >= 6;

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error: err } = await authService.signUp({
      email,
      password,
      displayName: displayName.trim(),
    });

    if (err) {
      setError(err.message);
      setIsLoading(false);
    } else {
      navigate('/');
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    const { error: err } = await signInWithGoogle();
    if (err) {
      setError(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <img src="/avatars/bigdog-crimson.svg" alt="" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-black tracking-[0.15em] uppercase">Big Dogs</h1>
          <p className="text-muted-foreground mt-1">Prove it on the scale.</p>
        </div>

        {!enableEmailAuth && (
          <>
            <button
              onClick={handleGoogleSignUp}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card px-4 py-3.5 text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>
          </>
        )}

        {enableEmailAuth && (
          <form onSubmit={handleEmailSignUp} className="space-y-4">
            <input
              type="text"
              placeholder="What should we call you?"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ring"
            />

            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-border bg-input px-4 py-3 text-sm placeholder:text-placeholder focus:outline-none focus:ring-2 focus:ring-ring"
              />
              {/* Strength bar */}
              <div className="flex gap-1 mt-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i <= strength.level ? strength.color : 'bg-border'
                    }`}
                  />
                ))}
              </div>
              {strength.label && (
                <p className={`text-xs mt-1 ${
                  strength.level >= 3 ? 'text-success' : strength.level >= 2 ? 'text-warning' : 'text-destructive'
                }`}>
                  {strength.label}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isLoading}
              className="w-full rounded-xl bg-primary py-3.5 text-primary-foreground font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-center text-sm text-destructive">{error}</p>}

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
