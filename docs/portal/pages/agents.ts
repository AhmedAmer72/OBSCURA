import type { DocPage } from "../types";
import { MCP_VERSION, SDK_VERSION } from "../constants";
import { mcpConfigJsonWithAgentToken } from "../mcp-config";

export const agentsPage: DocPage = {
  slug: "agents",
  title: "Agent access & tokens",
  description:
    "Privacy-first MCP authentication — prove wallet ownership with EIP-191, issue bearer tokens, and bind agents to your wallet identity.",
  category: "Reference",
  keywords: ["agent", "token", "mcp", "authentication", "bearer", "eip-191", "security"],
  blocks: [
    {
      type: "callout",
      variant: "info",
      title: "Encrypted by default · Revealed by choice",
      text: "Agent tokens authenticate wallet-scoped metadata reads (activity, reputation, balance handles). They never decrypt FHE state and cannot bypass the reveal flow.",
    },
    {
      type: "heading",
      level: 2,
      text: "Agent authentication",
      id: "agent-auth",
    },
    {
      type: "paragraph",
      text: "User MCP tools that access wallet-scoped data require OBSCURA_AGENT_TOKEN. The Obscura web app uses a separate wallet signature session — normal users never need an agent token.",
    },
    {
      type: "heading",
      level: 2,
      text: "Token lifecycle & expiry",
      id: "expiry",
    },
    {
      type: "table",
      headers: ["Property", "Value"],
      rows: [
        ["Format", "obsc_at_ + base64url (shown once at creation)"],
        ["Storage", "SHA-256 hash only in obscura_agent_tokens"],
        ["Default TTL", "90 days (AGENT_TOKEN_TTL_DAYS env on API)"],
        ["User-selectable TTL", "Not yet — fixed 90d default; 7d/30d/90d/never planned"],
        ["Server enforcement", "expires_at checked on every Bearer lookup; expired → 401"],
        ["Revocation", "revoked_at set server-side; immediate invalidation"],
        ["Max active tokens", "5 per wallet"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Permission scopes",
      id: "scopes",
    },
    {
      type: "paragraph",
      text: "Scopes are stored on each token and enforced on authenticated API routes. Four scopes are implemented today; pay, credit, and vote read scopes are planned.",
    },
    {
      type: "table",
      headers: ["Scope", "Status", "Enforced on"],
      rows: [
        ["activity:read", "Implemented", "GET /agent/activity"],
        ["reputation:read", "Implemented", "GET /agent/reputation"],
        ["balance:read", "Implemented", "Encrypted balance handle routes"],
        ["notifications:read", "Implemented", "GET /agent/prefs"],
        ["pay:read", "Planned", "Pay metadata, invoice summaries"],
        ["credit:read", "Planned", "Position summaries without FHE decrypt"],
        ["vote:read", "Planned", "Delegation + participation metadata"],
      ],
    },
    {
      type: "callout",
      variant: "info",
      title: "Legacy wallet paths",
      text: "GET /prefs/:wallet, /activity/:wallet, and /reputation/:wallet require a Bearer token matching the path wallet when AGENT_AUTH_LEGACY_PUBLIC=false. Prefer GET /agent/* routes.",
    },
    {
      type: "heading",
      level: 2,
      text: "Setup steps",
      id: "lifecycle",
    },
    {
      type: "steps",
      items: [
        { title: "Connect wallet", description: "Use the panel above on Arbitrum Sepolia" },
        { title: "Sign EIP-191 message", description: "Proves ownership — no on-chain tx, no gas" },
        { title: "Receive token once", description: "obsc_at_… prefix — store in password manager or MCP env" },
        { title: "Configure MCP", description: "Add OBSCURA_AGENT_TOKEN to obscura-user mcpServers env (Cursor, Claude, VS Code)" },
        { title: "Rotate or revoke", description: "Compromised token? Revoke immediately and regenerate" },
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "MCP configuration",
      id: "mcp-config",
    },
    {
      type: "code",
      language: "json",
      title: ".cursor/mcp.json (User profile)",
      code: mcpConfigJsonWithAgentToken(),
    },
    {
      type: "heading",
      level: 2,
      text: "Security model",
      id: "security",
    },
    {
      type: "table",
      headers: ["Control", "Guarantee"],
      rows: [
        ["Storage", "Only SHA-256 hash stored — never plaintext token"],
        ["Scope", "Token bound to one wallet; API rejects cross-wallet reads"],
        ["Permissions", "activity:read · reputation:read · balance:read · notifications:read"],
        ["Expiry", "Default 90 days — rotate before expiry"],
        ["FHE", "No decrypt, permit, or reveal tools in User MCP"],
        ["Legacy API", "Set AGENT_AUTH_LEGACY_PUBLIC=false to require tokens on all wallet paths"],
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "SDK usage",
      id: "sdk",
    },
    {
      type: "code",
      language: "typescript",
      title: "Authenticated reads",
      code: `import { ObscuraSDK } from "@obscura-fhe/sdk";

const sdk = ObscuraSDK.create({
  agentToken: process.env.OBSCURA_AGENT_TOKEN,
});

const reputation = await sdk.reputation.getAuthenticatedSummary();
const activity = await sdk.activity.listAuthenticated({ pageSize: 10 });
const prefs = await sdk.notifications.getAuthenticatedPrefs();`,
    },
    {
      type: "heading",
      level: 2,
      text: "Revocation & rotation",
      id: "revocation",
    },
    {
      type: "list",
      items: [
        "Revoke — immediately invalidates the token hash server-side",
        "Regenerate — revokes old token and issues a new one (shown once)",
        "Max 5 active tokens per wallet — revoke unused tokens",
        `SDK v${SDK_VERSION} · MCP v${MCP_VERSION}`,
      ],
    },
    {
      type: "heading",
      level: 2,
      text: "Production readiness checklist",
      id: "production-checklist",
    },
    {
      type: "table",
      headers: ["Check", "Status"],
      rows: [
        ["AGENT_AUTH_LEGACY_PUBLIC=false on production API", "Required — legacy wallet paths return 401 without Bearer"],
        ["OBSCURA_AGENT_TOKEN in User MCP env", "Required for activity, reputation, balance handle tools"],
        ["Token saved in Obscura app (Save for Obscura app)", "Not required — app uses wallet signature session"],
        ["Rotate token if exposed in chat or logs", "Best practice"],
        ["Supabase RLS migration 004 applied", "Run 004_tighten_rls_agent_auth.sql in Supabase Dashboard"],
        ["GET /agent/prefs live on API", "Done — legacy /prefs/:wallet requires Bearer when legacy=false"],
        ["User-selectable token TTL (7d / 30d / 90d / never)", "Future — fixed 90d default today"],
      ],
    },
  ],
};
