import { formatDate } from '@/lib/utils/format';
import type { Conversion } from '@/types';

export function RecentActivity({ conversions }: { conversions: Conversion[] }) {
  if (conversions.length === 0) {
    return (
      <p className="text-sm text-ink-400 dark:text-vellum-400">
        Nothing here yet — your recent conversions will show up once you start uploading.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-ink-100 dark:divide-ink-700">
      {conversions.slice(0, 5).map((c) => (
        <li key={c.id} className="flex items-center justify-between py-3 text-sm">
          <span className="truncate pr-4 text-ink-700 dark:text-vellum-100">
            {c.extractedText.slice(0, 60) || 'Untitled conversion'}
            {c.extractedText.length > 60 ? '…' : ''}
          </span>
          <span className="whitespace-nowrap text-ink-400">{formatDate(c.createdAt)}</span>
        </li>
      ))}
    </ul>
  );
}
