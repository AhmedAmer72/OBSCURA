import { Router, Request, Response } from "express";
import { db } from "./db";
import {
  type AgentTokenRow,
  MAX_TOKENS_PER_WALLET,
  generateAgentToken,
  parseBearerToken,
  sanitizePermissions,
  toPublicTokenRow,
  tokenExpiresAt,
  verifyAgentTokenRequest,
} from "./agent-auth";
import { lookupAgentToken, requireAgentToken, resolveAgentTokenFromRequest } from "./agent-middleware";

export const agentRouter = Router();

async function countActiveTokens(wallet: string): Promise<number> {
  const { count, error } = await db
    .from("obscura_agent_tokens")
    .select("id", { count: "exact", head: true })
    .eq("wallet", wallet)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString());

  if (error) throw error;
  return count ?? 0;
}

/** GET /agent/me — validate Bearer token and return wallet identity */
agentRouter.get("/agent/me", async (req: Request, res: Response) => {
  const resolved = await resolveAgentTokenFromRequest(req);
  if (!resolved) {
    res.status(401).json({ error: "Invalid or expired agent token" });
    return;
  }
  res.json({
    wallet: resolved.wallet,
    permissions: resolved.permissions,
    expiresAt: resolved.expiresAt,
    tokenId: resolved.tokenId,
  });
});

