import { ObscuraSDK } from "@obscura-fhe/sdk";
import type { ObscuraSDKConfig } from "@obscura-fhe/sdk";

export function createUserSdk(): ObscuraSDK {
  const agentToken = process.env.OBSCURA_AGENT_TOKEN?.trim();
  const config: ObscuraSDKConfig = {
    chainId: parseInt(process.env.OBSCURA_CHAIN_ID ?? "421614", 10),
    rpcUrl: process.env.OBSCURA_RPC_URL,
    apiUrl: process.env.OBSCURA_API_URL,
    agentToken,
  };
  return ObscuraSDK.create(config);
}

export function getPublicChainConfig() {
  const hasAgentToken = Boolean(process.env.OBSCURA_AGENT_TOKEN?.trim());
  return {
    chainId: parseInt(process.env.OBSCURA_CHAIN_ID ?? "421614", 10),
    rpcUrl: process.env.OBSCURA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc",
    apiUrl: process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com",
    privacyMode: process.env.OBSCURA_PRIVACY_MODE ?? "standard",
    agentTokenConfigured: hasAgentToken,
    note: hasAgentToken
      ? "Agent token configured — wallet-scoped reads use authenticated identity."
      : "Set OBSCURA_AGENT_TOKEN for wallet-scoped activity/reputation reads. Create at /docs/agents.",
  };
}
