/**
 * Exponential-backoff retry for RPC rate-limit errors.
 *
 * Why this lives in one place:
 * - Wave 2 bug #142 (and the duplicated logic in useCUSDCBalance,
 *   useCUSDCEscrow, useCUSDCTransfer) all worked around testnet RPC
 *   rate limits with hand-rolled retry loops.
 * - Anti-regression rule: any RPC read/write that has hit rate limits
 *   in testing wraps its call in withRateLimitRetry.
 */

const RATE_LIMIT_PATTERNS = [
  "rate limit",
  "rate-limit",
  "ratelimit",
  "429",
  "too many requests",
  "exceeded",
];

/** After an on-chain tx, wait before the next RPC-heavy call (fee estimate / submit). */
export const POST_RECEIPT_RPC_COOLDOWN_MS = 2_500;

/** Extra cooldown when approve + shield run back-to-back (new users). */
export const POST_APPROVE_SHIELD_COOLDOWN_MS = 12_000;

export function isRateLimitError(err: unknown): boolean {
  const msg = (err as { message?: string; shortMessage?: string })?.message
    ?? (err as { shortMessage?: string })?.shortMessage
    ?? String(err);
  const lower = msg.toLowerCase();
  return RATE_LIMIT_PATTERNS.some((p) => lower.includes(p));
}

export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
}

/**
 * Run `fn`, retrying on rate-limit errors with exponential backoff.
 * Non-rate-limit errors throw immediately.
 *
 * Defaults: 3 retries, baseDelay 4s → 4s, 8s, 16s.
 */
export async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  opts: RetryOptions = {}
): Promise<T> {
  const retries = opts.retries ?? 3;
  const baseDelay = opts.baseDelayMs ?? 4000;
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isRateLimitError(err) || attempt === retries) throw err;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Sleep in 1s ticks — use for visible countdown UX during RPC / CoFHE cooldowns. */
export async function sleepWithProgress(
  ms: number,
  onTick?: (remainingSec: number) => void,
): Promise<void> {
  const step = 1_000;
  let remaining = ms;
  while (remaining > 0) {
    onTick?.(Math.ceil(remaining / 1_000));
    const chunk = Math.min(step, remaining);
    await sleep(chunk);
    remaining -= chunk;
  }
}
