'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export function QueryActions({ id, read }: { id: string; read: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState<'read' | 'delete' | null>(null);

  async function toggleRead() {
    setLoading('read');
    try {
      const response = await fetch(`/api/admin/queries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ read: !read }),
      });
      if (!response.ok) throw new Error('Could not update this message.');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not update this message.');
    } finally {
      setLoading(null);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this message? This cannot be undone.');
    if (!confirmed) return;

    setLoading('delete');
    try {
      const response = await fetch(`/api/admin/queries/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed.');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Could not delete this message.');
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button onClick={toggleRead} disabled={!!loading} className="text-signal hover:underline disabled:opacity-50">
        {loading === 'read' ? <Loader2 className="h-4 w-4 animate-spin" /> : read ? 'Mark unread' : 'Mark read'}
      </button>
      <button onClick={handleDelete} disabled={!!loading} className="text-red-600 hover:underline disabled:opacity-50">
        {loading === 'delete' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Delete'}
      </button>
    </div>
  );
}
