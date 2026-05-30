import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { jsonText } from "../shared/privacy-guard.js";
import {
  containsSecretContent,
  isPathDenied,
  resolveRepoRoot,
  safeJoinRepo,
} from "./denylist.js";

const REPO_MAP = {
  contracts: "contracts-hardhat/contracts",
  backend_api: "backend/obscura-api",
  backend_worker: "backend/obscura-worker",
  frontend: "frontend/obscura-os-main",
  sdk: "packages/sdk",
  docs_portal: "docs/portal",
  mcp: "packages/obscura-mcp",
};

const API_ROUTES = [
  { method: "GET", path: "/health", auth: "none", rateLimit: "none" },
  { method: "POST", path: "/relay", auth: "none", rateLimit: "20/min/IP" },
  { method: "GET", path: "/userop-gas-price", auth: "none", rateLimit: "none" },
  { method: "POST", path: "/estimate-userop-gas", auth: "none", rateLimit: "20/min/IP" },
  { method: "GET", path: "/userop-receipt/:userOpHash", auth: "none", rateLimit: "none" },
  { method: "GET", path: "/vapid-public-key", auth: "none", rateLimit: "none" },
  { method: "POST", path: "/subscribe", auth: "wallet_sig_optional", rateLimit: "none" },
  { method: "DELETE", path: "/subscribe", auth: "wallet_sig_optional", rateLimit: "none" },
  { method: "POST", path: "/prefs", auth: "wallet_sig_optional", rateLimit: "none" },
  { method: "GET", path: "/prefs/:wallet", auth: "none", rateLimit: "none" },
  { method: "GET", path: "/reputation/:wallet", auth: "none", rateLimit: "none" },
  { method: "GET", path: "/activity/:wallet", auth: "none", rateLimit: "none" },
  { method: "GET/POST", path: "/debug/push-test", auth: "none", rateLimit: "5/min/IP" },
];

const SANITIZE_RULES = [
  { contract: "ObscuraGovernor", event: "VoteCast", strips: ["support", "weight", "reason"] },
  { contract: "ObscuraTreasury", event: "SpendExecuted", strips: ["amount fields"] },
  { contract: "ObscuraRewards", event: "RewardAccrued/Withdrawn", strips: ["gwei/wei amounts"] },
  { contract: "Credit market events", event: "*", strips: "amount-free by contract design" },
];

const REPUTATION_SIGNALS = {
  pay: [
    "private_payment_sent",
    "private_payment_received",
    "stream_created",
    "stream_cycle_settled",
    "escrow_redeemed",
    "invoice_paid",
    "subscription_consumed",
  ],
  credit: [
    "credit_liquidity_supplied",
    "credit_borrowed",
    "credit_repaid",
    "credit_liquidation_opened",
    "credit_auction_won",
    "credit_vault_deposited",
    "credit_score_updated",
  ],
  vote: [
    "vote_participated",
    "vote_changed",
    "vote_delegated",
    "governance_vote_cast",
    "treasury_spend_attached",
    "treasury_spend_executed",
    "vote_reward_accrued",
    "vote_reward_withdrawn",
  ],
};

async function readSafeFile(repoRoot: string, relativePath: string): Promise<string> {
  if (isPathDenied(relativePath)) {
    throw new Error(`Access denied: ${relativePath}`);
  }
  const full = safeJoinRepo(repoRoot, relativePath);
  const content = await fs.readFile(full, "utf8");
  if (containsSecretContent(content)) {
    throw new Error(`File contains secret patterns: ${relativePath}`);
  }
  return content;
}

