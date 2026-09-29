import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useAdminAuth } from '../../hooks/useAdminAuth';

export default function AdminLogin() {
  const { session, loading, configured, signIn } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/admin/orders';

  if (!loading && session) {
    return <Navigate to={from} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const { error: signInError } = await signIn(email, password);

    setSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(from, { replace: true });
  }

  return (
    <div className="flex min-h-screen flex-col bg-cream">
      <div className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm">
          <div className="flex justify-center bg-brand p-6">
            <img
              src="/images/logo.png"
              alt="Boots Hyper Market"
              width={936}
              height={400}
              className="h-10 w-auto"
            />
          </div>

          <div className="border border-ink/10 border-t-0 p-7">
            <h1 className="text-lg font-semibold tracking-tight">Admin sign in</h1>
            <p className="mt-1.5 text-sm text-ink/55">
              Staff access only. Customers do not need an account.
            </p>

            {!configured && (
              <p className="mt-5 flex items-start gap-2.5 border border-brand/30 bg-brand/5 p-3 text-xs text-brand">
                <AlertCircle size={15} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
              </p>
            )}

            <form onSubmit={handleSubmit} noValidate className="mt-6">
              <div>
                <label htmlFor="admin-email" className="field-label">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="field-input"
                  disabled={submitting || !configured}
                />
              </div>

              <div className="mt-5">
                <label htmlFor="admin-password" className="field-label">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="field-input"
                  disabled={submitting || !configured}
                />
              </div>

              {error && (
                <p role="alert" className="mt-4 flex items-start gap-2 text-xs text-brand">
                  <AlertCircle size={14} strokeWidth={1.8} className="mt-0.5 shrink-0" />
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting || !configured}
                className="btn-primary mt-7 w-full"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} strokeWidth={2} className="animate-spin" />
                    Signing in
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          <Link
            to="/"
            className="mt-6 block text-center text-xs uppercase tracking-[0.14em] text-ink/50 transition-colors hover:text-ink"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
