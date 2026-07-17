'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PenLine } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'Invalid username or password.');
      }
      router.replace('/admin');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-vellum-100 px-6 dark:bg-ink-900">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 font-display text-2xl text-ink-800 dark:text-vellum-100">
          <PenLine className="h-5 w-5 text-signal" strokeWidth={1.5} />
          Scriptura Admin
        </div>
        <div className="mt-8 rounded-2xl border border-ink-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800/60">
          <h1 className="font-display text-2xl text-ink-800 dark:text-vellum-100">Admin sign in</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-vellum-300">Restricted area — authorized staff only.</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="text"
              required
              placeholder="Username"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
            />
            <input
              type="password"
              required
              placeholder="Password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
