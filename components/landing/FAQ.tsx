import { FAQ_ITEMS } from '@/lib/constants';
import { Reveal } from '@/components/ui/Reveal';

export function FAQ() {
  return (
    <section id="faq" className="bg-white/60 px-6 py-24 dark:bg-ink-800/40">
      <Reveal className="mx-auto max-w-3xl">
        <h2 className="font-display text-4xl text-ink-800 dark:text-vellum-50">Frequently asked questions</h2>
        <div className="mt-10 divide-y divide-ink-100 dark:divide-ink-700">
          {FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group py-5">
              <summary className="focus-ring flex cursor-pointer list-none items-center justify-between font-medium text-ink-800 dark:text-vellum-100">
                {item.question}
                <span className="text-signal transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-ink-500 dark:text-vellum-300">{item.answer}</p>
            </details>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
