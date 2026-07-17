import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { UploadDemo } from './UploadDemo';

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-block rounded-full border border-ink-200 px-3 py-1 font-mono text-xs uppercase tracking-wider text-ink-500 dark:border-ink-700 dark:text-vellum-300">
            Handwriting → text, in seconds
          </span>
          <h1 className="mt-6 font-display text-5xl leading-[1.05] text-ink-800 dark:text-vellum-50 md:text-6xl">
            Convert handwritten notes into editable text instantly
          </h1>
          <p className="mt-6 max-w-lg text-lg text-ink-600 dark:text-vellum-200">
            Upload any handwritten image and let AI convert it into accurate editable text within seconds.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#upload-demo">
              <Button variant="primary" size="lg">Try free</Button>
            </a>
            <Link href={ROUTES.register}>
              <Button variant="ghost" size="lg">Sign up</Button>
            </Link>
          </div>
          <p className="mt-4 text-sm text-ink-400 dark:text-vellum-400">
            2 free conversions, no card required.
          </p>
        </div>

        <div aria-hidden className="hidden md:block">
          <svg viewBox="0 0 420 260" className="w-full text-ink-700 dark:text-vellum-200">
            <text x="10" y="150" fontFamily="var(--font-display)" fontSize="42" fill="currentColor" opacity="0.9">
              Meeting notes
            </text>
            <path
              d="M12 170 C 60 150, 90 190, 140 165 S 230 150, 260 175 S 340 195, 380 165"
              fill="none"
              stroke="#2563EB"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray="1000"
              strokeDashoffset="1000"
              className="animate-pen-write"
            />
            <g className="animate-fade-up" style={{ animationDelay: '2.2s', opacity: 0 }}>
              <rect x="10" y="205" width="400" height="1" fill="currentColor" opacity="0.15" />
              <text x="10" y="235" fontFamily="var(--font-mono)" fontSize="16" fill="#2563EB">
                Meeting notes — converted ✓
              </text>
            </g>
          </svg>
        </div>
      </div>

      <div id="upload-demo" className="mx-auto mt-16 max-w-3xl">
        <UploadDemo />
      </div>
    </section>
  );
}
