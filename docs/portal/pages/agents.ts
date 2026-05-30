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
      text: "User MCP tools that access wallet-scoped data require OBSCURA_AGENT_TOKEN. The token is resolved server-side to your wallet — agents cannot pass arbitrary addresses for activity or reputation reads.",
    },
    {
      type: "heading",
      level: 2,
      text: "Token lifecycle",
      id: "lifecycle",
    },
    {
      type: "steps",
      items: [
        { title: "Connect wallet", description: "Use the panel above on Arbitrum Sepolia" },
        { title: "Sign EIP-191 message", description: "Proves ownership — no on-chain tx, no gas" },
        { title: "Receive token once", description: "obsc_at_… prefix — store in password manager or MCP env" },
        { title: "Configure MCP", description: "Add OBSCURA_AGENT_TOKEN to obscura-user mcpServers env" },
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
        ["Permissions", "activity:read · reputation:read · balance:read"],
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
const activity = await sdk.activity.listAuthenticated({ pageSize: 10 });`,
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
  ],
};
