/** Simple in-memory token bucket per key */

export class RateLimiter {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly maxPerWindow: number,
    private readonly windowMs: number,
  ) {}

  tryConsume(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);
    if (!bucket || now >= bucket.resetAt) {
      bucket = { count: 0, resetAt: now + this.windowMs };
      this.buckets.set(key, bucket);
    }
    if (bucket.count >= this.maxPerWindow) return false;
    bucket.count += 1;
    return true;
  }
}

export const readLimiter = new RateLimiter(60, 60_000);
export const writePrepLimiter = new RateLimiter(10, 60_000);
