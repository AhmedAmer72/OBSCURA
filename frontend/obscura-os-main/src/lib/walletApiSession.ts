/**
 * Wallet-scoped API session for Obscura app users (not MCP agent tokens).
 * Signs once per tab session; cached in sessionStorage (~4 min, API max age 300s).
 */

const SESSION_PREFIX = "obscura.walletApiSession.v1";
const SESSION_TTL_MS = 4 * 60 * 1000;

export interface WalletApiSession {
  wallet: string;
  signature: string;
  timestamp: number;
  cachedAt: number;
}

export function buildWalletAuthMessage(wallet: string, timestamp: number): string {
  return `Obscura API wallet auth\nWallet: ${wallet.toLowerCase()}\nTimestamp: ${timestamp}`;
}

function sessionKey(wallet: string): string {
  return `${SESSION_PREFIX}:${wallet.toLowerCase()}`;
}

export function readWalletApiSession(wallet: string): WalletApiSession | null {
  try {
    const raw = sessionStorage.getItem(sessionKey(wallet));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WalletApiSession;
    if (parsed.wallet !== wallet.toLowerCase()) return null;
    if (Date.now() - parsed.cachedAt > SESSION_TTL_MS) {
      sessionStorage.removeItem(sessionKey(wallet));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeWalletApiSession(session: WalletApiSession): void {
  sessionStorage.setItem(sessionKey(session.wallet), JSON.stringify(session));
}

export function clearWalletApiSession(wallet?: string): void {
  if (wallet) {
    sessionStorage.removeItem(sessionKey(wallet));
    return;
  }
  for (let i = sessionStorage.length - 1; i >= 0; i--) {
    const key = sessionStorage.key(i);
    if (key?.startsWith(`${SESSION_PREFIX}:`)) sessionStorage.removeItem(key);
  }
}

export type SignMessageFn = (message: string) => Promise<string>;

export async function ensureWalletApiSession(
  wallet: string,
  signMessage: SignMessageFn,
): Promise<WalletApiSession> {
  const normalized = wallet.toLowerCase();
  const existing = readWalletApiSession(normalized);
  if (existing) return existing;

  const timestamp = Math.floor(Date.now() / 1000);
  const message = buildWalletAuthMessage(normalized, timestamp);
  const signature = await signMessage(message);
  const session: WalletApiSession = {
    wallet: normalized,
    signature,
    timestamp,
    cachedAt: Date.now(),
  };
  writeWalletApiSession(session);
  return session;
}

export function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_NOTIFICATIONS_URL as string | undefined) ??
    (import.meta.env.VITE_RELAY_URL as string | undefined) ??
    "https://obscura-api-n62v.onrender.com"
  ).replace(/\/$/, "");
}

export async function fetchWalletApi<T>(
  path: string,
  wallet: string,
  signMessage: SignMessageFn,
  init?: RequestInit,
): Promise<T> {
  const session = await ensureWalletApiSession(wallet, signMessage);
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "X-Obscura-Signature": session.signature,
      "X-Obscura-Timestamp": String(session.timestamp),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API ${path} failed (${response.status})${body ? `: ${body}` : ""}`);
  }
  return response.json() as Promise<T>;
}
