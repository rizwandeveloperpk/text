/**
 * Google's Gemini API occasionally returns transient errors under load —
 * 503 "currently experiencing high demand", 429 rate limits, or a generic
 * 500 — that go away if you just retry a moment later. This wraps a Gemini
 * call with a few retries and exponential backoff before giving up, instead
 * of surfacing the very first hiccup straight to the user.
 */

const RETRYABLE_PATTERN = /\b(429|500|502|503|504)\b|overloaded|unavailable|high demand|try again later/i;

function isRetryable(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_PATTERN.test(message);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface RetryOptions {
  maxAttempts?: number;
  /** Base delay in ms — actual delay grows as baseDelayMs * 2^attempt, plus jitter. */
  baseDelayMs?: number;
}

export async function withGeminiRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const maxAttempts = options.maxAttempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 700;

  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === maxAttempts - 1;
      if (isLastAttempt || !isRetryable(error)) {
        break;
      }
      const jitter = Math.random() * 250;
      await sleep(baseDelayMs * 2 ** attempt + jitter);
    }
  }

  if (isRetryable(lastError)) {
    throw new Error("Gemini's servers are experiencing high demand right now. Please try again in a moment.");
  }
  throw lastError;
}
