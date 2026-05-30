-- ── obscura_agent_tokens ─────────────────────────────────────
-- Agent access tokens for MCP / SDK wallet-scoped API reads.
-- Only SHA-256 hashes are stored — never plaintext tokens.

CREATE TABLE IF NOT EXISTS obscura_agent_tokens (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash    TEXT        NOT NULL UNIQUE,
  wallet        TEXT        NOT NULL,
  label         TEXT,
  permissions   TEXT[]      NOT NULL DEFAULT ARRAY['activity:read', 'reputation:read', 'balance:read'],
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at    TIMESTAMPTZ NOT NULL,
  last_used_at  TIMESTAMPTZ,
  revoked_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_agent_tokens_wallet
  ON obscura_agent_tokens (wallet);

CREATE INDEX IF NOT EXISTS idx_agent_tokens_hash
  ON obscura_agent_tokens (token_hash);

CREATE INDEX IF NOT EXISTS idx_agent_tokens_wallet_active
  ON obscura_agent_tokens (wallet)
  WHERE revoked_at IS NULL;

ALTER TABLE obscura_agent_tokens ENABLE ROW LEVEL SECURITY;

-- Service role only — obscura-api uses SUPABASE_SERVICE_ROLE_KEY
DROP POLICY IF EXISTS "service_role_only_agent_tokens" ON obscura_agent_tokens;
CREATE POLICY "service_role_only_agent_tokens"
  ON obscura_agent_tokens
  FOR ALL
  USING (false)
  WITH CHECK (false);
