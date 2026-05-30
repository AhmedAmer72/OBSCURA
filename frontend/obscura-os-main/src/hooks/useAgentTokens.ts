import { useCallback, useEffect, useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

const API_URL = (
  (import.meta.env.VITE_NOTIFICATIONS_URL as string | undefined) ??
  (import.meta.env.VITE_RELAY_URL as string | undefined) ??
  "http://localhost:3000"
).replace(/\/$/, "");

export type AgentTokenAction = "create" | "revoke" | "regenerate" | "list";

export interface AgentTokenPublic {
  id: string;
  wallet: string;
  label: string | null;
  permissions: string[];
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  active: boolean;
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

export function useAgentTokens() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const wallet = address?.toLowerCase() ?? null;

  const [tokens, setTokens] = useState<AgentTokenPublic[]>([]);
  const [newToken, setNewToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signForAction = useCallback(
    async (action: AgentTokenAction, tokenId?: string) => {
      if (!wallet) throw new Error("Connect wallet first");
      const timestamp = Math.floor(Date.now() / 1000);
      const message = buildAgentTokenMessage(wallet, timestamp, action, tokenId);
      const signature = await signMessageAsync({ message });
      return { wallet, signature, timestamp };
    },
    [wallet, signMessageAsync],
  );

  const refreshTokens = useCallback(async () => {
    if (!wallet) {
      setTokens([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const { wallet: w, signature, timestamp } = await signForAction("list");
      const qs = new URLSearchParams({
        wallet: w,
        signature,
        timestamp: String(timestamp),
      });
      const res = await fetch(`${API_URL}/agent-tokens?${qs.toString()}`);
      if (!res.ok) throw new Error(`Failed to list tokens (${res.status})`);
      const data = (await res.json()) as { tokens: AgentTokenPublic[] };
      setTokens(data.tokens);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to list tokens");
    } finally {
      setIsLoading(false);
    }
  }, [wallet, signForAction]);

  const createToken = useCallback(
    async (label?: string) => {
      setError(null);
      setNewToken(null);
      const proof = await signForAction("create");
      const res = await fetch(`${API_URL}/agent-tokens`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...proof, label }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Create failed (${res.status})`);
      }
      const data = (await res.json()) as { token: string };
      setNewToken(data.token);
      await refreshTokens();
      return data.token;
    },
    [signForAction, refreshTokens],
  );

  const revokeToken = useCallback(
    async (tokenId: string) => {
      setError(null);
      const proof = await signForAction("revoke", tokenId);
      const res = await fetch(`${API_URL}/agent-tokens/${tokenId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Revoke failed (${res.status})`);
      }
      await refreshTokens();
    },
    [signForAction, refreshTokens],
  );

  const regenerateToken = useCallback(
    async (tokenId: string) => {
      setError(null);
      setNewToken(null);
      const proof = await signForAction("regenerate", tokenId);
      const res = await fetch(`${API_URL}/agent-tokens/${tokenId}/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(proof),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as { error?: string }).error ?? `Regenerate failed (${res.status})`);
      }
      const data = (await res.json()) as { token: string };
      setNewToken(data.token);
      await refreshTokens();
      return data.token;
    },
    [signForAction, refreshTokens],
  );

  useEffect(() => {
    if (!isConnected || !wallet) {
      setTokens([]);
      return;
    }
  }, [isConnected, wallet]);

  return {
    wallet,
    isConnected,
    tokens,
    newToken,
    isLoading,
    error,
    setError,
    createToken,
    revokeToken,
    regenerateToken,
    refreshTokens,
    clearNewToken: () => setNewToken(null),
  };
}
