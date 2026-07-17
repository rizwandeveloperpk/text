'use client';

interface HistoryFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  dateFilter: string;
  onDateFilterChange: (value: string) => void;
}

export function HistoryFilters({
  search,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
}: HistoryFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <input
        type="text"
        placeholder="Search your history…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-900 sm:max-w-xs"
      />
      <select
        value={dateFilter}
        onChange={(e) => onDateFilterChange(e.target.value)}
        className="focus-ring rounded-xl border border-ink-200 px-4 py-2 text-sm dark:border-ink-700 dark:bg-ink-900"
      >
        <option value="all">All time</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
        <option value="90">Last 90 days</option>
      </select>
    </div>
  );
}
