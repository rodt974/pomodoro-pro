/**
 * Per-user daily counter, in process memory.
 *
 * Why in-memory: keeps the dependency surface small. For a multi-instance deploy
 * swap this for Upstash/Redis or a Postgres counter table, the surface is one
 * function (`hitRateLimit`), so the call sites don't change.
 *
 * Caveats:
 *   - Resets on server restart and on every Vercel cold start.
 *   - Does NOT work across multiple instances. Single-region only.
 */

interface Bucket {
  count: number;
  // ms epoch when this bucket resets (next UTC midnight).
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

function nextResetMs(now: number): number {
  const d = new Date(now);
  d.setUTCHours(24, 0, 0, 0);
  return d.getTime();
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
}

export function hitRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    const fresh: Bucket = { count: 1, resetAt: nextResetMs(now) };
    buckets.set(key, fresh);
    return { allowed: true, remaining: limit - 1, limit, resetAt: fresh.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, limit, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    limit,
    resetAt: existing.resetAt,
  };
}
