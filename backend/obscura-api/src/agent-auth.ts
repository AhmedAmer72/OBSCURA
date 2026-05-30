import { createHash, randomBytes } from "crypto";
import { verifyMessage } from "viem";

export const TOKEN_PREFIX = "obsc_at_";
export const DEFAULT_AGENT_PERMISSIONS = [
  "activity:read",
  "reputation:read",
  "balance:read",
] as const;

export type AgentPermission = (typeof DEFAULT_AGENT_PERMISSIONS)[number];

export const TOKEN_TTL_DAYS = parseInt(process.env.AGENT_TOKEN_TTL_DAYS ?? "90", 10);
export const MAX_TOKENS_PER_WALLET = parseInt(process.env.AGENT_TOKEN_MAX_PER_WALLET ?? "5", 10);
export const AGENT_AUTH_LEGACY_PUBLIC = process.env.AGENT_AUTH_LEGACY_PUBLIC !== "false";

const AUTH_MAX_AGE_SEC = parseInt(process.env.AGENT_AUTH_MAX_AGE_SEC ?? "300", 10);

export type AgentTokenAction = "create" | "revoke" | "regenerate" | "list";

export interface AgentTokenRow {
  id: string;
  token_hash: string;
  wallet: string;
  label: string | null;
  permissions: string[];
  created_at: string;
  expires_at: string;
  last_used_at: string | null;
  revoked_at: string | null;
}

export interface ResolvedAgentToken {
  tokenId: string;
  wallet: string;
  permissions: string[];
  expiresAt: string;
}

export function normalizeWallet(wallet: unknown): string | null {
  return typeof wallet === "string" && /^0x[0-9a-fA-F]{40}$/.test(wallet)
    ? wallet.toLowerCase()
    : null;
}

export function hashAgentToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateAgentToken(): { token: string; hash: string } {
  const raw = randomBytes(32);
  const token = `${TOKEN_PREFIX}${raw.toString("base64url")}`;
  return { token, hash: hashAgentToken(token) };
}

export function parseBearerToken(header: unknown): string | null {
  if (typeof header !== "string" || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token.startsWith(TOKEN_PREFIX) || token.length < TOKEN_PREFIX.length + 16) return null;
  return token;
}

export function buildAgentTokenMessage(
  wallet: string,
  timestamp: number,
  action: AgentTokenAction,
  tokenId?: string,
): string {
  const lines = [
    "Obscura Agent Token Request",
    `Wallet: ${wallet.toLowerCase()}`,
    `Timestamp: ${timestamp}`,
    `Action: ${action}`,
  ];
  if (tokenId) lines.push(`TokenId: ${tokenId}`);
  return lines.join("\n");
}

export function tokenExpiresAt(from = new Date()): string {
  const expires = new Date(from);
  expires.setDate(expires.getDate() + TOKEN_TTL_DAYS);
  return expires.toISOString();
}

export function isTokenExpired(expiresAt: string, now = Date.now()): boolean {
  return new Date(expiresAt).getTime() <= now;
}

export function isTokenActive(row: AgentTokenRow, now = Date.now()): boolean {
  if (row.revoked_at) return false;
  return !isTokenExpired(row.expires_at, now);
}

export function hasPermission(permissions: string[], required: AgentPermission): boolean {
  return permissions.includes(required);
}

export async function verifyAgentTokenRequest(params: {
  wallet: unknown;
  signature?: unknown;
  timestamp?: unknown;
  action: AgentTokenAction;
  tokenId?: string;
}): Promise<{ ok: true; wallet: string } | { ok: false; error: string }> {
  const wallet = normalizeWallet(params.wallet);
  if (!wallet) return { ok: false, error: "Invalid wallet address" };

  if (typeof params.signature !== "string" || !params.signature.startsWith("0x")) {
    return { ok: false, error: "Wallet signature required (EIP-191)" };
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
  if (ageSec > AUTH_MAX_AGE_SEC) {
    return { ok: false, error: "wallet signature expired" };
  }

  const message = buildAgentTokenMessage(wallet, timestamp, params.action, params.tokenId);
  const valid = await verifyMessage({
    address: wallet as `0x${string}`,
    message,
    signature: params.signature as `0x${string}`,
  });

  if (!valid) return { ok: false, error: "invalid wallet signature" };
  return { ok: true, wallet };
}

export function sanitizePermissions(input: unknown): AgentPermission[] {
  if (!Array.isArray(input) || input.length === 0) {
    return [...DEFAULT_AGENT_PERMISSIONS];
  }
  const allowed = new Set<string>(DEFAULT_AGENT_PERMISSIONS);
  const picked = input.filter((p): p is AgentPermission => typeof p === "string" && allowed.has(p));
  return picked.length > 0 ? picked : [...DEFAULT_AGENT_PERMISSIONS];
}

export function toPublicTokenRow(row: AgentTokenRow) {
  return {
    id: row.id,
    wallet: row.wallet,
    label: row.label,
    permissions: row.permissions,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at,
    active: isTokenActive(row),
  };
}