export function registerDeveloperTools(server: McpServer): void {
  server.tool("dev_list_repo_map", "High-level Obscura repository map", {}, async () =>
    jsonText({ repoRoot: resolveRepoRoot(), map: REPO_MAP }),
  );

  server.tool(
    "dev_read_file",
    "Read a repo-relative file (denylist enforced)",
    { path: z.string() },
    async ({ path: filePath }) => {
      const repoRoot = resolveRepoRoot();
      const content = await readSafeFile(repoRoot, filePath);
      return jsonText({ path: filePath, content: content.slice(0, 100_000) });
    },
  );

  server.tool(
    "dev_get_deployment_registry",
    "Parse arb-sepolia.json deployment addresses",
    {},
    async () => {
      const repoRoot = resolveRepoRoot();
      const raw = await readSafeFile(
        repoRoot,
        "contracts-hardhat/deployments/arb-sepolia.json",
      );
      return jsonText(JSON.parse(raw));
    },
  );

  server.tool("dev_get_api_routes", "obscura-api route manifest", {}, async () =>
    jsonText(API_ROUTES),
  );

  server.tool("dev_get_sanitize_rules", "Worker activity arg sanitization rules", {}, async () =>
    jsonText(SANITIZE_RULES),
  );

  server.tool("dev_get_reputation_signals", "Reputation signal taxonomy", {}, async () =>
    jsonText(REPUTATION_SIGNALS),
  );

  server.tool(
    "dev_get_supabase_schema",
    "Supabase migration summary",
    {},
    async () => {
      const repoRoot = resolveRepoRoot();
      const files = [
        "backend/obscura-worker/migrations/001_create_activity_tables.sql",
        "backend/obscura-worker/migrations/002_create_reputation_events.sql",
      ];
      const migrations: Record<string, string> = {};
      for (const f of files) {
        migrations[f] = await readSafeFile(repoRoot, f);
      }
      return jsonText(migrations);
    },
  );

  server.tool(
    "dev_get_env_catalog",
    "Non-secret env var names from .env.example files",
    {},
    async () => {
      const repoRoot = resolveRepoRoot();
      const files = [
        "backend/obscura-api/.env.example",
        "backend/obscura-worker/.env.example",
      ];
      const catalog: Record<string, string[]> = {};
      for (const f of files) {
        const content = await readSafeFile(repoRoot, f);
        catalog[f] = content
          .split("\n")
          .filter((line) => line.includes("=") && !line.startsWith("#"))
          .map((line) => line.split("=")[0]?.trim())
          .filter(Boolean) as string[];
      }
      return jsonText(catalog);
    },
  );

  server.tool(
    "dev_get_sdk_module_surface",
    "Public @obscura-fhe/sdk exports summary",
    {},
    async () => {
      const repoRoot = resolveRepoRoot();
      const index = await readSafeFile(repoRoot, "packages/sdk/src/index.ts");
      return jsonText({
        modules: ["pay", "credit", "vote", "reputation", "activity", "notifications"],
        exportsPreview: index.slice(0, 2000),
      });
    },
  );

  server.tool(
    "dev_get_contract_artifact",
    "Read contract ABI from Hardhat artifacts",
    { contractPath: z.string().describe("e.g. credit/ObscuraCreditMarket.sol") },
    async ({ contractPath }) => {
      const repoRoot = resolveRepoRoot();
      const base = contractPath.replace(/\.sol$/, "");
      const artifactPath = path.join(
        "contracts-hardhat/artifacts/contracts",
        `${base}.sol`,
        `${path.basename(base)}.json`,
      );
      const raw = await readSafeFile(repoRoot, artifactPath);
      const artifact = JSON.parse(raw) as { abi: unknown; bytecode?: string };
      return jsonText({
        contractPath,
        abi: artifact.abi,
        bytecodeLength: artifact.bytecode?.length ?? 0,
      });
    },
  );

  server.tool(
    "dev_health_api",
    "Optional live obscura-api health ping",
    {},
    async () => {
      const url = process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com";
      const res = await fetch(`${url}/health`);
      return jsonText(await res.json());
    },
  );

  server.tool(
    "dev_health_worker",
    "Optional live obscura-worker health ping",
    {},
    async () => {
      const url = process.env.OBSCURA_WORKER_URL ?? "https://obscura-worker-0ppj.onrender.com";
      const res = await fetch(`${url}/health`);
      return jsonText(await res.json());
    },
  );
}

export const DEV_RESOURCES: Record<string, () => Promise<string>> = {
  "dev://api/routes": async () => JSON.stringify(API_ROUTES, null, 2),
  "dev://indexer/sanitization": async () => JSON.stringify(SANITIZE_RULES, null, 2),
  "dev://reputation/signals": async () => JSON.stringify(REPUTATION_SIGNALS, null, 2),
  "dev://fhenix/enforcement-rules": async () =>
    [
      "Solidity: FHE.allowThis after every euint64 mutation",
      "Solidity: FHE.select for encrypted branches — never if(ebool)",
      "Frontend: no decryptForView in useEffect",
      "Frontend: await waitForTransactionReceipt before READY",
      "Frontend: include fhe in useCallback deps",
    ].join("\n"),
};

export function registerDeveloperResources(server: McpServer): void {
  for (const [uri, loader] of Object.entries(DEV_RESOURCES)) {
    server.resource(uri, uri, { mimeType: "application/json" }, async () => ({
      contents: [{ uri, mimeType: "application/json", text: await loader() }],
    }));
  }
}

export const DEV_PROMPTS: Record<string, string> = {
  "dev-privacy-invariants": "Never store decrypted amounts. Never auto-decrypt. Sanitize indexer args.",
  "dev-fhe-solidity-checklist": "allowThis after mutations. FHE.select only. No if(ebool).",
  "dev-fhe-frontend-checklist": "No useEffect decrypt. waitForReceipt before READY. fhe in deps.",
  "dev-canonical-contracts": "Use CreditCanonicalPayOcUSDCMarket and ocUSDC_Pay Pay wrapper — not legacy.",
};

export function registerDeveloperPrompts(server: McpServer): void {
  for (const [name, text] of Object.entries(DEV_PROMPTS)) {
    server.prompt(name, text.slice(0, 80), {}, async () => ({
      messages: [{ role: "user", content: { type: "text", text } }],
    }));
  }
}
