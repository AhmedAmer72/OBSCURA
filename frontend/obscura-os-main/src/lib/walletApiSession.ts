/**
 * Obscura app wallet session — 7-day persistent EIP-191 auth (localStorage).
 * MCP agents use OBSCURA_AGENT_TOKEN separately — not stored here.
 */

export const APP_SESSION_VERSION = 2;
export const APP_SESSION_DURATION_SEC = 7 * 24 * 60 * 60;
/** Proactively renew when less than 24h remain */
export const APP_SESSION_REFRESH_BEFORE_SEC = 24 * 60 * 60;

const STORAGE_PREFIX = "obscura.appSession.v2";
const BC_CHANNEL = "obscura.appSession.sync";

export interface AppWalletSession {
  version: typeof APP_SESSION_VERSION;
  wallet: string;
  signature: string;
  issuedAt: number;
  expiresAt: number;
}

export function buildAppSessionMessage(wallet: string, issuedAt: number): string {
  return [
    "Obscura App Session",
    `Wallet: ${wallet.toLowerCase()}`,
    `Issued: ${issuedAt}`,
    `Valid for: ${APP_SESSION_DURATION_SEC} seconds`,
  ].join("\n");
}

function storageKey(wallet: string): string {
  return `${STORAGE_PREFIX}:${wallet.toLowerCase()}`;
}

function nowSec(): number {
  return Math.floor(Date.now() / 1000);
}

export function isSessionValid(session: AppWalletSession, wallet: string, atSec = nowSec()): boolean {
  return (
    session.version === APP_SESSION_VERSION &&
    session.wallet === wallet.toLowerCase() &&
    atSec < session.expiresAt
  );
}

export function sessionNeedsRefresh(session: AppWalletSession, atSec = nowSec()): boolean {
  return isSessionValid(session, session.wallet, atSec) &&
    session.expiresAt - atSec <= APP_SESSION_REFRESH_BEFORE_SEC;
}

export function readAppWalletSession(wallet: string): AppWalletSession | null {
  try {
    const raw = localStorage.getItem(storageKey(wallet));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AppWalletSession;
    if (!isSessionValid(parsed, wallet)) {
      localStorage.removeItem(storageKey(wallet));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeAppWalletSession(session: AppWalletSession): void {
  localStorage.setItem(storageKey(session.wallet), JSON.stringify(session));
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.postMessage({ type: "session-updated", wallet: session.wallet });
    bc.close();
  } catch {
    /* BroadcastChannel unavailable in some WebViews */
  }
}

export function clearAppWalletSession(wallet?: string): void {
  if (wallet) {
    localStorage.removeItem(storageKey(wallet));
    return;
  }
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key?.startsWith(`${STORAGE_PREFIX}:`)) localStorage.removeItem(key);
  }
}

export function createAppWalletSession(wallet: string, signature: string, issuedAt = nowSec()): AppWalletSession {
  const normalized = wallet.toLowerCase();
  return {
    version: APP_SESSION_VERSION,
    wallet: normalized,
    signature,
    issuedAt,
    expiresAt: issuedAt + APP_SESSION_DURATION_SEC,
  };
}

export type SignMessageFn = (message: string) => Promise<string>;

export function getSessionAuthHeaders(session: AppWalletSession): Record<string, string> {
  return {
    "X-Obscura-Signature": session.signature,
    "X-Obscura-Timestamp": String(session.issuedAt),
  };
}

export function getApiBaseUrl(): string {
  return (
    (import.meta.env.VITE_NOTIFICATIONS_URL as string | undefined) ??
    (import.meta.env.VITE_RELAY_URL as string | undefined) ??
    "https://obscura-api-n62v.onrender.com"
  ).replace(/\/$/, "");
}

export async function fetchWithAppSession<T>(
  path: string,
  session: AppWalletSession,
  init?: RequestInit,
): Promise<T> {
  if (!isSessionValid(session, session.wallet)) {
    throw new Error("Wallet session expired");
  }
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...getSessionAuthHeaders(session),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`API ${path} failed (${response.status})${body ? `: ${body}` : ""}`);
  }
  return response.json() as Promise<T>;
}

/** Subscribe to session updates from other tabs */
export function subscribeAppSessionSync(onUpdate: (wallet: string) => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (!event.key?.startsWith(`${STORAGE_PREFIX}:`)) return;
    const wallet = event.key.slice(`${STORAGE_PREFIX}:`.length);
    onUpdate(wallet);
  };
  window.addEventListener("storage", onStorage);

  let bc: BroadcastChannel | null = null;
  try {
    bc = new BroadcastChannel(BC_CHANNEL);
    bc.onmessage = (event: MessageEvent<{ type?: string; wallet?: string }>) => {
      if (event.data?.type === "session-updated" && event.data.wallet) {
        onUpdate(event.data.wallet);
      }
      if (event.data?.type === "session-cleared" && event.data.wallet) {
        onUpdate(event.data.wallet);
      }
    };
  } catch {
    /* ignore */
  }

  return () => {
    window.removeEventListener("storage", onStorage);
    bc?.close();
  };
}

export function broadcastSessionCleared(wallet: string): void {
  try {
    const bc = new BroadcastChannel(BC_CHANNEL);
    bc.postMessage({ type: "session-cleared", wallet: wallet.toLowerCase() });
    bc.close();
  } catch {
    /* ignore */
  }
}
