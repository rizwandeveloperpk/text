import { Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { PRICING_PLANS } from '@/lib/constants';
import { cn } from '@/lib/utils/format';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants';

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24">
      <Reveal className="mx-auto max-w-4xl text-center">
        <h2 className="font-display text-4xl text-ink-800 dark:text-vellum-50">Simple pricing</h2>
        <p className="mt-3 text-ink-500 dark:text-vellum-300">Start free. Upgrade when you need more.</p>
      </Reveal>
      <div className="mx-auto mt-12 grid max-w-3xl gap-6 md:grid-cols-2">
        {PRICING_PLANS.map((plan, index) => (
          <Reveal key={plan.name} delay={index * 120}>
            <Card className={cn(plan.highlighted && 'border-signal/50 ring-1 ring-signal/30')}>
              <h3 className="font-display text-2xl text-ink-800 dark:text-vellum-100">{plan.name}</h3>
              <p className="mt-4">
                <span className="font-display text-4xl text-ink-800 dark:text-vellum-50">{plan.price}</span>
                <span className="text-ink-400"> {plan.period}</span>
              </p>
              <p className="mt-2 text-sm text-ink-500 dark:text-vellum-300">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-ink-600 dark:text-vellum-200">
                    <Check className="h-4 w-4 text-signal" /> {feature}
                  </li>
                ))}
              </ul>
              <Link href={ROUTES.register} className="mt-8 block">
                <Button variant={plan.highlighted ? 'primary' : 'secondary'} className="w-full">
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
