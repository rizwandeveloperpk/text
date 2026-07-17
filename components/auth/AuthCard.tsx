import type { ReactNode } from 'react';
import Link from 'next/link';
import { PenLine } from 'lucide-react';

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-vellum-100 px-6 dark:bg-ink-900">
      <div className="w-full max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 font-display text-2xl text-ink-800 dark:text-vellum-100">
          <PenLine className="h-5 w-5 text-signal" strokeWidth={1.5} />
          Scriptura
        </Link>
        <div className="mt-8 rounded-2xl border border-ink-100/60 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-ink-700 dark:bg-ink-800/60">
          <h1 className="font-display text-2xl text-ink-800 dark:text-vellum-100">{title}</h1>
          <p className="mt-1 text-sm text-ink-500 dark:text-vellum-300">{subtitle}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
