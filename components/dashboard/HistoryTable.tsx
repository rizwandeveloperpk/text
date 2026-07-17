'use client';

import { Copy, Download, Trash2, Star } from 'lucide-react';
import { formatDate, downloadTextFile } from '@/lib/utils/format';
import type { Conversion } from '@/types';

interface HistoryTableProps {
  conversions: Conversion[];
  onToggleFavorite: (id: string, favorite: boolean) => void;
  onDelete: (id: string) => void;
}

export function HistoryTable({ conversions, onToggleFavorite, onDelete }: HistoryTableProps) {
  if (conversions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-400 dark:text-vellum-400">
        No conversions match your search yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-ink-100 dark:border-ink-700">
      <table className="w-full text-left text-sm">
        <thead className="bg-ink-50 text-ink-500 dark:bg-ink-800 dark:text-vellum-300">
          <tr>
            <th className="px-4 py-3 font-medium">Text</th>
            <th className="px-4 py-3 font-medium">Words</th>
            <th className="px-4 py-3 font-medium">Characters</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink-100 dark:divide-ink-700">
          {conversions.map((c) => (
            <tr key={c.id}>
              <td className="max-w-xs truncate px-4 py-3 text-ink-700 dark:text-vellum-100">
                {c.extractedText}
              </td>
              <td className="px-4 py-3 text-ink-500">{c.words}</td>
              <td className="px-4 py-3 text-ink-500">{c.characters}</td>
              <td className="px-4 py-3 text-ink-500">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    aria-label="Copy text"
                    onClick={() => navigator.clipboard.writeText(c.extractedText)}
                    className="text-ink-400 hover:text-ink-700 dark:hover:text-vellum-100"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Download text"
                    onClick={() => downloadTextFile(`conversion-${c.id}.txt`, c.extractedText)}
                    className="text-ink-400 hover:text-ink-700 dark:hover:text-vellum-100"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  <button
                    aria-label="Toggle favorite"
                    onClick={() => onToggleFavorite(c.id, !c.favorite)}
                    className={c.favorite ? 'text-signal' : 'text-ink-400 hover:text-signal'}
                  >
                    <Star className="h-4 w-4" fill={c.favorite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    aria-label="Delete conversion"
                    onClick={() => onDelete(c.id)}
                    className="text-ink-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
