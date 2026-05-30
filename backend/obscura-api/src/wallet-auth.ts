import { verifyMessage } from "viem";

const WALLET_AUTH_REQUIRED = process.env.WALLET_AUTH_REQUIRED === "true";
const WALLET_AUTH_MAX_AGE_SEC = parseInt(process.env.WALLET_AUTH_MAX_AGE_SEC ?? "300", 10);
/** App wallet sessions (Obscura frontend) — default 7 days */
export const APP_WALLET_SESSION_MAX_AGE_SEC = parseInt(
  process.env.APP_WALLET_SESSION_MAX_AGE_SEC ?? String(7 * 24 * 60 * 60),
  10,
);

export function isWalletAuthRequired(): boolean {
  return WALLET_AUTH_REQUIRED;
}

export function normalizeWallet(wallet: unknown): string | null {
  return typeof wallet === "string" && /^0x[0-9a-fA-F]{40}$/.test(wallet)
    ? wallet.toLowerCase()
    : null;
}

/** Legacy short-lived auth (notification writes when WALLET_AUTH_REQUIRED=true) */
export function buildWalletAuthMessage(wallet: string, timestamp: number): string {
  return `Obscura API wallet auth\nWallet: ${wallet.toLowerCase()}\nTimestamp: ${timestamp}`;
}

/** 7-day Obscura app session — bound to wallet via EIP-191 */
export function buildAppSessionMessage(wallet: string, issuedAt: number): string {
  return [
    "Obscura App Session",
    `Wallet: ${wallet.toLowerCase()}`,
    `Issued: ${issuedAt}`,
    `Valid for: ${APP_WALLET_SESSION_MAX_AGE_SEC} seconds`,
  ].join("\n");
}

async function verifySignedMessage(params: {
  wallet: string;
  message: string;
  signature: string;
}): Promise<boolean> {
  return verifyMessage({
    address: params.wallet as `0x${string}`,
    message: params.message,
    signature: params.signature as `0x${string}`,
  });
}

export async function verifyAppWalletSession(params: {
  wallet: unknown;
  signature?: unknown;
  timestamp?: unknown;
}): Promise<{ ok: true; wallet: string } | { ok: false; error: string }> {
  const wallet = normalizeWallet(params.wallet);
  if (!wallet) return { ok: false, error: "Invalid wallet address" };

  if (typeof params.signature !== "string" || !params.signature.startsWith("0x")) {
    return { ok: false, error: "Wallet signature required" };
  }

  const issuedAt =
    typeof params.timestamp === "number"
      ? params.timestamp
      : typeof params.timestamp === "string"
        ? parseInt(params.timestamp, 10)
        : NaN;

  if (!Number.isFinite(issuedAt)) {
    return { ok: false, error: "timestamp required for wallet signature" };
  }

  const ageSec = Math.floor(Date.now() / 1000) - issuedAt;
  if (ageSec < 0 || ageSec > APP_WALLET_SESSION_MAX_AGE_SEC) {
    return { ok: false, error: "app session expired" };
  }

  const appMessage = buildAppSessionMessage(wallet, issuedAt);
  if (await verifySignedMessage({ wallet, message: appMessage, signature: params.signature })) {
    return { ok: true, wallet };
  }

  // Legacy 4-minute session message (migration grace)
  const legacyMessage = buildWalletAuthMessage(wallet, issuedAt);
  if (await verifySignedMessage({ wallet, message: legacyMessage, signature: params.signature })) {
    const legacyAge = Math.abs(Math.floor(Date.now() / 1000) - issuedAt);
    if (legacyAge <= WALLET_AUTH_MAX_AGE_SEC) return { ok: true, wallet };
  }

  return { ok: false, error: "invalid wallet signature" };
}

export async function verifyWalletSignature(params: {
  wallet: unknown;
  signature?: unknown;
  timestamp?: unknown;
}): Promise<{ ok: true; wallet: string } | { ok: false; error: string }> {
  const wallet = normalizeWallet(params.wallet);
  if (!wallet) return { ok: false, error: "Invalid wallet address" };

  if (typeof params.signature !== "string" || !params.signature.startsWith("0x")) {
    return { ok: false, error: "Wallet signature required" };
  }

  const timestamp =
    typeof params.timestamp === "number"
      ? params.timestamp
      : typeof params.timestamp === "string"
        ? parseInt(params.timestamp, 10)
        : NaN;

  if (!Number.isFinite(timestamp)) {
    return { ok: false, error: "timestamp required for wallet signature" };
  }

  const ageSec = Math.abs(Math.floor(Date.now() / 1000) - timestamp);
  if (ageSec > WALLET_AUTH_MAX_AGE_SEC) {
    return { ok: false, error: "wallet signature expired" };
  }

  const message = buildWalletAuthMessage(wallet, timestamp);
  const valid = await verifySignedMessage({ wallet, message, signature: params.signature });
  if (!valid) return { ok: false, error: "invalid wallet signature" };
  return { ok: true, wallet };
}

export async function verifyWalletAuth(params: {
  wallet: unknown;
  signature?: unknown;
  timestamp?: unknown;
}): Promise<{ ok: true; wallet: string } | { ok: false; error: string }> {
  if (!WALLET_AUTH_REQUIRED) {
    const wallet = normalizeWallet(params.wallet);
    if (!wallet) return { ok: false, error: "Invalid wallet address" };
    return { ok: true, wallet };
  }

  return verifyWalletSignature(params);
}
