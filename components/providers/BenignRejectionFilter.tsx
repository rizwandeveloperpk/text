'use client';

import { useEffect } from 'react';

/**
 * Firestore's real-time listeners (onSnapshot, used by useConversions) open
 * a long-lived streaming connection under the hood. In dev, React's Strict
 * Mode intentionally mounts effects twice (mount → cleanup → mount) to
 * surface missing cleanup bugs — for most hooks that's harmless, but for
 * Firestore's listener it means: subscribe, immediately unsubscribe,
 * subscribe again, all within one tick. That rapid teardown can abort the
 * first connection's in-flight request before it fully opens, and the
 * Firebase JS SDK doesn't always attach a .catch() to that internal
 * promise — so it surfaces as an "unhandled rejection" even though the
 * second (real) connection is unaffected and data loads normally.
 *
 * This is a documented upstream quirk (see firebase/firebase-js-sdk issues
 * on GitHub for "AbortError: signal is aborted without reason" +
 * onSnapshot), not a bug in this app's code. Rather than leave it as
 * recurring, confusing console noise, this suppresses *only* that specific
 * signature — any other unhandled rejection still surfaces normally, so a
 * real bug elsewhere won't get hidden by this.
 */
function isBenignFirebaseAbort(reason: unknown): boolean {
  if (!(reason instanceof Error)) return false;
  const message = reason.message || '';
  const isAbort = reason.name === 'AbortError' || /aborted/i.test(message);
  const isFirebaseFlavored = /signal is aborted without reason/i.test(message) || /the user aborted a request/i.test(message);
  return isAbort && isFirebaseFlavored;
}

export function BenignRejectionFilter() {
  useEffect(() => {
    function handler(event: PromiseRejectionEvent) {
      if (isBenignFirebaseAbort(event.reason)) {
        event.preventDefault();
      }
    }
    window.addEventListener('unhandledrejection', handler);
    return () => window.removeEventListener('unhandledrejection', handler);
  }, []);

  return null;
}
