import { verifyMessage } from "viem";

const WALLET_AUTH_REQUIRED = process.env.WALLET_AUTH_REQUIRED === "true";
const WALLET_AUTH_MAX_AGE_SEC = parseInt(process.env.WALLET_AUTH_MAX_AGE_SEC ?? "300", 10);

export function isWalletAuthRequired(): boolean {
  return WALLET_AUTH_REQUIRED;
}

export function normalizeWallet(wallet: unknown): string | null {
  return typeof wallet === "string" && /^0x[0-9a-fA-F]{40}$/.test(wallet)
    ? wallet.toLowerCase()
    : null;
}

export function buildWalletAuthMessage(wallet: string, timestamp: number): string {
  return `Obscura API wallet auth\nWallet: ${wallet.toLowerCase()}\nTimestamp: ${timestamp}`;
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
  const valid = await verifyMessage({
    address: wallet as `0x${string}`,
    message,
    signature: params.signature as `0x${string}`,
  });

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
