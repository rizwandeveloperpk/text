import type { Metadata } from 'next';
import { Instrument_Serif, Inter, IBM_Plex_Mono } from 'next/font/google';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';
import { Analytics } from "@vercel/analytics/next"
const display = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
});

const body = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Handwritten Text Recognition AI — Convert notes into editable text',
  description:
    'Upload any handwritten image and let AI convert it into accurate, editable text within seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="font-body antialiased">
        <AppProviders>{children}</AppProviders>
        <Analytics/>
      </body>
    </html>
  );
}
