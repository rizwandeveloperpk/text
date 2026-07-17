import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { ScanText, ListTree, ShieldCheck, Zap } from 'lucide-react';

const FEATURES = [
  {
    icon: ScanText,
    title: 'Accurate handwriting OCR',
    description: 'Tuned specifically for handwritten English, not just printed text.',
  },
  {
    icon: ListTree,
    title: 'Structure preserved',
    description: 'Paragraphs, bullet points, numbered lists, and tables come out intact.',
  },
  {
    icon: ShieldCheck,
    title: 'No hallucinated text',
    description: 'Unreadable words are flagged, never invented.',
  },
  {
    icon: Zap,
    title: 'Seconds, not minutes',
    description: 'Upload, and get editable text back almost instantly.',
  },
];

export function Features() {
  return (
    <section id="features" className="px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <h2 className="font-display text-4xl text-ink-800 dark:text-vellum-50">Built for real handwriting</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, description }, index) => (
            <Reveal key={title} delay={index * 90}>
              <Card>
                <Icon className="h-6 w-6 text-signal" strokeWidth={1.5} />
                <h3 className="mt-4 font-medium text-ink-800 dark:text-vellum-100">{title}</h3>
                <p className="mt-2 text-sm text-ink-500 dark:text-vellum-300">{description}</p>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
