import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';
import { createAuthService } from '@bigdogs/shared';

const authService = createAuthService(supabase);

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
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const strength = getStrength(password);
  const canSubmit = displayName.trim() && email.trim() && password.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="text-center mb-10">
          <img src="/avatars/bigdog-crimson.svg" alt="" className="w-24 h-24 mx-auto mb-4" />
          <h1 className="text-3xl font-black tracking-[0.15em] uppercase">Big Dogs</h1>
          <p className="text-muted-foreground mt-1">Prove it on the scale.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