/** POST /agent-tokens — create token (EIP-191 wallet proof, plaintext token returned once) */
agentRouter.post("/agent-tokens", async (req: Request, res: Response) => {
  const auth = await verifyAgentTokenRequest({
    wallet: req.body?.wallet,
    signature: req.body?.signature,
    timestamp: req.body?.timestamp,
    action: "create",
  });
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  try {
    const activeCount = await countActiveTokens(auth.wallet);
    if (activeCount >= MAX_TOKENS_PER_WALLET) {
      res.status(429).json({
        error: `Maximum ${MAX_TOKENS_PER_WALLET} active agent tokens per wallet. Revoke an existing token first.`,
      });
      return;
    }

    const { token, hash } = generateAgentToken();
    const permissions = sanitizePermissions(req.body?.permissions);
    const label = typeof req.body?.label === "string" ? req.body.label.slice(0, 64) : null;
    const expiresAt = tokenExpiresAt();

    const { data, error } = await db
      .from("obscura_agent_tokens")
      .insert({
        token_hash: hash,
        wallet: auth.wallet,
        label,
        permissions,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (error) throw error;

    const row = data as AgentTokenRow;
    res.status(201).json({
      token,
      tokenId: row.id,
      wallet: row.wallet,
      permissions: row.permissions,
      expiresAt: row.expires_at,
      label: row.label,
      warning: "Store this token securely — it will not be shown again.",
    });
  } catch (e) {
    console.error(`[agent-tokens] create failed wallet=${auth.wallet.slice(0, 6)} error=${(e as Error).message}`);
    res.status(503).json({ error: "Agent token creation unavailable" });
  }
});

/** GET /agent-tokens?wallet=&signature=&timestamp= — list tokens for wallet (no plaintext) */
agentRouter.get("/agent-tokens", async (req: Request, res: Response) => {
  const auth = await verifyAgentTokenRequest({
    wallet: req.query.wallet,
    signature: req.query.signature,
    timestamp: req.query.timestamp,
    action: "list",
  });
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  try {
    const { data, error } = await db
      .from("obscura_agent_tokens")
      .select("*")
      .eq("wallet", auth.wallet)
      .order("created_at", { ascending: false });

    if (error) throw error;
    res.json({
      wallet: auth.wallet,
      tokens: ((data ?? []) as AgentTokenRow[]).map(toPublicTokenRow),
    });
  } catch (e) {
    console.error(`[agent-tokens] list failed wallet=${auth.wallet.slice(0, 6)} error=${(e as Error).message}`);
    res.status(503).json({ error: "Agent token list unavailable" });
  }
});

/** DELETE /agent-tokens/:id — revoke token */
agentRouter.delete("/agent-tokens/:id", async (req: Request, res: Response) => {
  const tokenId = req.params.id;
  const auth = await verifyAgentTokenRequest({
    wallet: req.body?.wallet,
    signature: req.body?.signature,
    timestamp: req.body?.timestamp,
    action: "revoke",
    tokenId,
  });
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  try {
    const { data, error } = await db
      .from("obscura_agent_tokens")
      .select("*")
      .eq("id", tokenId)
      .eq("wallet", auth.wallet)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    const row = data as AgentTokenRow;
    if (row.revoked_at) {
      res.json({ ok: true, token: toPublicTokenRow(row) });
      return;
    }

    const revokedAt = new Date().toISOString();
    const { data: updated, error: updateError } = await db
      .from("obscura_agent_tokens")
      .update({ revoked_at: revokedAt })
      .eq("id", tokenId)
      .select("*")
      .single();

    if (updateError) throw updateError;
    res.json({ ok: true, token: toPublicTokenRow(updated as AgentTokenRow) });
  } catch (e) {
    console.error(`[agent-tokens] revoke failed id=${tokenId} error=${(e as Error).message}`);
    res.status(503).json({ error: "Agent token revocation unavailable" });
  }
});

/** POST /agent-tokens/:id/regenerate — revoke old token and issue new one */
agentRouter.post("/agent-tokens/:id/regenerate", async (req: Request, res: Response) => {
  const tokenId = req.params.id;
  const auth = await verifyAgentTokenRequest({
    wallet: req.body?.wallet,
    signature: req.body?.signature,
    timestamp: req.body?.timestamp,
    action: "regenerate",
    tokenId,
  });
  if (!auth.ok) {
    res.status(401).json({ error: auth.error });
    return;
  }

  try {
    const { data: existing, error: fetchError } = await db
      .from("obscura_agent_tokens")
      .select("*")
      .eq("id", tokenId)
      .eq("wallet", auth.wallet)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!existing) {
      res.status(404).json({ error: "Token not found" });
      return;
    }

    const row = existing as AgentTokenRow;
    const revokedAt = new Date().toISOString();

    await db
      .from("obscura_agent_tokens")
      .update({ revoked_at: revokedAt })
      .eq("id", tokenId);

    const { token, hash } = generateAgentToken();
    const expiresAt = tokenExpiresAt();
    const permissions = sanitizePermissions(row.permissions);
    const label = typeof req.body?.label === "string" ? req.body.label.slice(0, 64) : row.label;

    const { data: created, error: createError } = await db
      .from("obscura_agent_tokens")
      .insert({
        token_hash: hash,
        wallet: auth.wallet,
        label,
        permissions,
        expires_at: expiresAt,
      })
      .select("*")
      .single();

    if (createError) throw createError;

    const newRow = created as AgentTokenRow;
    res.status(201).json({
      token,
      tokenId: newRow.id,
      revokedTokenId: tokenId,
      wallet: newRow.wallet,
      permissions: newRow.permissions,
      expiresAt: newRow.expires_at,
      label: newRow.label,
      warning: "Store this token securely — it will not be shown again.",
    });
  } catch (e) {
    console.error(`[agent-tokens] regenerate failed id=${tokenId} error=${(e as Error).message}`);
    res.status(503).json({ error: "Agent token regeneration unavailable" });
  }
});

/** POST /agent/validate — validate token without side effects (optional, for MCP startup) */
agentRouter.post("/agent/validate", async (req: Request, res: Response) => {
  const token =
    typeof req.body?.token === "string" ? req.body.token : parseBearerToken(req.headers.authorization);
  if (!token) {
    res.status(400).json({ error: "token required" });
    return;
  }
  const resolved = await lookupAgentToken(token);
  if (!resolved) {
    res.status(401).json({ error: "Invalid or expired agent token" });
    return;
  }
  res.json({
    wallet: resolved.wallet,
    permissions: resolved.permissions,
    expiresAt: resolved.expiresAt,
    tokenId: resolved.tokenId,
  });
});

export { requireAgentToken };
