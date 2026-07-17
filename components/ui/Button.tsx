import { cn } from '@/lib/utils/format';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'focus-ring inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50',
        variant === 'primary' &&
          'bg-signal text-vellum-50 shadow-sm hover:bg-signal-light hover:shadow-md active:scale-[0.98]',
        variant === 'secondary' &&
          'bg-ink-800 text-vellum-50 hover:bg-ink-700 active:scale-[0.98]',
        variant === 'ghost' &&
          'bg-transparent text-ink-800 hover:bg-ink-50 dark:text-vellum-100 dark:hover:bg-ink-800',
        size === 'sm' && 'px-4 py-2 text-sm',
        size === 'md' && 'px-6 py-3 text-sm',
        size === 'lg' && 'px-8 py-4 text-base',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
