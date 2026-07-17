import { Card } from '@/components/ui/Card';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className="rounded-xl bg-signal/10 p-3">
        <Icon className="h-5 w-5 text-signal" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-sm text-ink-500 dark:text-vellum-300">{label}</p>
        <p className="font-display text-2xl text-ink-800 dark:text-vellum-50">{value}</p>
      </div>
    </Card>
  );
}
