'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="font-display text-3xl text-ink-800 dark:text-vellum-50">Settings</h1>

      <Card>
        <h2 className="font-medium text-ink-800 dark:text-vellum-100">Account</h2>
        <div className="mt-4 space-y-4">
          <input
            type="text"
            placeholder="Full name"
            className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
          <input
            type="password"
            placeholder="New password"
            className="focus-ring w-full rounded-xl border border-ink-200 px-4 py-3 text-sm dark:border-ink-700 dark:bg-ink-900"
          />
          <Button size="sm">Save changes</Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-medium text-ink-800 dark:text-vellum-100">Data</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" size="sm">Download all history</Button>
          <Button variant="ghost" size="sm">Clear history</Button>
        </div>
      </Card>

      <Card className="border-red-200">
        <h2 className="font-medium text-red-700">Delete account</h2>
        <p className="mt-1 text-sm text-ink-500 dark:text-vellum-300">
          This permanently removes your account and all saved conversions.
        </p>
        {confirmDelete ? (
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" size="sm" className="bg-red-600 hover:bg-red-700">
              Confirm delete
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="mt-4 text-red-600" onClick={() => setConfirmDelete(true)}>
            Delete my account
          </Button>
        )}
      </Card>
    </div>
  );
}
