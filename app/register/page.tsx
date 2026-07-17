'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { GoogleButton } from '@/components/auth/GoogleButton';
import { Button } from '@/components/ui/Button';
import { registerWithEmail, loginWithGoogle } from '@/lib/firebase/client';
import { isValidEmail, isStrongPassword } from '@/lib/utils/validators';
import { ROUTES } from '@/lib/constants';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!isStrongPassword(password)) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(fullName, email, password);
      router.push(ROUTES.dashboard);
    } catch {
      setError('Could not create your account. That email may already be in use.');
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
    <AuthCard title="Create your account" subtitle="Save your history and unlock more conversions.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          required
          placeholder="Full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
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
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" /> or <span className="h-px flex-1 bg-ink-100 dark:bg-ink-700" />
      </div>
      <GoogleButton onClick={handleGoogle} loading={loading} />
      <p className="mt-6 text-center text-sm text-ink-500 dark:text-vellum-300">
        Already have an account?{' '}
        <Link href={ROUTES.login} className="text-signal hover:underline">Log in</Link>
      </p>
    </AuthCard>
  );
}
