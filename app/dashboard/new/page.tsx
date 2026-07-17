'use client';

import { UploadDemo } from '@/components/landing/UploadDemo';

export default function NewConversionPage() {
  return (
    <div>
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">New conversion</h1>
      <p className="mt-1 text-ink-500 dark:text-vellum-300">
        Upload a handwritten image — it will be saved to your history automatically.
      </p>
      <div className="mt-8 max-w-2xl">
        <UploadDemo />
      </div>
    </div>
  );
}
