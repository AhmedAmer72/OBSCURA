import type { DocPage } from "../types";
import { SDK_VERSION, MCP_VERSION } from "../constants";
import { mcpConfigJson } from "../mcp-config";

export const mcpPage: DocPage = {
  slug: "mcp",
  title: "MCP servers",
  description: `Official Model Context Protocol servers (@obscura-fhe/mcp v${MCP_VERSION}) — User, Developer, and Documentation profiles for Cursor, Claude, VS Code, and any stdio agent.`,
  category: "Reference",
  keywords: ["mcp", "cursor", "claude", "vscode", "windsurf", "continue", "agents", "automation"],
  blocks: [
    {
      type: "visual",
      variant: "mcp-profiles",
    },
    {
      type: "callout",
      variant: "success",
      title: `Published on npm · SDK v${SDK_VERSION} · MCP v${MCP_VERSION}`,
      text: "Three isolated stdio servers wrap @obscura-fhe/sdk — no duplicate protocol logic. User MCP never decrypts FHE values or holds private keys.",
    },
    {
      type: "heading",
      level: 2,
      text: "Install",
      id: "install",
    },
    {
      type: "code",
      language: "bash",
      title: "Project setup",
      code: `# In your app or agent workspace
npm install @obscura-fhe/mcp@${MCP_VERSION} @obscura-fhe/sdk@${SDK_VERSION}

# Binaries (after install)
# obscura-mcp-user   — wallet-scoped agent tools
# obscura-mcp-dev    — local repo inspection
# obscura-mcp-docs   — bundled docs portal (14 pages)`,
    },
    {
      type: "visual",
      variant: "mcp-agent-flow",
    },
    {
      type: "heading",
      level: 2,
      text: "IDE & agent setup",
      id: "ide-setup",
    },
    {
      type: "paragraph",
      text: "All IDEs use the same mcpServers JSON shape. Install the packages in your project first, then point your agent at node + dist/*.js (works on Windows, macOS, and Linux).",
    },
    {
      type: "visual",
      variant: "mcp-ide-setup",
    },
    {
      type: "heading",
      level: 3,
      text: "Cursor",
      id: "cursor",
    },
    {
      type: "steps",
      items: [
        { title: "Install packages", description: "npm install @obscura-fhe/mcp @obscura-fhe/sdk in your project root" },
        { title: "Create config", description: "Add .cursor/mcp.json (project) or ~/.cursor/mcp.json (global)" },
        { title: "Restart Cursor", description: "Settings → MCP → verify obscura-* servers show green" },
      ],
    },
    {
      type: "code",
      language: "json",
      title: ".cursor/mcp.json",
      code: mcpConfigJson(),
    },
    {
      type: "heading",
      level: 3,
      text: "Claude Desktop",
      id: "claude",
    },
    {
      type: "steps",
      items: [
        { title: "Install packages", description: "In a persistent project folder (e.g. ~/obscura-agent)" },
        { title: "Edit config", description: "macOS: ~/Library/Application Support/Claude/claude_desktop_config.json · Windows: %APPDATA%\\Claude\\claude_desktop_config.json" },
        { title: "Merge mcpServers", description: "Add obscura-* entries under top-level mcpServers" },
        { title: "Restart Claude", description: "Fully quit and reopen — hammer icon shows connected tools" },
      ],
    },
    {
      type: "code",
      language: "json",
      title: "claude_desktop_config.json",
      code: mcpConfigJson(),
    },
    {
      type: "heading",
      level: 3,
      text: "VS Code (GitHub Copilot MCP)",
      id: "vscode",
    },
    {
      type: "steps",
      items: [
        { title: "Enable MCP", description: "VS Code 1.99+ with GitHub Copilot — MCP support in workspace settings" },
        { title: "Create config", description: ".vscode/mcp.json in your project root" },
        { title: "Install packages", description: "npm install in the same workspace folder" },
        { title: "Reload window", description: "Command Palette → Developer: Reload Window" },
      ],
    },
    {
      type: "code",
      language: "json",
      title: ".vscode/mcp.json",
      code: mcpConfigJson(),
    },
    {
      type: "heading",
      level: 3,
      text: "Windsurf",
      id: "windsurf",
    },
    {
      type: "paragraph",
      text: "Windsurf uses the same MCP JSON as Cursor. Add to ~/.codeium/windsurf/mcp_config.json (global) or .windsurf/mcp.json (workspace). Use node + dist paths after npm install.",
    },
    {
      type: "code",
      language: "json",
      title: "mcp_config.json",
      code: mcpConfigJson(),
    },
    {
      type: "heading",
      level: 3,
      text: "Continue.dev",
      id: "continue",
    },
    {
      type: "paragraph",
      text: "Add mcpServers to ~/.continue/config.json (merge with existing config). Same command/args/env shape as Cursor.",
    },
    {
      type: "code",
      language: "json",
      title: "~/.continue/config.json (fragment)",
      code: mcpConfigJson(),
    },
    {
      type: "heading",
      level: 3,
      text: "Cline / any stdio agent",
      id: "generic",
    },
    {
      type: "paragraph",
      text: "Any MCP client that supports stdio transport can run one profile at a time. Use node with the absolute path to dist/*.js if your cwd differs from the install folder.",
    },
    {
      type: "code",
      language: "bash",
      title: "Documentation MCP (no secrets)",
      code: `node ./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-docs.js

# User MCP (API only — no Supabase keys)
OBSCURA_API_URL=https://obscura-api-n62v.onrender.com \\
  node ./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js

# Developer MCP (local repo)
OBSCURA_REPO_ROOT=/path/to/Obscura \\
  node ./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-dev.js`,
    },
    {
      type: "callout",
      variant: "warning",
      title: "Agent token required",
      text: "Wallet-scoped tools (activity, reputation, balance handle) require OBSCURA_AGENT_TOKEN. Create one at /docs/agents before configuring User MCP.",
    },
    {
      type: "heading",
      level: 2,
      text: "Agent authentication",
      id: "agent-auth",
    },
    {
      type: "paragraph",
      text: "User MCP resolves wallet identity from Authorization: Bearer obsc_at_… — no arbitrary wallet parameters. Token creation requires EIP-191 wallet signature at /docs/agents.",
    },
    {
      type: "link-grid",
      items: [
        { label: "Create Agent Token", href: "/docs/agents", description: "Connect wallet · sign · copy token once" },
        { label: "Agent security model", href: "/docs/agents#security", description: "Hash storage · permissions · revocation" },
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Trust boundary",
      text: "User MCP never talks to Supabase. Activity and reputation reads go through Obscura API with bearer agent tokens (service role server-side). End users need OBSCURA_API_URL and OBSCURA_AGENT_TOKEN.",
    },
    {
      type: "heading",
      level: 2,
      text: "User MCP tools",
      id: "user-tools",
    },
    {
      type: "table",
      headers: ["Tool", "SDK mapping"],
      rows: [
        ["user_health_api", "API liveness"],
        ["user_get_chain_config", "Public endpoints"],
        ["user_get_agent_identity", "Resolve token → wallet"],
        ["pay_get_encrypted_balance_handle", "Authenticated wallet — opaque ctHash"],
        ["pay_build_shield / unshield / transfer", "PayModule tx builders"],
        ["credit_get_market_utilization", "CreditModule.getMarketUtilization()"],
        ["credit_build_supply_collateral / borrow / repay", "CreditModule tx builders"],
        ["vote_get_proposal_count / get_proposal", "VoteModule reads"],
        ["vote_build_cast_vote / delegate", "VoteModule tx builders"],
        ["reputation_get_summary", "GET /agent/reputation (Bearer token)"],
        ["activity_list_for_wallet", "GET /agent/activity (Bearer token, max 25 rows)"],
        ["user_encode_call", "encodeCall() for external signers"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Environment variables",
      id: "env",
    },
    {
      type: "table",
      headers: ["Variable", "Profile", "Required"],
      rows: [
        ["OBSCURA_API_URL", "User", "Default: production obscura-api"],
        ["OBSCURA_AGENT_TOKEN", "User", "Required — create at /docs/agents"],
        ["OBSCURA_RPC_URL", "User", "Optional Arbitrum Sepolia RPC override"],
        ["OBSCURA_REPO_ROOT", "Developer", "Path to Obscura clone"],
        ["OBSCURA_PRIVACY_MODE", "User", "standard | strict"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "CoFHE boundary",
      id: "cofhe",
    },
    {
      type: "list",
      ordered: true,
      items: [
        "Browser CoFHE SDK encrypts amounts → InEuint64",
        "Pass pre-encrypted InEuint64 to pay_build_* / credit_build_* / vote_build_cast_vote",
        "MCP returns unsigned ContractCall + eoaFheWarning",
        "User signs with EOA — smart accounts cannot forward InEuint64",
        "Reveal balances only in Obscura UI — never via MCP",
      ],
    },
    {
      type: "link-grid",
      items: [
        { label: "SDK reference", href: "/docs/sdk", description: `@obscura-fhe/sdk v${SDK_VERSION}` },
        { label: "Privacy model", href: "/docs/privacy", description: "Encrypted vs public surfaces" },
        { label: "Architecture", href: "/docs/architecture", description: "Five-tier system design" },
        { label: "Agent access", href: "/docs/agents", description: "Token creation & security" },
        { label: "npm @obscura-fhe/mcp", href: "https://www.npmjs.com/package/@obscura-fhe/mcp", description: `v${MCP_VERSION}` },
        { label: "npm @obscura-fhe/sdk", href: "https://www.npmjs.com/package/@obscura-fhe/sdk", description: `v${SDK_VERSION}` },
      ],
    },
  ],
};
