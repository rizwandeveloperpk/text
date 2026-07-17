'use client';

import type { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close dialog"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md animate-fade-up rounded-2xl bg-white p-8 shadow-xl dark:bg-ink-800">
        <h2 className="font-display text-2xl text-ink-800 dark:text-vellum-100">{title}</h2>
        <div className="mt-4 text-ink-600 dark:text-vellum-200">{children}</div>
      </div>
    </div>
  );
}
