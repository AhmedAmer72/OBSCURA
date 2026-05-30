import { ObscuraSDK } from "@obscura-fhe/sdk";
import type { ObscuraSDKConfig } from "@obscura-fhe/sdk";

export function createUserSdk(): ObscuraSDK {
  const config: ObscuraSDKConfig = {
    chainId: parseInt(process.env.OBSCURA_CHAIN_ID ?? "421614", 10),
    rpcUrl: process.env.OBSCURA_RPC_URL,
    apiUrl: process.env.OBSCURA_API_URL,
  };
  return ObscuraSDK.create(config);
}

export function getPublicChainConfig() {
  return {
    chainId: parseInt(process.env.OBSCURA_CHAIN_ID ?? "421614", 10),
    rpcUrl: process.env.OBSCURA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc",
    apiUrl: process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com",
    privacyMode: process.env.OBSCURA_PRIVACY_MODE ?? "standard",
    note: "No secrets required. Activity, reputation, and notifications route through Obscura API.",
  };
}
