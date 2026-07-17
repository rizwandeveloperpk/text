'use client';

import { Button } from '@/components/ui/Button';

export function GoogleButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <Button
      type="button"
      variant="secondary"
      className="w-full"
      onClick={onClick}
      disabled={loading}
    >
      Continue with Google
    </Button>
  );
}
