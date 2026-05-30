import type { DocPage } from "../types";

export const firstAppPage: DocPage = {
  slug: "first-app",
  title: "Build your first app",
  description: "Reputation dashboard, activity timeline, and a governance delegate transaction.",
  category: "Getting started",
  blocks: [
    {
      type: "paragraph",
      text: "A minimal Node or browser app: display reputation tier, list recent activity, and prepare a Vote delegate ContractCall.",
    },
    {
      type: "code",
      language: "bash",
      code: `mkdir obscura-demo && cd obscura-demo
npm init -y
npm install @obscura-fhe/sdk viem dotenv`,
    },
    {
      type: "code",
      language: "typescript",
      title: "Reputation + activity",
      code: `import { ObscuraSDK } from "@obscura-fhe/sdk";
import "dotenv/config";

const sdk = ObscuraSDK.create({
  apiUrl: process.env.OBSCURA_API_URL,
});
const wallet = process.argv[2] as \`0x\${string}\`;

const summary = await sdk.reputation.getSummary(wallet);
const { items } = await sdk.activity.listForWallet(wallet, { pageSize: 10 });

console.log(summary.tier, summary.totalCappedWeight);
items.forEach((r) => console.log(r.event_name, r.tx_hash.slice(0, 10)));`,
    },
    {
      type: "code",
      language: "typescript",
      title: "Delegate transaction builder",
      code: `const call = sdk.vote.buildDelegate("0xDelegatee...");
console.log(sdk.encodeCall(call));`,
    },
  ],
};

export const sdkOnboardingPage: DocPage = {
  slug: "sdk-onboarding",
  title: "SDK onboarding",
  description: "Configure ObscuraSDK, wire viem clients, and inject FHE for encrypted writes.",
  category: "Getting started",
  blocks: [
    {
      type: "callout",
      variant: "info",
      title: "Module requirements",
      text: "reputation · notifications · activity — Obscura API only, no wallet. pay · credit · vote reads — RPC (421614). Encrypted writes — FheProvider. sendCall — walletClient.",
    },
    {
      type: "visual",
      variant: "sdk-modules",
    },
    {
      type: "heading",
      level: 2,
      text: "Full configuration",
      id: "config",
    },
    {
      type: "code",
      language: "typescript",
      title: "ObscuraSDK.create()",
      code: `import { ObscuraSDK } from "@obscura-fhe/sdk";
import { createPublicClient, createWalletClient, http, custom } from "viem";
import { arbitrumSepolia } from "viem/chains";

const rpcUrl = process.env.ARB_SEPOLIA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc";

const publicClient = createPublicClient({
  chain: arbitrumSepolia,
  transport: http(rpcUrl),
});

// Browser: custom(window.ethereum) · Node: http(rpcUrl) + account
const walletClient = createWalletClient({
  chain: arbitrumSepolia,
  transport: http(rpcUrl),
});

const sdk = ObscuraSDK.create({
  chainId: 421614,
  rpcUrl,
  apiUrl: process.env.OBSCURA_API_URL,
  publicClient,
  walletClient,              // optional — enables sendCall()
  fhe: cofheAdapter,        // optional — enables encryptUint64
});`,
    },
    {
      type: "heading",
      level: 2,
      text: "TypeScript (verbatimModuleSyntax)",
      id: "typescript",
    },
    {
      type: "code",
      language: "json",
      title: "Recommended tsconfig.json",
      code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "skipLibCheck": true,
    "verbatimModuleSyntax": true
  }
}`,
    },
    {
      type: "callout",
      variant: "warning",
      title: "Type-only imports",
      text: "With verbatimModuleSyntax: true, import types with import type { FheProvider, ReputationSummary }. Mixing value + type imports causes TS1363. Use import type or set verbatimModuleSyntax: false.",
    },
    {
      type: "heading",
      level: 2,
      text: "Activity via API",
      id: "activity-api",
    },
    {
      type: "code",
      language: "bash",
      title: "Environment (optional)",
      code: `OBSCURA_API_URL=https://obscura-api-n62v.onrender.com   # default if omitted`,
    },
    {
      type: "code",
      language: "typescript",
      title: "Wallet-scoped feed",
      code: `const feed = await sdk.activity.listForWallet(wallet, { filter: "credit", pageSize: 20 });`,
    },
    {
      type: "heading",
      level: 2,
      text: "FHE adapter",
      id: "fhe",
    },
    {
      type: "code",
      language: "typescript",
      title: "FheProvider interface",
      code: `import type { FheProvider } from "@obscura-fhe/sdk";

export const cofheAdapter: FheProvider = {
  async encryptUint64(value, { contractAddress }) {
    // Wrap @cofhe/sdk — user must trigger encrypt (never on mount)
    return { ctHash, securityZone, utype, signature };
  },
};`,
    },
    {
      type: "heading",
      level: 2,
      text: "Common patterns",
      id: "patterns",
    },
    {
      type: "steps",
      items: [
        { title: "Create agent token", description: "EIP-191 proof at /docs/agents → OBSCURA_AGENT_TOKEN", href: "/docs/agents" },
        { title: "Read-only dashboard", description: "Authenticated reputation + activity via agent token", href: "/docs/first-app" },
        { title: "Tx builder + external signer", description: "encodeCall() → pass calldata to any wallet", href: "/docs/quick-start" },
        { title: "Full write flow", description: "FheProvider + walletClient + sendCall()", href: "/docs/sdk" },
        { title: "Pre-encrypted inputs", description: "Pass InEuint64 directly to skip adapter at build time", href: "/docs/sdk" },
      ],
    },
    {
      type: "callout",
      variant: "tip",
      title: "MCP servers",
      text: "Official @obscura-fhe/mcp packages three profiles (User, Developer, Documentation). User MCP requires OBSCURA_AGENT_TOKEN for wallet-scoped reads — create at /docs/agents. See /docs/mcp for IDE setup.",
    },
  ],
};
