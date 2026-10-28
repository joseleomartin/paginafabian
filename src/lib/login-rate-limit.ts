/**
 * Límite de intentos fallidos de login por clave (IP). Best-effort en memoria:
 * en serverless aplica por instancia, suficiente para frenar fuerza bruta casual.
 * Lógica pura y sin alias de paths para poder testearla con `node --test`.
 */

export const MAX_FAILED_ATTEMPTS = 5;
export const WINDOW_MS = 10 * 60 * 1000;

type Entry = { failures: number; windowStart: number };

export type RateLimiter = {
  isBlocked: (key: string, now?: number) => boolean;
  registerFailure: (key: string, now?: number) => void;
  reset: (key: string) => void;
  retryAfterSeconds: (key: string, now?: number) => number;
};

export function createRateLimiter(
  maxFailures: number = MAX_FAILED_ATTEMPTS,
  windowMs: number = WINDOW_MS
): RateLimiter {
  const entries = new Map<string, Entry>();

  function activeEntry(key: string, now: number): Entry | undefined {
    const entry = entries.get(key);
    if (!entry) return undefined;
    if (now - entry.windowStart >= windowMs) {
      entries.delete(key);
      return undefined;
    }
    return entry;
  }

  return {
    isBlocked(key, now = Date.now()) {
      const entry = activeEntry(key, now);
      return Boolean(entry && entry.failures >= maxFailures);
    },

    registerFailure(key, now = Date.now()) {
      const entry = activeEntry(key, now);
      if (entry) {
        entry.failures += 1;
        return;
      }
      entries.set(key, { failures: 1, windowStart: now });
    },

    reset(key) {
      entries.delete(key);
    },

    retryAfterSeconds(key, now = Date.now()) {
      const entry = activeEntry(key, now);
      if (!entry) return 0;
      return Math.max(0, Math.ceil((entry.windowStart + windowMs - now) / 1000));
    },
  };
}
