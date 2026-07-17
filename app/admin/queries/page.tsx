import { getAdminDb } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { AdminHeader } from '@/components/dashboard/AdminHeader';
import { QueryActions } from '@/components/admin/QueryActions';
import { cn } from '@/lib/utils/format';

export const dynamic = 'force-dynamic';

export default async function AdminQueriesPage() {
  let queries: Record<string, any>[] = [];
  let configError: string | null = null;

  try {
    const snapshot = await getAdminDb().collection('queries').orderBy('createdAt', 'desc').limit(100).get();
    queries = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-vellum-100 p-8 dark:bg-ink-900">
      <AdminHeader title="Contact queries" />
      <p className="mt-1 text-sm text-ink-500 dark:text-vellum-300">
        Messages submitted through the landing page's contact form.
      </p>

      {configError ? (
        <Card className="mt-6 border-red-200">
          <p className="text-sm text-red-700">{configError}</p>
        </Card>
      ) : queries.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-ink-400">No messages yet.</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-3">
          {queries.map((q, index) => (
            <Reveal key={q.id} delay={Math.min(index, 6) * 60}>
              <Card className={cn('flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between', !q.read && 'border-signal/40')}>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-ink-800 dark:text-vellum-100">{q.email}</p>
                    {!q.read && (
                      <span className="rounded-full bg-signal/10 px-2 py-0.5 text-xs font-medium text-signal">
                        New
                      </span>
                    )}
                  </div>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-ink-600 dark:text-vellum-200">{q.message}</p>
                  <p className="mt-2 text-xs text-ink-400">{q.createdAt}</p>
                </div>
                <QueryActions id={q.id} read={!!q.read} />
              </Card>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
