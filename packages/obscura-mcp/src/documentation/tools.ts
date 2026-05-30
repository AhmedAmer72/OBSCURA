import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { jsonText } from "../shared/privacy-guard.js";
import {
  getDocNav,
  getDocPages,
  buildSearchIndex,
  extractTableFromPage,
  findCodeBlock,
  getPage,
} from "./portal.js";
import type { DocBlock } from "./portal-types.js";

export function registerDocumentationTools(server: McpServer): void {
  server.tool("docs_list_pages", "List docs portal navigation tree and slugs", {}, async () =>
    jsonText({ navigation: getDocNav(), slugs: getDocPages().map((p) => p.slug) }),
  );

  server.tool(
    "docs_get_page",
    "Get full docs portal page content by slug",
    { slug: z.string() },
    async ({ slug }) => {
      const page = getPage(slug);
      if (!page) throw new Error(`Unknown docs slug: ${slug}`);
      return jsonText(page);
    },
  );

  server.tool(
    "docs_search",
    "Search docs portal pages",
    { query: z.string() },
    async ({ query }) => {
      const q = query.toLowerCase();
      const index = buildSearchIndex();
      const matches = index.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description.toLowerCase().includes(q) ||
          e.excerpt.toLowerCase().includes(q),
      );
      return jsonText(matches);
    },
  );

  server.tool("docs_get_endpoint_registry", "Production deployment URLs from docs", {}, async () => {
    const block = findCodeBlock("architecture", "Deployment");
    return jsonText({
      source: "architecture",
      endpoints: block?.type === "code" ? block.code : null,
    });
  });

  server.tool("docs_get_sdk_install", "SDK install commands from docs", {}, async () => {
    const page = getPage("sdk-onboarding") ?? getPage("sdk");
    const code = page?.blocks.find(
      (b: DocBlock) => b.type === "code" && b.code.includes("npm install"),
    );
    return jsonText({ install: code && code.type === "code" ? code.code : "npm install @obscura-fhe/sdk viem" });
  });

  server.tool("docs_get_privacy_summary", "Privacy guarantees table from docs", {}, async () => {
    const table = extractTableFromPage("privacy", "guarantees");
    return jsonText(table);
  });

  server.tool("docs_get_reputation_tiers", "Reputation tier info from docs", {}, async () => {
    const page = getPage("reputation");
    return jsonText(page);
  });

  server.tool("docs_get_activity_filters", "Activity system docs", {}, async () => {
    const page = getPage("activity");
    return jsonText(page);
  });

  server.tool("docs_get_notification_routes", "Notification API routes from docs", {}, async () => {
    const page = getPage("notifications");
    return jsonText(page);
  });

  server.tool("docs_get_cofhe_flow", "CoFHE lifecycle from privacy docs", {}, async () => {
    const page = getPage("privacy");
    const visual = page?.blocks.find(
      (b: DocBlock) => b.type === "visual" && b.variant === "cofhe-lifecycle",
    );
    return jsonText({ page: "privacy", visual: visual?.type === "visual" ? visual.variant : "cofhe-lifecycle" });
  });

  server.tool(
    "docs_get_contract_addresses",
    "Contract addresses referenced in product docs",
    {},
    async () => {
      const pay = getPage("pay");
      const credit = getPage("credit");
      const vote = getPage("vote");
      return jsonText({
        pay: pay?.blocks.filter((b: DocBlock) => b.type === "code" || b.type === "table"),
        credit: credit?.blocks.filter((b: DocBlock) => b.type === "code" || b.type === "table"),
        vote: vote?.blocks.filter((b: DocBlock) => b.type === "code" || b.type === "table"),
      });
    },
  );
}

export function registerDocumentationResources(server: McpServer): void {
  server.resource(
    "docs://portal/navigation",
    "docs://portal/navigation",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "docs://portal/navigation",
          mimeType: "application/json",
          text: JSON.stringify(getDocNav(), null, 2),
        },
      ],
    }),
  );

  server.resource(
    "docs://portal/search-index",
    "docs://portal/search-index",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "docs://portal/search-index",
          mimeType: "application/json",
          text: JSON.stringify(buildSearchIndex(), null, 2),
        },
      ],
    }),
  );

  server.resource(
    "docs://links/production",
    "docs://links/production",
    { mimeType: "application/json" },
    async () => ({
      contents: [
        {
          uri: "docs://links/production",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              frontend: "https://obscuraos.online",
              docs: "https://obscuraos.online/docs",
              api: "https://obscura-api-n62v.onrender.com",
              worker: "https://obscura-worker-0ppj.onrender.com",
              supabase: "https://quoovjkjwgtdqwdofubh.supabase.co",
              chainId: 421614,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );
}

export const DOCS_PROMPTS: Record<string, string> = {
  "docs-onboard-developer": "Path: ecosystem → quick-start → sdk-onboarding → first-app",
  "docs-explain-privacy-model": "Encrypted vs public vs user-triggered reveal. See /docs/privacy",
  "docs-explain-pay-modes": "Private Mode: ocUSDC + EOA. Public Mode: USDC + passkey AA. No FHE via AA.",
  "docs-explain-credit-beta": "Canonical Pay-backed ocUSDC market. Two-step CoFHE supply/borrow.",
  "docs-explain-vote-dual-track": "Track A: ObscuraVote FHE. Track B: ObscuraGovernor executable.",
  "docs-sdk-integration": "Inject FheProvider from CoFHE SDK. Use encodeCall + external signer.",
};

export function registerDocumentationPrompts(server: McpServer): void {
  for (const [name, text] of Object.entries(DOCS_PROMPTS)) {
    server.prompt(name, text.slice(0, 80), {}, async () => ({
      messages: [{ role: "user", content: { type: "text", text } }],
    }));
  }
}
