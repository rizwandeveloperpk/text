'use client';

import { useState } from 'react';
import { Menu, X, PenLine } from 'lucide-react';
import Link from 'next/link';
import { Sidebar } from './Sidebar';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-vellum-100 dark:bg-ink-900">
      {/* Mobile top bar — hidden on desktop, where the sidebar is always visible */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-100 bg-vellum-100/90 px-4 py-3 backdrop-blur-sm dark:border-ink-700 dark:bg-ink-900/90 md:hidden">
        <Link href="/" className="flex items-center gap-2 font-display text-lg text-ink-800 dark:text-vellum-100">
          <PenLine className="h-5 w-5 text-signal" strokeWidth={1.5} />
          Scriptura
        </Link>
        <button
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
          className="focus-ring rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-vellum-200 dark:hover:bg-ink-800"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      <div className="flex">
        {/* Desktop sidebar — static, always visible */}
        <aside className="hidden border-r border-ink-100 bg-white/60 dark:border-ink-700 dark:bg-ink-800/40 md:block">
          <Sidebar />
        </aside>

        {/* Mobile drawer — slides in over content, closes on backdrop tap or nav click */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
            />
            <div className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-ink-100 bg-vellum-50 shadow-xl dark:border-ink-700 dark:bg-ink-800">
              <div className="flex items-center justify-end px-4 pt-4">
                <button
                  aria-label="Close menu"
                  onClick={() => setMobileOpen(false)}
                  className="focus-ring rounded-lg p-2 text-ink-500 hover:bg-ink-100 dark:text-vellum-300 dark:hover:bg-ink-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <Sidebar onNavigate={() => setMobileOpen(false)} />
            </div>
          </div>
        )}

        <main className="min-h-screen flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
