'use client';

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';
import { playNotificationSound, type NotificationSound } from '@/lib/utils/sound';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
  leaving?: boolean;
}

interface ToastOptions {
  message: string;
  type?: ToastType;
  /** How long the toast stays before auto-dismissing, in ms. */
  duration?: number;
  /** Set false to show the popup silently (no chime). */
  sound?: boolean;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const ACCENTS: Record<ToastType, string> = {
  success: 'border-l-success text-success',
  error: 'border-l-error text-error',
  info: 'border-l-signal text-signal',
};

const DEFAULT_DURATION = 3200;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    // Play the exit animation before actually removing the toast.
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 250);
  }, []);

  const toast = useCallback(
    ({ message, type = 'info', duration = DEFAULT_DURATION, sound = true }: ToastOptions) => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      if (sound) playNotificationSound(type as NotificationSound);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2 sm:right-6 sm:top-6"
      >
        {toasts.map((t) => {
          const Icon = ICONS[t.type];
          return (
            <div
              key={t.id}
              role="status"
              className={`pointer-events-auto flex items-start gap-3 rounded-xl border-l-4 bg-vellum-50 p-4 shadow-lg ring-1 ring-ink-100 dark:bg-ink-800 dark:ring-ink-700 ${
                ACCENTS[t.type]
              } ${t.leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
            >
              <Icon className="mt-0.5 h-5 w-5 flex-shrink-0" />
              <p className="flex-1 text-sm text-ink-800 dark:text-vellum-100">{t.message}</p>
              <button
                aria-label="Dismiss"
                onClick={() => dismiss(t.id)}
                className="focus-ring rounded-md p-0.5 text-ink-400 hover:text-ink-700 dark:hover:text-vellum-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
