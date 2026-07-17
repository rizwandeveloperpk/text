'use client';

import { ToastProvider } from '@/components/ui/Toast';
import { BenignRejectionFilter } from '@/components/providers/BenignRejectionFilter';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <BenignRejectionFilter />
      {children}
    </ToastProvider>
  );
}
