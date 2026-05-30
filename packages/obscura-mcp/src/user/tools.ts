import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  DEFAULT_API_URL,
  DEFAULT_ADDRESSES,
} from "@obscura-fhe/sdk";
import {
  ENCRYPTED_HANDLE_DISPLAY,
  jsonText,
  MAX_ACTIVITY_PAGE_SIZE,
  parseInEuint64,
  serializeContractCall,
} from "../shared/privacy-guard.js";
import { readLimiter, writePrepLimiter } from "../shared/rate-limit.js";
import { resolveAgentContext, requirePermission } from "./agent-context.js";
import { createUserSdk, getPublicChainConfig } from "./sdk-adapter.js";

const walletSchema = z.string().regex(/^0x[0-9a-fA-F]{40}$/);
const inEuint64Schema = z.object({
  ctHash: z.string(),
  securityZone: z.number().int(),
  utype: z.number().int(),
  signature: z.string(),
});

function rateLimitRead(key: string) {
  if (!readLimiter.tryConsume(key)) throw new Error("Rate limit exceeded (reads)");
}

function rateLimitWritePrep(key: string) {
  if (!writePrepLimiter.tryConsume(key)) throw new Error("Rate limit exceeded (write prep)");
}

export function registerUserTools(server: McpServer): void {
  const sdk = createUserSdk();

  server.tool(
    "user_health_api",
    "Check obscura-api liveness (public)",
    {},
    async () => {
      rateLimitRead("health");
      const res = await fetch(`${process.env.OBSCURA_API_URL ?? DEFAULT_API_URL}/health`);
      const data = await res.json();
      return jsonText(data);
    },
  );

  server.tool(
    "user_get_chain_config",
    "Public chain and service endpoints (no secrets)",
    {},
    async () => jsonText(getPublicChainConfig()),
  );

  server.tool(
    "user_get_agent_identity",
    "Resolve authenticated wallet from OBSCURA_AGENT_TOKEN (no arbitrary wallet lookup)",
    {},
    async () => {
      rateLimitRead("agent_identity");
      const ctx = await resolveAgentContext();
      return jsonText({
        wallet: ctx.wallet,
        permissions: ctx.permissions,
        expiresAt: ctx.expiresAt,
        tokenId: ctx.tokenId,
      });
    },
  );

  server.tool(
    "pay_get_encrypted_balance_handle",
    "Read opaque encrypted balance handle for authenticated wallet (never decrypted)",
    {},
    async () => {
      const ctx = await resolveAgentContext();
      requirePermission("balance:read");
      rateLimitRead(`balance:${ctx.wallet}`);
      const ctHash = await sdk.pay.getShieldedBalance(ctx.wallet as `0x${string}`);
      return jsonText({
        wallet: ctx.wallet,
        encryptedBalanceHandle: `0x${ctHash.toString(16).padStart(64, "0")}`,
        displayHint: ENCRYPTED_HANDLE_DISPLAY,
      });
    },
  );

  server.tool(
    "pay_build_shield",
    "Build unsigned shield tx — requires pre-encrypted InEuint64 from client CoFHE",
    {
      amount: z.string().describe("Plaintext amount (base units) for calldata"),
      encryptedAmount: inEuint64Schema,
    },
    async ({ amount, encryptedAmount }) => {
      rateLimitWritePrep("pay_shield");
      const call = await sdk.pay.buildShield(BigInt(amount), parseInEuint64(encryptedAmount));
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "pay_build_unshield",
    "Build unsigned unshield tx — requires pre-encrypted InEuint64",
    {
      to: walletSchema,
      amount: z.string(),
      encryptedAmount: inEuint64Schema,
    },
    async ({ to, amount, encryptedAmount }) => {
      rateLimitWritePrep("pay_unshield");
      const call = await sdk.pay.buildUnshield(
        to as `0x${string}`,
        BigInt(amount),
        parseInEuint64(encryptedAmount),
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "pay_build_transfer",
    "Build unsigned confidential transfer — requires pre-encrypted InEuint64",
    {
      to: walletSchema,
      amount: z.string(),
      encryptedAmount: inEuint64Schema,
    },
    async ({ to, amount, encryptedAmount }) => {
      rateLimitWritePrep("pay_transfer");
      const call = await sdk.pay.buildTransfer(
        to as `0x${string}`,
        BigInt(amount),
        parseInEuint64(encryptedAmount),
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "credit_get_market_utilization",
    "Public credit pool utilization and TVL aggregates",
    { marketAddress: walletSchema.optional() },
    async ({ marketAddress }) => {
      rateLimitRead("credit_util");
      const util = await sdk.credit.getMarketUtilization(
        marketAddress as `0x${string}` | undefined,
      );
      return jsonText(util);
    },
  );

  server.tool(
    "credit_build_supply_collateral",
    "Build unsigned supplyCollateral tx — pre-encrypted InEuint64 required",
    {
      amount: z.string(),
      encryptedAmount: inEuint64Schema,
      marketAddress: walletSchema.optional(),
    },
    async ({ amount, encryptedAmount, marketAddress }) => {
      rateLimitWritePrep("credit_supply");
      const call = await sdk.credit.buildSupplyCollateral(
        BigInt(amount),
        parseInEuint64(encryptedAmount),
        marketAddress as `0x${string}` | undefined,
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "credit_build_borrow",
    "Build unsigned borrow tx — pre-encrypted InEuint64 required",
    {
      amount: z.string(),
      encryptedAmount: inEuint64Schema,
      marketAddress: walletSchema.optional(),
    },
    async ({ amount, encryptedAmount, marketAddress }) => {
      rateLimitWritePrep("credit_borrow");
      const call = await sdk.credit.buildBorrow(
        BigInt(amount),
        parseInEuint64(encryptedAmount),
        marketAddress as `0x${string}` | undefined,
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "credit_build_repay",
    "Build unsigned repay tx — pre-encrypted InEuint64 required",
    {
      amount: z.string(),
      encryptedAmount: inEuint64Schema,
      marketAddress: walletSchema.optional(),
    },
    async ({ amount, encryptedAmount, marketAddress }) => {
      rateLimitWritePrep("credit_repay");
      const call = await sdk.credit.buildRepay(
        BigInt(amount),
        parseInEuint64(encryptedAmount),
        marketAddress as `0x${string}` | undefined,
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "vote_get_proposal_count",
    "Public proposal count from ObscuraVote.nextProposalId",
    {},
    async () => {
      rateLimitRead("vote_count");
      const count = await sdk.vote.getProposalCount();
      return jsonText({ proposalCount: count.toString() });
    },
  );

  server.tool(
    "vote_get_proposal",
    "Public proposal metadata (no encrypted ballot data)",
    { proposalId: z.string() },
    async ({ proposalId }) => {
      rateLimitRead(`proposal:${proposalId}`);
      const proposal = await sdk.vote.getProposal(BigInt(proposalId));
      return jsonText(proposal);
    },
  );

  server.tool(
    "vote_build_cast_vote",
    "Build unsigned castVote tx — pre-encrypted option InEuint64 required",
    {
      proposalId: z.string(),
      optionIndex: z.number().int().min(0),
      encryptedOption: inEuint64Schema,
    },
    async ({ proposalId, optionIndex, encryptedOption }) => {
      rateLimitWritePrep("vote_cast");
      const call = await sdk.vote.buildCastVote(
        BigInt(proposalId),
        optionIndex,
        parseInEuint64(encryptedOption),
      );
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "vote_build_delegate",
    "Build unsigned delegate tx (plaintext delegatee address)",
    { delegatee: walletSchema },
    async ({ delegatee }) => {
      rateLimitWritePrep("vote_delegate");
      const call = sdk.vote.buildDelegate(delegatee as `0x${string}`);
      return jsonText(serializeContractCall(call));
    },
  );

  server.tool(
    "reputation_get_summary",
    "Authenticated wallet reputation tier and capped signals (requires OBSCURA_AGENT_TOKEN)",
    {},
    async () => {
      await resolveAgentContext();
      requirePermission("reputation:read");
      rateLimitRead("rep:authenticated");
      const summary = await sdk.reputation.getAuthenticatedSummary();
      return jsonText(summary);
    },
  );

  server.tool(
    "activity_list_for_wallet",
    "Authenticated wallet activity feed — max pageSize 25 (requires OBSCURA_AGENT_TOKEN)",
    {
      filter: z
        .enum(["all", "sent", "received", "stream", "invoice", "escrow", "stealth", "credit", "vote"])
        .optional(),
      page: z.number().int().min(0).optional(),
      pageSize: z.number().int().min(1).max(MAX_ACTIVITY_PAGE_SIZE).optional(),
    },
    async ({ filter, page, pageSize }) => {
      await resolveAgentContext();
      requirePermission("activity:read");
      rateLimitRead("activity:authenticated");
      const result = await sdk.activity.listAuthenticated({
        filter,
        page,
        pageSize: Math.min(pageSize ?? 25, MAX_ACTIVITY_PAGE_SIZE),
      });
      return jsonText(result);
    },
  );

  server.tool(
    "user_encode_call",
    "Encode a ContractCall from a build_* tool result to calldata hex",
    {
      call: z.object({
        address: walletSchema,
        functionName: z.string(),
        chainId: z.number().int(),
        args: z.array(z.unknown()),
        abi: z.array(z.unknown()).optional(),
      }),
    },
    async ({ call }) => {
      rateLimitWritePrep("encode");
      const calldata = sdk.encodeCall(call as never);
      return jsonText({
        calldata,
        note: "Sign and broadcast with user wallet — MCP never holds keys",
        eoaFheWarning:
          "EOA only — CoFHE InEuint64 proofs bind to the immediate caller.",
      });
    },
  );
}

export function registerUserResources(server: McpServer): void {
  server.resource(
    "obscura://user/addresses",
    "obscura://user/addresses",
    { mimeType: "application/json", description: "Canonical Sepolia contract addresses" },
    async () => ({
      contents: [
        {
          uri: "obscura://user/addresses",
          mimeType: "application/json",
          text: JSON.stringify(DEFAULT_ADDRESSES, null, 2),
        },
      ],
    }),
  );

  server.resource(
    "obscura://privacy/agent-rules",
    "obscura://privacy/agent-rules",
    { mimeType: "text/plain", description: "Mandatory privacy rules for agents" },
    async () => ({
      contents: [
        {
          uri: "obscura://privacy/agent-rules",
          mimeType: "text/plain",
          text: [
            "1. Never decrypt FHE values — reveal only when user clicks Reveal in Obscura UI",
            "2. Display encrypted handles as *** not numeric balances",
            "3. Encrypted writes require EOA wallet — not smart accounts",
            "4. Use pre-encrypted InEuint64 from browser CoFHE SDK only",
            "5. Never bulk-scan activity or stealth announcements",
            "6. Private mode = ocUSDC + EOA; Public mode = USDC + AA (no FHE writes)",
            "7. Wallet-scoped reads require OBSCURA_AGENT_TOKEN — no arbitrary wallet parameters",
            "8. Create and rotate agent tokens at /docs/agents — revoke on compromise",
          ].join("\n"),
        },
      ],
    }),
  );
}

export const USER_PROMPTS: Record<string, { description: string; text: string }> = {
  "privacy-first-agent": {
    description: "Mandatory privacy constraints for Obscura agents",
    text: "Never auto-decrypt. Show *** for encrypted handles. User must reveal in app.",
  },
  "execution-mode-guard": {
    description: "Private EOA vs Public AA mode guard",
    text: "Private Mode: ocUSDC via EOA only. Public Mode: USDC via passkey AA. Never use AA for encrypted ocUSDC writes.",
  },
  "credit-two-step-cofhe": {
    description: "Credit supply/borrow two-step CoFHE pattern",
    text: "Step 1: confidentialTransfer to market. Step 2: supply/recordWithEnc with matching plaintext shadow.",
  },
  "treasury-onboarding": {
    description: "Pay treasury checklist flow",
    text: "ETH gas → testnet USDC → shield ocUSDC → enable receiving → first payment → public mode optional.",
  },
};

export function registerUserPrompts(server: McpServer): void {
  for (const [name, { description, text }] of Object.entries(USER_PROMPTS)) {
    server.prompt(name, description, {}, async () => ({
      messages: [{ role: "user", content: { type: "text", text } }],
    }));
  }
}
