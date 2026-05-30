import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { DocContent } from "./DocContent";
import { useAgentTokens } from "@/hooks/useAgentTokens";

interface AgentAccessPageProps {
  page: DocPage;
}

export function AgentAccessPage({ page }: AgentAccessPageProps) {
  const agent = useAgentTokens();
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  const copyToken = async () => {
    if (!agent.newToken) return;
    await navigator.clipboard.writeText(agent.newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpEnvSnippet = agent.newToken
    ? `"OBSCURA_AGENT_TOKEN": "${agent.newToken}"`
    : `"OBSCURA_AGENT_TOKEN": "obsc_at_…"`;

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
            <Button
              type="button"
              size="sm"
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
            </Button>
          </li>
          <li className={agent.newToken ? "docs-agent-step--active" : ""}>
            <Bot className="h-4 w-4" />
            <span>Add to MCP config</span>
            <code className="docs-agent-env">{mcpEnvSnippet}</code>
          </li>
        </ol>

        {agent.error && <p className="docs-agent-error">{agent.error}</p>}

        {agent.newToken && (
          <div className="docs-agent-token-reveal">
            <p className="docs-agent-token-warning">
              Copy this token now — it will not be shown again.
            </p>
            <div className="docs-agent-token-row">
              <code>{agent.newToken}</code>
              <button type="button" className="docs-mcp-copy-btn" onClick={copyToken} aria-label="Copy token">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="docs-agent-token-list">
          <div className="docs-agent-token-list-head">
            <h3>Your tokens</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={!agent.isConnected || agent.isLoading}
              onClick={() => void agent.refreshTokens().catch((e) => agent.setError(String(e)))}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
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
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
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
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
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
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
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
          <Link to="/docs/mcp#agent-auth" className="docs-btn docs-btn--ghost">
            Security model
          </Link>
        </div>
      </motion.section>

      <DocContent blocks={page.blocks} />
    </div>
  );
}
