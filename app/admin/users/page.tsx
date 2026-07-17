import Link from 'next/link';
import { getAdminDb } from '@/lib/firebase/admin';
import { Card } from '@/components/ui/Card';
import { AdminHeader } from '@/components/dashboard/AdminHeader';
import { DeleteUserButton } from '@/components/admin/DeleteUserButton';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  let users: Record<string, any>[] = [];
  let configError: string | null = null;

  try {
    const adminDb = getAdminDb();
    const snapshot = await adminDb.collection('users').orderBy('createdAt', 'desc').limit(50).get();

    // One count query per user — fine at this scale (capped at 50 users),
    // and avoids needing a maintained counter field on the user doc. Uses
    // .get().size rather than .count() — see app/admin/page.tsx for why.
    users = await Promise.all(
      snapshot.docs.map(async (d) => {
        const conversionsSnap = await adminDb.collection('conversions').where('userId', '==', d.id).get();
        return { id: d.id, ...d.data(), conversionCount: conversionsSnap.size };
      })
    );
  } catch (error) {
    configError = error instanceof Error ? error.message : 'Unknown error';
  }

  return (
    <div className="min-h-screen bg-vellum-100 p-8 dark:bg-ink-900">
      <AdminHeader title="Users" />
      {configError ? (
        <Card className="mt-6 border-red-200">
          <p className="text-sm text-red-700">{configError}</p>
        </Card>
      ) : users.length === 0 ? (
        <Card className="mt-8">
          <p className="text-sm text-ink-400">
            No users yet. Registered users appear here after their first login/registration.
          </p>
        </Card>
      ) : (
        <Card className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-ink-500">
              <tr>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Joined</th>
                <th className="py-2 pr-4">Conversions</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="py-3 pr-4">{u.fullName || '—'}</td>
                  <td className="py-3 pr-4">{u.email}</td>
                  <td className="py-3 pr-4">{u.createdAt}</td>
                  <td className="py-3 pr-4">{u.conversionCount}</td>
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-4">
                      <Link href={`/admin/users/${u.id}`} className="text-signal hover:underline">
                        View history
                      </Link>
                      <DeleteUserButton userId={u.id} userName={u.fullName || u.email} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
