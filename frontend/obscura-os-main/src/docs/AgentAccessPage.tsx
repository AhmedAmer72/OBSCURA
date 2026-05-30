import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Bot,
  Check,
  Copy,
  KeyRound,
  RefreshCw,
  Shield,
  Trash2,
  Wallet,
} from "lucide-react";
import type { DocPage } from "@docs/types";
import WalletConnect from "@/components/wallet/WalletConnect";
import { DocContent } from "./DocContent";
import { useAgentTokens } from "@/hooks/useAgentTokens";
import { setAgentToken, getAgentToken } from "@/lib/agentToken";

interface AgentAccessPageProps {
  page: DocPage;
}

async function copyText(text: string): Promise<void> {
  await navigator.clipboard.writeText(text);
}

export function AgentAccessPage({ page }: AgentAccessPageProps) {
  const agent = useAgentTokens();
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [savedForApp, setSavedForApp] = useState(() => Boolean(getAgentToken()));
  const [busy, setBusy] = useState<string | null>(null);

  const mcpEnvSnippet = agent.newToken
    ? `"OBSCURA_AGENT_TOKEN": "${agent.newToken}"`
    : `"OBSCURA_AGENT_TOKEN": "obsc_at_…"`;

  const fullMcpJson = agent.newToken
    ? JSON.stringify(
        {
          mcpServers: {
            "obscura-user": {
              command: "node",
              args: ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js"],
              env: {
                OBSCURA_API_URL: "https://obscura-api-n62v.onrender.com",
                OBSCURA_AGENT_TOKEN: agent.newToken,
              },
            },
          },
        },
        null,
        2,
      )
    : "";

  const handleCopyToken = useCallback(async () => {
    if (!agent.newToken) return;
    await copyText(agent.newToken);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2500);
  }, [agent.newToken]);

  const handleCopyMcp = useCallback(async () => {
    const text = agent.newToken ? fullMcpJson : mcpEnvSnippet;
    await copyText(text);
    setCopiedMcp(true);
    setTimeout(() => setCopiedMcp(false), 2500);
  }, [agent.newToken, fullMcpJson, mcpEnvSnippet]);

  return (
    <div className="docs-agent-access">
      <motion.section
        className="docs-agent-panel"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <div className="docs-agent-panel-head">
          <div className="docs-agent-panel-badge">
            <KeyRound className="h-4 w-4" />
            Agent Authentication
          </div>
          <h2 className="docs-agent-panel-title">Create your Agent Token</h2>
          <p className="docs-agent-panel-lead">
            Prove wallet ownership with EIP-191, then issue a bearer token for MCP and SDK.
            Plaintext tokens are shown once — only a SHA-256 hash is stored server-side.
          </p>
        </div>

        <ol className="docs-agent-steps">
          <li className={agent.isConnected ? "docs-agent-step--done" : "docs-agent-step--active"}>
            <Wallet className="h-4 w-4" />
            <span>Connect wallet</span>
            <WalletConnect tone="light" />
          </li>
          <li className={agent.newToken ? "docs-agent-step--done" : agent.isConnected ? "docs-agent-step--active" : ""}>
            <Shield className="h-4 w-4" />
            <span>Sign message & generate token</span>
            <button
              type="button"
              className="docs-btn docs-btn--primary docs-btn--sm"
              disabled={!agent.isConnected || busy === "create"}
              onClick={async () => {
                setBusy("create");
                agent.setError(null);
                try {
                  await agent.createToken("MCP Agent");
                } catch (e) {
                  agent.setError(e instanceof Error ? e.message : "Token creation failed");
                } finally {
                  setBusy(null);
                }
              }}
            >
              {busy === "create" ? "Signing…" : "Sign & Generate Token"}
            </button>
          </li>
          <li className={agent.newToken ? "docs-agent-step--active" : ""}>
            <Bot className="h-4 w-4" />
            <span>Add to MCP config</span>
            <div className="docs-agent-env-wrap">
              <code className="docs-agent-env">{mcpEnvSnippet}</code>
              {agent.newToken && (
                <button
                  type="button"
                  className="docs-agent-copy-btn"
                  onClick={() => void handleCopyMcp()}
                  aria-label="Copy MCP config"
                >
                  {copiedMcp ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedMcp ? "Copied" : "Copy MCP JSON"}</span>
                </button>
              )}
            </div>
          </li>
        </ol>

        {agent.error && <p className="docs-agent-error">{agent.error}</p>}

        {agent.newToken && (
          <div className="docs-agent-token-reveal">
            <p className="docs-agent-token-warning">
              Copy this token now — it will not be shown again.
            </p>
            <div className="docs-agent-token-row">
              <code className="docs-agent-token-value">{agent.newToken}</code>
            </div>
            <div className="docs-agent-copy-actions">
              <button type="button" className="docs-btn docs-btn--primary" onClick={() => void handleCopyToken()}>
                {copiedToken ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copiedToken ? "Token copied!" : "Copy token"}
              </button>
              <button type="button" className="docs-btn docs-btn--secondary" onClick={() => void handleCopyMcp()}>
                {copiedMcp ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                Copy full MCP config
              </button>
              <button
                type="button"
                className="docs-btn docs-btn--primary"
                onClick={() => {
                  if (!agent.newToken) return;
                  setAgentToken(agent.newToken);
                  setSavedForApp(true);
                }}
              >
                {savedForApp ? "Saved for Obscura app" : "Save for Obscura app"}
              </button>
            </div>
          </div>
        )}

        <div className="docs-agent-token-list">
          <div className="docs-agent-token-list-head">
            <h3>Your tokens</h3>
            <button
              type="button"
              className="docs-btn docs-btn--secondary docs-btn--sm"
              disabled={!agent.isConnected || agent.isLoading}
              onClick={() => void agent.refreshTokens().catch((e) => agent.setError(String(e)))}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh
            </button>
          </div>

          {agent.tokens.length === 0 ? (
            <p className="docs-agent-empty">No tokens yet — connect wallet and generate one above.</p>
          ) : (
            <ul className="docs-agent-token-items">
              {agent.tokens.map((t) => (
                <li key={t.id} className={t.active ? "" : "docs-agent-token-item--revoked"}>
                  <div>
                    <span className="docs-agent-token-label">{t.label ?? "Agent token"}</span>
                    <span className="docs-agent-token-meta">
                      {t.active ? "Active" : "Revoked"} · expires {new Date(t.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="docs-agent-token-actions">
                    {t.active && (
                      <>
                        <button
                          type="button"
                          className="docs-btn docs-btn--secondary docs-btn--sm"
                          disabled={busy === t.id}
                          onClick={async () => {
                            setBusy(t.id);
                            try {
                              await agent.regenerateToken(t.id);
                            } catch (e) {
                              agent.setError(e instanceof Error ? e.message : "Regenerate failed");
                            } finally {
                              setBusy(null);
                            }
                          }}
                        >
                          Rotate
                        </button>
                        <button
                          type="button"
                          className="docs-btn docs-agent-btn--danger docs-btn--sm"
                          disabled={busy === t.id}
                          onClick={async () => {
                            setBusy(t.id);
                            try {
                              await agent.revokeToken(t.id);
                            } catch (e) {
                              agent.setError(e instanceof Error ? e.message : "Revoke failed");
                            } finally {
                              setBusy(null);
                            }
                          }}
                          aria-label="Revoke token"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="docs-agent-links">
          <Link to="/docs/mcp" className="docs-btn docs-btn--secondary">
            MCP setup guide
          </Link>
          <Link to="/docs/agents#security" className="docs-btn docs-btn--ghost">
            Security model
          </Link>
        </div>
      </motion.section>

      <DocContent blocks={page.blocks} />
    </div>
  );
}
