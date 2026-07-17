'use client';

import { HistoryTable } from '@/components/dashboard/HistoryTable';
import { useAuth } from '@/hooks/useAuth';
import { useConversions } from '@/hooks/useConversions';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { conversions, toggleFavorite, remove } = useConversions(user?.uid);
  const favorites = conversions.filter((c) => c.favorite);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">Favorites</h1>
      <p className="mt-1 text-ink-500 dark:text-vellum-300">Conversions you've starred for quick access.</p>
      <div className="mt-6">
        <HistoryTable conversions={favorites} onToggleFavorite={toggleFavorite} onDelete={remove} />
      </div>
    </div>
  );
}
