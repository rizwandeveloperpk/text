import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Text / border / dark-surface scale — Text #0F172A, Secondary Text
        // #64748B, Border #E2E8F0, Background #F8FAFC live at 900/500/200/50.
        ink: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        // Light-surface scale — Surface/Cards #FFFFFF, Background #F8FAFC,
        // with muted steps for dark-mode foreground text.
        vellum: {
          50: '#FFFFFF',
          100: '#F8FAFC',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
        },
        // Primary — Royal Blue, with Dark Blue as the hover/active shade.
        signal: {
          DEFAULT: '#2563EB',
          light: '#1D4ED8',
          hover: '#1D4ED8',
        },
        success: {
          DEFAULT: '#10B981',
        },
        warning: {
          DEFAULT: '#F59E0B',
        },
        error: {
          DEFAULT: '#EF4444',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      keyframes: {
        'pen-write': {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'toast-in': {
          '0%': { opacity: '0', transform: 'translateX(100%)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'toast-out': {
          '0%': { opacity: '1', transform: 'translateX(0)' },
          '100%': { opacity: '0', transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pen-write': 'pen-write 2.8s ease-in-out forwards',
        'fade-up': 'fade-up 0.6s ease-out forwards',
        'scan-line': 'scan 1.8s ease-in-out infinite',
        'toast-in': 'toast-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'toast-out': 'toast-out 0.25s ease-in forwards',
      },
    },
  },
  plugins: [],
};

export default config;
