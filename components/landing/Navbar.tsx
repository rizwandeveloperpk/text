'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants';
import { PenLine, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/firebase/client';
import { useToast } from '@/components/ui/Toast';

const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#faq', label: 'FAQ' },
  { href: '#contact', label: 'Contact' },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      setMobileOpen(false);
      toast({ type: 'success', message: 'Logged out successfully.' });
      router.push(ROUTES.home);
    } catch (err) {
      console.error(err);
      toast({ type: 'error', message: 'Could not log out. Please try again.' });
    }
  }

  return (
    <header
      className={`sticky top-0 z-40 border-b bg-vellum-100/80 backdrop-blur-md transition-shadow dark:bg-ink-900/80 ${
        scrolled ? 'border-ink-100 shadow-sm dark:border-ink-700' : 'border-transparent'
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 font-display text-xl text-ink-800 dark:text-vellum-100">
          <PenLine className="h-5 w-5 text-signal" strokeWidth={1.5} />
          Scriptura
        </Link>

        <div className="hidden items-center gap-8 text-sm text-ink-600 dark:text-vellum-200 md:flex">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-ink-900 dark:hover:text-white">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {loading ? null : user ? (
            <>
              <Link href={ROUTES.dashboard}>
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Button variant="primary" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </>
          ) : (
            <>
              <Link href={ROUTES.login}>
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href={ROUTES.register}>
                <Button variant="primary" size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>

        <button
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMobileOpen((v) => !v)}
          className="focus-ring rounded-lg p-2 text-ink-600 hover:bg-ink-100 dark:text-vellum-200 dark:hover:bg-ink-800 md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-ink-100/60 bg-vellum-100 px-6 py-4 dark:border-ink-700 dark:bg-ink-900 md:hidden">
          <div className="flex flex-col gap-3 text-sm text-ink-600 dark:text-vellum-200">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="py-1 hover:text-ink-900 dark:hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="mt-4 flex gap-3">
            {loading ? null : user ? (
              <>
                <Link href={ROUTES.dashboard} className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full">Dashboard</Button>
                </Link>
                <Button variant="primary" size="sm" className="flex-1 w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" /> Log out
                </Button>
              </>
            ) : (
              <>
                <Link href={ROUTES.login} className="flex-1">
                  <Button variant="ghost" size="sm" className="w-full">Log in</Button>
                </Link>
                <Link href={ROUTES.register} className="flex-1">
                  <Button variant="primary" size="sm" className="w-full">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
