'use client';

import { FileText, Image as ImageIcon, Gauge } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Card } from '@/components/ui/Card';
import { Reveal } from '@/components/ui/Reveal';
import { useAuth } from '@/hooks/useAuth';
import { useConversions } from '@/hooks/useConversions';

export default function DashboardPage() {
  const { user } = useAuth();
  const { conversions, loading } = useConversions(user?.uid);

  const totalConversions = conversions.length;
  const totalCharacters = conversions.reduce((sum, c) => sum + c.characters, 0);

  return (
    <div>
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">
        Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}
      </h1>
      <p className="mt-1 text-ink-500 dark:text-vellum-300">Here's what's been happening.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Reveal delay={0}>
          <StatCard label="Total conversions" value={totalConversions} icon={FileText} />
        </Reveal>
        <Reveal delay={80}>
          <StatCard label="Images uploaded" value={totalConversions} icon={ImageIcon} />
        </Reveal>
        <Reveal delay={160}>
          <StatCard label="Characters extracted" value={totalCharacters} icon={Gauge} />
        </Reveal>
      </div>

      <Reveal delay={240}>
        <Card className="mt-8">
          <h2 className="font-display text-xl text-ink-800 dark:text-vellum-100">Recent activity</h2>
          <div className="mt-4">
            {loading ? <p className="text-sm text-ink-400">Loading…</p> : <RecentActivity conversions={conversions} />}
          </div>
        </Card>
      </Reveal>
    </div>
  );
}
