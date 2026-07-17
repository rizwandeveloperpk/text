import { Reveal } from '@/components/ui/Reveal';

const STEPS = [
  { step: '01', title: 'Upload', description: 'Drop in a photo of your handwritten page.' },
  { step: '02', title: 'AI reads it', description: 'Gemini Vision transcribes the handwriting in seconds.' },
  { step: '03', title: 'Edit & export', description: 'Fix anything by hand, then copy or download.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white/60 px-6 py-24 dark:bg-ink-800/40">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl text-ink-800 dark:text-vellum-50">How it works</h2>
        </Reveal>
        <div className="mt-12 grid gap-10 md:grid-cols-3">
          {STEPS.map(({ step, title, description }, index) => (
            <Reveal key={step} delay={index * 120}>
              <div>
                <span className="font-mono text-sm text-signal">{step}</span>
                <h3 className="mt-2 font-display text-2xl text-ink-800 dark:text-vellum-100">{title}</h3>
                <p className="mt-2 text-ink-500 dark:text-vellum-300">{description}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
