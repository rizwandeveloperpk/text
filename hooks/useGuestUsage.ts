'use client';

import { useCallback, useEffect, useState } from 'react';
import { FREE_CONVERSION_LIMIT, GUEST_USAGE_STORAGE_KEY } from '@/lib/constants';

export function useGuestUsage() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const raw = window.localStorage.getItem(GUEST_USAGE_STORAGE_KEY);
    setCount(raw ? Number(raw) : 0);
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      window.localStorage.setItem(GUEST_USAGE_STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  return {
    count,
    remaining: Math.max(0, FREE_CONVERSION_LIMIT - count),
    limitReached: count >= FREE_CONVERSION_LIMIT,
    increment,
  };
}
