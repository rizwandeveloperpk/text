'use client';

import { useMemo, useState } from 'react';
import { HistoryFilters } from '@/components/dashboard/HistoryFilters';
import { HistoryTable } from '@/components/dashboard/HistoryTable';
import { useAuth } from '@/hooks/useAuth';
import { useConversions } from '@/hooks/useConversions';

export default function HistoryPage() {
  const { user } = useAuth();
  const { conversions, toggleFavorite, remove } = useConversions(user?.uid);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  const filtered = useMemo(() => {
    return conversions.filter((c) => {
      const matchesSearch = c.extractedText.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;

      if (dateFilter === 'all') return true;
      const days = Number(dateFilter);
      const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
      return new Date(c.createdAt).getTime() >= cutoff;
    });
  }, [conversions, search, dateFilter]);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">History</h1>
      <p className="mt-1 text-ink-500 dark:text-vellum-300">Every conversion you've made, saved automatically.</p>

      <div className="mt-6">
        <HistoryFilters
          search={search}
          onSearchChange={setSearch}
          dateFilter={dateFilter}
          onDateFilterChange={setDateFilter}
        />
      </div>

      <div className="mt-6">
        <HistoryTable conversions={filtered} onToggleFavorite={toggleFavorite} onDelete={remove} />
      </div>
    </div>
  );
}
