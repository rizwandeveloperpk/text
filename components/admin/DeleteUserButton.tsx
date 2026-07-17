'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function DeleteUserButton({ userId, userName }: { userId: string; userName?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${userName || 'this user'}? This permanently removes their account, profile, and all saved conversions.`
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error ?? 'Delete failed.');
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete this user.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <button onClick={handleDelete} disabled={loading} className="text-red-600 hover:underline disabled:opacity-50">
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
    </button>
  );
}
