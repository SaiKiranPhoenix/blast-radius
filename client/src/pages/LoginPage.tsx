import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/authStore';
import { ApiError } from '../lib/api';
import { Spinner } from '../components/common/Spinner';
import { PlayIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

export function LoginPage(): JSX.Element {
  const { state, loginDemo, loginByEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  // If already logged in, redirect to /start
  if (state === 'authenticated' || state === 'demo') {
    return <Navigate to="/start" replace />;
  }

  const handleDemoLogin = async () => {
    setIsDemoSubmitting(true);
    setError(null);
    try {
      await loginDemo();
      navigate('/start');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to start demo.');
      setIsDemoSubmitting(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await loginByEmail(email);
      navigate('/start');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-hud-bg p-4">
      {/* Background aesthetic */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-hud-bg to-hud-bg" />
        <div className="absolute inset-0 bg-hud-grid bg-[length:32px_32px] opacity-20" />
      </div>

      <div className="z-10 w-full max-w-sm space-y-8">
        <div className="text-center">
          <ShieldExclamationIcon className="mx-auto h-12 w-12 text-hud-cyan opacity-80" />
          <h2 className="mt-6 text-2xl font-bold tracking-widest text-slate-100 uppercase">
            BlastRadius
          </h2>
          <p className="mt-2 text-sm text-slate-400">Incident simulation & response</p>
        </div>

        <div className="rounded-xl border border-hud-border bg-hud-panel/50 p-6 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-6 rounded bg-red-500/10 p-3 text-sm text-red-400 border border-red-500/20">
              {error}
            </div>
          )}

          <button
            onClick={handleDemoLogin}
            disabled={isDemoSubmitting || isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded bg-hud-cyan/10 px-4 py-3 text-sm font-medium text-hud-cyan transition-all hover:bg-hud-cyan hover:text-slate-900 disabled:opacity-50"
          >
            {isDemoSubmitting ? <Spinner /> : <PlayIcon className="h-4 w-4" />}
            Continue with demo workspace
          </button>

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-hud-border" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Or sign in
            </span>
            <div className="h-px flex-1 bg-hud-border" />
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter demo email..."
                className="w-full rounded border border-hud-border bg-slate-900/50 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-600 focus:border-hud-cyan focus:outline-none focus:ring-1 focus:ring-hud-cyan"
              />
            </div>
            <button
              type="submit"
              disabled={!email || isSubmitting || isDemoSubmitting}
              className="w-full rounded bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              {isSubmitting ? <Spinner /> : 'Sign in to workspace'}
            </button>
          </form>

          <div className="mt-6 border-t border-hud-border pt-4">
            <p className="text-center text-[10px] text-slate-500">
              Try <span className="font-mono text-slate-400">sam@demo.blastradius.app</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
