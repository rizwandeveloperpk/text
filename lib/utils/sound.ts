'use client';

/**
 * Lightweight notification "ringtone" generated with the Web Audio API —
 * no audio file assets to fetch or bundle, and it respects browsers that
 * block audio until the user has interacted with the page (failures are
 * swallowed silently since a missed chime should never break the UI).
 */

let sharedContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedContext) sharedContext = new AudioCtx();
  return sharedContext;
}

function playTone(ctx: AudioContext, frequency: number, startTime: number, duration: number, peakGain: number) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;

  // Quick attack, gentle release so each note sounds like a soft chime
  // rather than an abrupt beep.
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.02);
}

export type NotificationSound = 'success' | 'error' | 'info';

export function playNotificationSound(kind: NotificationSound = 'info') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume().catch(() => {});

    const now = ctx.currentTime;

    if (kind === 'success') {
      // Bright two-note "ding-ding" chime.
      playTone(ctx, 987.77, now, 0.16, 0.12); // B5
      playTone(ctx, 1318.51, now + 0.1, 0.22, 0.12); // E6
    } else if (kind === 'error') {
      // Lower, slightly dissonant double-tone for errors.
      playTone(ctx, 349.23, now, 0.18, 0.13); // F4
      playTone(ctx, 311.13, now + 0.14, 0.22, 0.13); // Eb4
    } else {
      playTone(ctx, 784, now, 0.14, 0.1); // G5
    }
  } catch {
    // Audio is a nice-to-have — never let it break the app.
  }
}
