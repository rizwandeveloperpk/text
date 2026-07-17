import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getAdminDb } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { AdminHeader } from '@/components/dashboard/AdminHeader';

export const dynamic = 'force-dynamic';

interface Conversion {
  id: string;
  extractedText: string;
  words: number;
  characters: number;
  favorite: boolean;
  createdAt: string;
}

export default async function AdminUserHistoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let userLabel = id;
  let conversions: Conversion[] = [];
  let configError: string | null = null;

  try {
    const adminDb = getAdminDb();

    const userSnap = await adminDb.collection('users').doc(id).get();
    if (userSnap.exists) {
      const data = userSnap.data();
      userLabel = data?.fullName || data?.email || id;
    }

    const snapshot = await adminDb
      .collection('conversions')
      .where('userId', '==', id)
      .orderBy('createdAt', 'desc')
      .get();

    conversions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Conversion);
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-vellum-100 p-8 dark:bg-ink-900">
      <Link
        href="/admin/users"
        className="mb-4 inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-800 dark:text-vellum-300 dark:hover:text-vellum-100"
      >
        <ArrowLeft className="h-4 w-4" /> Back to users
      </Link>
      <AdminHeader title={`History — ${userLabel}`} />

      {configError ? (
        <Card className="mt-6 border-red-200">
          <p className="text-sm text-red-700">{configError}</p>
        </Card>
      ) : conversions.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-ink-400">This user hasn't converted anything yet.</p>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {conversions.map((c) => (
            <Card key={c.id}>
              <div className="flex items-start justify-between gap-4">
                <p className="whitespace-pre-wrap font-mono text-sm text-ink-700 dark:text-vellum-100">
                  {c.extractedText || <span className="text-ink-400">(empty)</span>}
                </p>
                {c.favorite && (
                  <span className="whitespace-nowrap rounded-full bg-signal/10 px-2 py-0.5 text-xs text-signal">
                    ★ Favorite
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-ink-100 pt-3 text-xs text-ink-400 dark:border-ink-700">
                <span>{c.words} words</span>
                <span>{c.characters} characters</span>
                <span>{new Date(c.createdAt).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
