import type { NextFunction, Request, Response } from "express";
import { db } from "./db";
import {
  type AgentPermission,
  type AgentTokenRow,
  type ResolvedAgentToken,
  AGENT_AUTH_LEGACY_PUBLIC,
  hashAgentToken,
  hasPermission,
  isTokenActive,
  parseBearerToken,
} from "./agent-auth";
import { verifyAppWalletSession } from "./wallet-auth";

declare global {
  namespace Express {
    interface Request {
      agentToken?: ResolvedAgentToken;
      walletSession?: { wallet: string };
    }
  }
}

function extractWalletSessionHeaders(req: Request): { signature?: unknown; timestamp?: unknown } {
  const signature =
    req.headers["x-obscura-signature"] ??
    (typeof req.query.signature === "string" ? req.query.signature : undefined);
  const timestamp =
    req.headers["x-obscura-timestamp"] ??
    (typeof req.query.timestamp === "string" ? req.query.timestamp : undefined);
  return { signature, timestamp };
}

export async function lookupAgentToken(token: string): Promise<ResolvedAgentToken | null> {
  const tokenHash = hashAgentToken(token);
  const { data, error } = await db
    .from("obscura_agent_tokens")
    .select("*")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as AgentTokenRow;
  if (!isTokenActive(row)) return null;

  void db
    .from("obscura_agent_tokens")
    .update({ last_used_at: new Date().toISOString() })
    .eq("id", row.id)
    .then(({ error: updateError }) => {
      if (updateError) {
        console.warn(`[agent-auth] last_used_at update failed id=${row.id}`);
      }
    });

  return {
    tokenId: row.id,
    wallet: row.wallet,
    permissions: row.permissions,
    expiresAt: row.expires_at,
  };
}

export async function resolveAgentTokenFromRequest(req: Request): Promise<ResolvedAgentToken | null> {
  const header = req.headers.authorization;
  const token = parseBearerToken(header);
  if (!token) return null;
  return lookupAgentToken(token);
}

export function requireAgentToken(requiredPermission?: AgentPermission) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const resolved = await resolveAgentTokenFromRequest(req);
    if (!resolved) {
      res.status(401).json({ error: "Valid agent token required (Authorization: Bearer obsc_at_…)" });
      return;
    }
    if (requiredPermission && !hasPermission(resolved.permissions, requiredPermission)) {
      res.status(403).json({ error: `Missing permission: ${requiredPermission}` });
      return;
    }
    req.agentToken = resolved;
    next();
  };
}

export async function enforceWalletScopeOrLegacy(
  req: Request,
  res: Response,
  pathWallet: string,
): Promise<"ok" | "done"> {
  const agent = await resolveAgentTokenFromRequest(req);
  if (agent) {
    if (agent.wallet !== pathWallet) {
      res.status(403).json({ error: "Agent token wallet does not match requested wallet" });
      return "done";
    }
    req.agentToken = agent;
    return "ok";
  }

  if (!AGENT_AUTH_LEGACY_PUBLIC) {
    const { signature, timestamp } = extractWalletSessionHeaders(req);
    const session = await verifyAppWalletSession({
      wallet: pathWallet,
      signature,
      timestamp,
    });
    if (session.ok) {
      req.walletSession = { wallet: session.wallet };
      return "ok";
    }
    res.status(401).json({
      error: "Authentication required — connect wallet in the Obscura app or use an agent token for MCP",
    });
    return "done";
  }

  return "ok";
}
