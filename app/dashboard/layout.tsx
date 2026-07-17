import { DashboardAuthGate } from '@/components/dashboard/DashboardAuthGate';

// This whole tree is authenticated, per-user content (billing, history,
// profile-linked stats) — it must never be statically prerendered/exported
// at build time. Without this, Next.js's static analysis can decide a page
// like /dashboard/billing (a plain Server Component with no dynamic APIs)
// is "static-eligible" and tries to fully prerender it during `next build`,
// which runs this whole layout's module graph on the server — including
// the Firebase client SDK's eager `getAuth()` call — with whatever env vars
// happen to be available at BUILD time. If those are missing/misconfigured
// even momentarily, that crashes the entire Vercel build with
// "auth/invalid-api-key", not just a runtime error on that one page.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardAuthGate>{children}</DashboardAuthGate>;
}
