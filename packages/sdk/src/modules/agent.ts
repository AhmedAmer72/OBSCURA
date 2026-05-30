import type { Address } from "viem";
import { HttpClient } from "../core/http.js";
import { normalizeWallet } from "../core/utils.js";

export type AgentPermission = "activity:read" | "reputation:read" | "balance:read";

export interface AgentTokenCreateResult {
  token: string;
  tokenId: string;
  wallet: Address;
  permissions: AgentPermission[];
  expiresAt: string;
  label: string | null;
  warning: string;
}

export interface AgentTokenPublic {
  id: string;
  wallet: Address;
  label: string | null;
  permissions: AgentPermission[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  active: boolean;
}

export interface AgentIdentity {
  wallet: Address;
  permissions: AgentPermission[];
  expiresAt: string;
  tokenId: string;
}

export class AgentModule {
  constructor(private readonly http: HttpClient) {}

  async validateToken(token: string): Promise<AgentIdentity> {
    return this.http.post<AgentIdentity>("/agent/validate", { token });
  }

  async getIdentity(): Promise<AgentIdentity> {
    if (!this.http.hasAgentToken()) {
      throw new Error("agentToken required");
    }
    return this.http.get<AgentIdentity>("/agent/me");
  }

  async createToken(params: {
    wallet: Address;
    signature: `0x${string}`;
    timestamp: number;
    label?: string;
    permissions?: AgentPermission[];
  }): Promise<AgentTokenCreateResult> {
    const wallet = normalizeWallet(params.wallet);
    if (!wallet) throw new Error("Invalid wallet address");
    return this.http.post<AgentTokenCreateResult>("/agent-tokens", {
      wallet,
      signature: params.signature,
      timestamp: params.timestamp,
      label: params.label,
      permissions: params.permissions,
    });
  }

  async listTokens(params: {
    wallet: Address;
    signature: `0x${string}`;
    timestamp: number;
  }): Promise<{ wallet: Address; tokens: AgentTokenPublic[] }> {
    const wallet = normalizeWallet(params.wallet);
    if (!wallet) throw new Error("Invalid wallet address");
    const qs = new URLSearchParams({
      wallet,
      signature: params.signature,
      timestamp: String(params.timestamp),
    });
    return this.http.get(`/agent-tokens?${qs.toString()}`);
  }

  async revokeToken(params: {
    tokenId: string;
    wallet: Address;
    signature: `0x${string}`;
    timestamp: number;
  }): Promise<{ ok: boolean; token: AgentTokenPublic }> {
    const wallet = normalizeWallet(params.wallet);
    if (!wallet) throw new Error("Invalid wallet address");
    return this.http.delete(`/agent-tokens/${params.tokenId}`, {
      wallet,
      signature: params.signature,
      timestamp: params.timestamp,
    });
  }

  async regenerateToken(params: {
    tokenId: string;
    wallet: Address;
    signature: `0x${string}`;
    timestamp: number;
    label?: string;
  }): Promise<AgentTokenCreateResult & { revokedTokenId: string }> {
    const wallet = normalizeWallet(params.wallet);
    if (!wallet) throw new Error("Invalid wallet address");
    return this.http.post(`/agent-tokens/${params.tokenId}/regenerate`, {
      wallet,
      signature: params.signature,
      timestamp: params.timestamp,
      label: params.label,
    });
  }
}

/** EIP-191 message for agent token wallet proof */
export function buildAgentTokenMessage(
  wallet: Address,
  timestamp: number,
  action: "create" | "revoke" | "regenerate" | "list",
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
