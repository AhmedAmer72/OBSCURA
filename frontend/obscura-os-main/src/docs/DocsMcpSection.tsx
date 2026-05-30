import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Copy,
  Check,
  Terminal,
  BookOpen,
  Code2,
  Sparkles,
} from "lucide-react";
import { MCP_VERSION, SDK_VERSION } from "@docs/constants";

const INSTALL_CMD = `npm install @obscura-fhe/mcp@${MCP_VERSION} @obscura-fhe/sdk@${SDK_VERSION}`;

const profiles = [
  {
    id: "user",
    name: "User",
    binary: "obscura-mcp-user",
    desc: "Wallet agents · reads + tx builders",
    color: "#2d8a5e",
  },
  {
    id: "dev",
    name: "Developer",
    binary: "obscura-mcp-dev",
    desc: "Local repo · denylist enforced",
    color: "#3b82f6",
  },
  {
    id: "docs",
    name: "Documentation",
    binary: "obscura-mcp-docs",
    desc: "14-page portal · zero secrets",
    color: "#a855f7",
  },
] as const;

export function DocsMcpQuickAction() {
  const [copied, setCopied] = useState(false);

  const copyInstall = async () => {
    await navigator.clipboard.writeText(INSTALL_CMD);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      className="docs-mcp-spotlight"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="docs-mcp-spotlight-glow" aria-hidden />
      <div className="docs-mcp-spotlight-inner">
        <div className="docs-mcp-spotlight-head">
          <div className="docs-mcp-spotlight-badge">
            <Sparkles className="h-3.5 w-3.5" />
            MCP v{MCP_VERSION} · SDK v{SDK_VERSION}
          </div>
          <h2 className="docs-mcp-spotlight-title">
            Connect any AI agent to Obscura
          </h2>
          <p className="docs-mcp-spotlight-lead">
            Three privacy-first MCP profiles for Cursor, Claude Desktop, VS Code, Windsurf,
            Continue, and any stdio-compatible agent — built on @obscura-fhe/sdk.
          </p>
        </div>

        <div className="docs-mcp-flow" aria-hidden>
          <motion.div
            className="docs-mcp-flow-node"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Bot className="h-5 w-5" />
            <span>Agent</span>
          </motion.div>
          <div className="docs-mcp-flow-line docs-mcp-flow-line--a" />
          <div className="docs-mcp-flow-node docs-mcp-flow-node--mcp">
            <Terminal className="h-5 w-5" />
            <span>MCP</span>
          </div>
          <div className="docs-mcp-flow-line docs-mcp-flow-line--b" />
          <div className="docs-mcp-flow-node">
            <Code2 className="h-5 w-5" />
            <span>SDK</span>
          </div>
          <div className="docs-mcp-flow-line docs-mcp-flow-line--c" />
          <div className="docs-mcp-flow-node docs-mcp-flow-node--chain">
            <span className="docs-mcp-chain-dot" />
            <span>Sepolia</span>
          </div>
        </div>

        <div className="docs-mcp-profiles-row">
          {profiles.map((p, i) => (
            <motion.div
              key={p.id}
              className="docs-mcp-profile-chip"
              style={{ "--chip-accent": p.color } as CSSProperties}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
              whileHover={{ y: -3, transition: { duration: 0.15 } }}
            >
              <span className="docs-mcp-profile-name">{p.name}</span>
              <code className="docs-mcp-profile-bin">{p.binary}</code>
              <span className="docs-mcp-profile-desc">{p.desc}</span>
            </motion.div>
          ))}
        </div>

        <div className="docs-mcp-install-row">
          <div className="docs-mcp-install-code">
            <span className="docs-mcp-install-prompt">$</span>
            <code>{INSTALL_CMD}</code>
            <button
              type="button"
              className="docs-mcp-copy-btn"
              onClick={copyInstall}
              aria-label="Copy install command"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <div className="docs-mcp-spotlight-actions">
            <Link to="/docs/mcp" className="docs-btn docs-btn--primary">
              Full IDE setup <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/docs/mcp#ide-setup" className="docs-btn docs-btn--secondary">
              <BookOpen className="h-4 w-4" /> Cursor · Claude · VS Code
            </Link>
            <a
              href="https://www.npmjs.com/package/@obscura-fhe/mcp"
              target="_blank"
              rel="noopener noreferrer"
              className="docs-btn docs-btn--ghost"
            >
              npm @obscura-fhe/mcp
            </a>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

export function DocsMcpPageHero() {
  return (
    <motion.div
      className="docs-mcp-page-hero"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="docs-mcp-page-hero-grid" aria-hidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.span
            key={i}
            className="docs-mcp-hero-pulse"
            animate={{ opacity: [0.15, 0.55, 0.15], scale: [0.92, 1, 0.92] }}
            transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.35 }}
          />
        ))}
      </div>
      <div className="docs-mcp-page-hero-content">
        <span className="docs-mcp-page-hero-tag">
          Model Context Protocol · @obscura-fhe/mcp v{MCP_VERSION}
        </span>
        <p className="docs-mcp-page-hero-sub">
          Privacy-first agent tooling for Pay, Credit, and Vote — wraps SDK v{SDK_VERSION}.
          Never decrypts FHE. Never holds private keys.
        </p>
      </div>
    </motion.div>
  );
}
