import { ObscuraSDK } from "@obscura-fhe/sdk";
import type { ObscuraSDKConfig } from "@obscura-fhe/sdk";

export function createUserSdk(): ObscuraSDK {
  const config: ObscuraSDKConfig = {
    chainId: parseInt(process.env.OBSCURA_CHAIN_ID ?? "421614", 10),
    rpcUrl: process.env.OBSCURA_RPC_URL,
    apiUrl: process.env.OBSCURA_API_URL,
    supabaseUrl: process.env.OBSCURA_SUPABASE_URL,
    supabaseAnonKey: process.env.OBSCURA_SUPABASE_ANON_KEY,
  };
  return ObscuraSDK.create(config);
}

export function getPublicChainConfig() {
  const sdk = createUserSdk();
  return {
    chainId: sdk.chainId,
    rpcUrl: process.env.OBSCURA_RPC_URL ?? "https://sepolia-rollup.arbitrum.io/rpc",
    apiUrl: process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com",
    supabaseUrl: process.env.OBSCURA_SUPABASE_URL ?? "https://quoovjkjwgtdqwdofubh.supabase.co",
    privacyMode: process.env.OBSCURA_PRIVACY_MODE ?? "standard",
    note: "No secrets exposed. Supabase anon key is server-side only.",
  };
}
