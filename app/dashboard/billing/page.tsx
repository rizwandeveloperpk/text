import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function BillingPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">Billing</h1>
      <Card className="mt-8">
        <p className="text-sm uppercase tracking-wide text-ink-400">Current plan</p>
        <p className="mt-1 font-display text-2xl text-ink-800 dark:text-vellum-100">Free</p>
        <p className="mt-2 text-sm text-ink-500 dark:text-vellum-300">
          Upgrade to Pro for unlimited conversions, unlimited history, priority OCR, and PDF export.
        </p>
        <Button className="mt-6">Upgrade to Pro</Button>
        <p className="mt-3 text-xs text-ink-400">
          Stripe billing is wired up server-side; add your keys to go live.
        </p>
      </Card>
    </div>
  );
}
