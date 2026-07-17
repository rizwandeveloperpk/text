'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/Button';
import { loginWithEmail, loginWithGoogle } from '@/lib/firebase/client';
import { ROUTES } from '@/lib/constants';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      router.push(ROUTES.dashboard);
    } catch {
      setError('Incorrect email or password.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      await loginWithGoogle();
      router.push(ROUTES.dashboard);
    } catch {
      setError('Google sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthCard title="Welcome back" subtitle="Log in to continue converting your notes.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          required
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
        <input
          type="password"
          required
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex justify-end">
          <Link href={ROUTES.forgotPassword} className="text-sm text-signal hover:underline">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" /> or <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
      </div>
      <GoogleButton onClick={handleGoogle} loading={loading} />
      <p className="mt-6 text-center text-sm text-ink-500 dark:text-vellum-300">
        Don't have an account?{' '}
        <Link href={ROUTES.register} className="text-signal hover:underline">Sign up</Link>
      </p>
    </AuthCard>
  );
}
