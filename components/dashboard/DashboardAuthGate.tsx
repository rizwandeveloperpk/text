'use client';

import { DashboardShell } from '@/components/dashboard/DashboardShell';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Split out of app/dashboard/layout.tsx so that file can be a plain Server
 * Component exporting `dynamic = 'force-dynamic'` — Next.js doesn't allow
 * that route-segment config in a file marked 'use client'. All the actual
 * client-side auth-gate logic lives here instead.
 */
export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const { ready } = useRequireAuth();

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-vellum-100 dark:bg-ink-900">
        <Skeleton className="h-8 w-40" />
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
