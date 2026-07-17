'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRequireAuth } from '@/hooks/useRequireAuth';

export function ProfileContent() {
  const { user, ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-vellum-100 dark:bg-ink-900">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return (
    <DashboardShell>
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">Profile</h1>
      <Card className="mt-8 max-w-lg">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-signal/10 font-display text-2xl text-signal">
            {user?.displayName?.[0] ?? user?.email?.[0] ?? '?'}
          </div>
          <div>
            <p className="font-medium text-ink-800 dark:text-vellum-100">{user?.displayName ?? 'Your name'}</p>
            <p className="text-sm text-ink-500 dark:text-vellum-300">{user?.email}</p>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="mt-6">Edit profile</Button>
      </Card>
    </DashboardShell>
  );
}
