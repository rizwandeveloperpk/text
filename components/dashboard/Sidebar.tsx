'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  PlusCircle,
  History,
  Star,
  UserCircle,
  Settings,
  CreditCard,
  PenLine,
  LogOut,
} from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { signOut } from '@/lib/firebase/client';
import { cn } from '@/lib/utils/format';

const NAV_ITEMS = [
  { href: ROUTES.newConversion, label: 'New Conversion', icon: PlusCircle },
  { href: ROUTES.history, label: 'History', icon: History },
  { href: ROUTES.favorites, label: 'Favorites', icon: Star },
  { href: ROUTES.profile, label: 'Profile', icon: UserCircle },
  { href: ROUTES.settings, label: 'Settings', icon: Settings },
  { href: ROUTES.billing, label: 'Billing', icon: CreditCard },
];

interface SidebarProps {
  /** Called after a nav link is clicked — used to close the mobile drawer. */
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col px-4 py-6">
      <Link
        href="/"
        onClick={onNavigate}
        className="flex items-center gap-2 px-2 font-display text-xl text-ink-800 dark:text-vellum-100"
      >
        <PenLine className="h-5 w-5 text-signal" strokeWidth={1.5} />
        Scriptura
      </Link>
      <nav className="mt-8 flex-1 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-signal/10 text-signal'
                  : 'text-ink-600 hover:bg-ink-50 dark:text-vellum-200 dark:hover:bg-ink-700/50'
              )}
            >
              <Icon className="h-4 w-4" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={() => signOut()}
        className="focus-ring flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-500 hover:bg-ink-50 dark:text-vellum-300 dark:hover:bg-ink-700/50"
      >
        <LogOut className="h-4 w-4" strokeWidth={1.5} />
        Log out
      </button>
    </div>
  );
}
