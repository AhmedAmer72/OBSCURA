import { DEFAULT_API_URL } from "@obscura-fhe/sdk";

export interface AgentContext {
  wallet: string;
  permissions: string[];
  expiresAt: string;
  tokenId: string;
}

let cachedContext: AgentContext | null = null;

export function resetAgentContextCache(): void {
  cachedContext = null;
}

export function getAgentContext(): AgentContext | null {
  return cachedContext;
}

export function requireAgentContext(): AgentContext {
  if (!cachedContext) {
    throw new Error(
      "OBSCURA_AGENT_TOKEN required for wallet-scoped tools. Create one at https://obscuraos.online/docs/agents",
    );
  }
  return cachedContext;
}

export async function resolveAgentContext(): Promise<AgentContext> {
  if (cachedContext) return cachedContext;

  const token = process.env.OBSCURA_AGENT_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "OBSCURA_AGENT_TOKEN is not set. Connect your wallet at /docs/agents to generate a token.",
    );
  }

  const apiUrl = (process.env.OBSCURA_API_URL ?? DEFAULT_API_URL).replace(/\/$/, "");
  const res = await fetch(`${apiUrl}/agent/me`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Invalid OBSCURA_AGENT_TOKEN (${res.status})${body ? `: ${body}` : ""}`);
  }

  const data = (await res.json()) as AgentContext;
  cachedContext = {
    wallet: data.wallet.toLowerCase(),
    permissions: data.permissions,
    expiresAt: data.expiresAt,
    tokenId: data.tokenId,
  };
  return cachedContext;
}

export function requirePermission(permission: string): void {
  const ctx = requireAgentContext();
  if (!ctx.permissions.includes(permission)) {
    throw new Error(`Agent token missing permission: ${permission}`);
  }
}
