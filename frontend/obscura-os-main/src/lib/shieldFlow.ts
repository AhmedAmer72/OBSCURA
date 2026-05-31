/**
 * Shield (wrap) flow helpers — approve USDC then shield to ocUSDC.
 *
 * New users hit RPC / CoFHE rate limits when approve receipt polling is
 * immediately followed by shield fee-estimate + submit. CoFHE docs: FHE ops
 * are async; Arb Sepolia RPC throttles rapid sequential calls.
 *
 * Pattern (matches credit two-step flows + memory_pay_5):
 * 1. Approve (if needed) → wait for receipt
 * 2. POST_RECEIPT_RPC_COOLDOWN_MS — let receipt polling budget recover
 * 3. POST_APPROVE_SHIELD_COOLDOWN_MS — network cool-down before shield
 * 4. Shield with automatic rate-limit retries (shield-only, no re-approve)
 */

export type ShieldWrapPhase =
  | "idle"
  | "checking"
  | "approving"
  | "cooldown"
  | "shielding"
  | "retry-shield"
  | "done";

export const SHIELD_RATE_LIMIT_RETRIES = 3;
export const SHIELD_RETRY_BASE_MS = 8_000;

export function shieldPhaseLabel(
  phase: ShieldWrapPhase,
  extra?: { cooldownSec?: number; attempt?: number },
): string {
  switch (phase) {
    case "checking":
      return "Checking USDC allowance…";
    case "approving":
      return "Step 1/2 — Approve USDC in your wallet";
    case "cooldown":
      return extra?.cooldownSec
        ? `Preparing shield… ${extra.cooldownSec}s`
        : "Preparing shield…";
    case "shielding":
      return "Step 2/2 — Shield USDC in your wallet";
    case "retry-shield":
      return extra?.attempt
        ? `Network busy — retrying shield (${extra.attempt}/${SHIELD_RATE_LIMIT_RETRIES})…`
        : "Retrying shield…";
    case "done":
      return "Done";
    default:
      return "";
  }
}
