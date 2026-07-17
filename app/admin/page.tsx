import { getAdminDb } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { AdminHeader } from '@/components/dashboard/AdminHeader';
import { Users, FileText, Activity, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  let totalUsers: number | string = '—';
  let totalConversions: number | string = '—';
  let totalQueries: number | string = '—';
  let unreadQueries = 0;
  let configError: string | null = null;

  try {
    const adminDb = getAdminDb();
    // Using .get().size instead of the newer .count() aggregate query API —
    // .size works on every firebase-admin version, so this can't break due
    // to a version/module-resolution mismatch the way .count() did.
    const [usersSnap, conversionsSnap, queriesSnap] = await Promise.all([
      adminDb.collection('users').get(),
      adminDb.collection('conversions').get(),
      adminDb.collection('queries').get(),
    ]);
    totalUsers = usersSnap.size;
    totalConversions = conversionsSnap.size;
    totalQueries = queriesSnap.size;
    unreadQueries = queriesSnap.docs.filter((d) => !d.data().read).length;
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-vellum-100 p-8 dark:bg-ink-900">
      <AdminHeader title="Admin" />
      {configError && (
        <Card className="mt-6 border-red-200">
          <p className="text-sm text-red-700">{configError}</p>
        </Card>
      )}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Reveal delay={0}>
          <Card className="flex items-center gap-4">
            <Users className="h-6 w-6 text-signal" />
            <div>
              <p className="text-sm text-ink-500">Total users</p>
              <p className="font-display text-2xl text-ink-800 dark:text-vellum-50">{totalUsers}</p>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={80}>
          <Card className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-signal" />
            <div>
              <p className="text-sm text-ink-500">Total conversions</p>
              <p className="font-display text-2xl text-ink-800 dark:text-vellum-50">{totalConversions}</p>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={160}>
          <Card className="flex items-center gap-4">
            <Activity className="h-6 w-6 text-signal" />
            <div>
              <p className="text-sm text-ink-500">Daily OCR usage</p>
              <p className="font-display text-2xl text-ink-800 dark:text-vellum-50">—</p>
            </div>
          </Card>
        </Reveal>
        <Reveal delay={240}>
          <Link href="/admin/queries">
            <Card className="flex items-center gap-4">
              <div className="relative">
                <MessageSquare className="h-6 w-6 text-signal" />
                {unreadQueries > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-medium text-white">
                    {unreadQueries > 9 ? '9+' : unreadQueries}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm text-ink-500">Contact queries</p>
                <p className="font-display text-2xl text-ink-800 dark:text-vellum-50">{totalQueries}</p>
              </div>
            </Card>
          </Link>
        </Reveal>
      </div>
      <div className="mt-8 flex gap-6">
        <Link href="/admin/users" className="text-signal hover:underline">
          View all users →
        </Link>
        <Link href="/admin/queries" className="text-signal hover:underline">
          View contact queries →
        </Link>
      </div>
    </div>
  );
}
