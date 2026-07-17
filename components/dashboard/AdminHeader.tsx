'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function AdminHeader({ title }: { title: string }) {
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.replace('/admin/login');
    router.refresh();
  }

  return (
    <div className="flex items-center justify-between">
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">{title}</h1>
      <button
        onClick={handleLogout}
        className="focus-ring flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink-500 hover:bg-ink-100 dark:text-vellum-300 dark:hover:bg-ink-800"
      >
        <LogOut className="h-4 w-4" /> Log out
      </button>
    </div>
  );
}
