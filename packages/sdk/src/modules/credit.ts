import type { Address, PublicClient } from "viem";
import { CREDIT_MARKET_ABI } from "../abis/index.js";
import { makeCall } from "../core/chain.js";
import { normalizeWallet, resolveInEuint64, toContractInEuint64 } from "../core/utils.js";
import type { ObscuraAddresses } from "../config/defaults.js";
import type { FheProvider } from "../fhe/types.js";
import type {
  ContractCall,
  CreditMarketUtilization,
  CreditPositionHandles,
  InEuint64,
} from "../types/index.js";

const PLAINTEXT_SHADOW_WARNING =
  "Plaintext shadows are public testnet UI hints only — not encrypted balances. " +
  "Do not treat as private position size. Omit on mainnet strict privacy mode.";

export interface CreditModuleDeps {
  chainId: number;
  addresses: ObscuraAddresses;
  publicClient: PublicClient;
  fhe?: FheProvider;
}

function bigintToHandleHex(value: bigint): `0x${string}` {
  const hex = value.toString(16).padStart(64, "0");
  return `0x${hex}` as `0x${string}`;
}

export class CreditModule {
  constructor(private readonly deps: CreditModuleDeps) {}

  getMarketAddress(override?: Address): Address {
    return override ?? this.deps.addresses.CreditCanonicalPayOcUSDCMarket;
  }

  /** Public pool aggregates — no wallet required */
  async getMarketUtilization(marketAddress?: Address): Promise<CreditMarketUtilization> {
    const market = this.getMarketAddress(marketAddress);
    const [utilizationBps, totalSupplyAssets, totalBorrowAssets] = await Promise.all([
      this.deps.publicClient.readContract({
        address: market,
        abi: CREDIT_MARKET_ABI,
        functionName: "utilizationBps",
      }) as Promise<bigint>,
      this.deps.publicClient.readContract({
        address: market,
        abi: CREDIT_MARKET_ABI,
        functionName: "totalSupplyAssets",
      }) as Promise<bigint>,
      this.deps.publicClient.readContract({
        address: market,
        abi: CREDIT_MARKET_ABI,
        functionName: "totalBorrowAssets",
      }) as Promise<bigint>,
    ]);

    return {
      marketAddress: market,
      utilizationBps,
      totalSupplyAssets,
      totalBorrowAssets,
    };
  }

  /**
   * Returns encrypted position handles as opaque hex strings.
   * Plaintext shadows are optional and labeled with an explicit warning.
   */
  async getPositionHandles(
    wallet: Address,
    options: { marketAddress?: Address; includePlaintextShadows?: boolean } = {},
  ): Promise<CreditPositionHandles> {
    const normalized = normalizeWallet(wallet);
    if (!normalized) throw new Error("Invalid wallet address");

    const market = this.getMarketAddress(options.marketAddress);
    const position = (await this.deps.publicClient.readContract({
      address: market,
      abi: CREDIT_MARKET_ABI,
      functionName: "getPosition",
      args: [normalized],
    })) as readonly [bigint, bigint, bigint, bigint];

    const result: CreditPositionHandles = {
      marketAddress: market,
      wallet: normalized,
      encryptedSupplySharesHandle: bigintToHandleHex(position[0]),
      encryptedBorrowSharesHandle: bigintToHandleHex(position[1]),
      encryptedCollateralHandle: bigintToHandleHex(position[2]),
    };

    if (options.includePlaintextShadows) {
      const [plainCollateral, plainBorrow] = await Promise.all([
        this.deps.publicClient.readContract({
          address: market,
          abi: CREDIT_MARKET_ABI,
          functionName: "getPlainCollateral",
          args: [normalized],
        }) as Promise<bigint>,
        this.deps.publicClient.readContract({
          address: market,
          abi: CREDIT_MARKET_ABI,
          functionName: "getPlainBorrow",
          args: [normalized],
        }) as Promise<bigint>,
      ]);
      result.plaintextShadowWarning = PLAINTEXT_SHADOW_WARNING;
      result.plainCollateral = plainCollateral;
      result.plainBorrow = plainBorrow;
    }

    return result;
  }

  async buildSupplyCollateral(
    amount: bigint,
    encryptedAmount?: InEuint64,
    marketAddress?: Address,
  ): Promise<ContractCall> {
    const market = this.getMarketAddress(marketAddress);
    const enc = await resolveInEuint64(amount, market, this.deps.fhe, encryptedAmount);
    return makeCall(this.deps.chainId, market, CREDIT_MARKET_ABI, "supplyCollateral", [
      toContractInEuint64(enc),
    ]);
  }

  async buildBorrow(
    amount: bigint,
    encryptedAmount?: InEuint64,
    marketAddress?: Address,
  ): Promise<ContractCall> {
    const market = this.getMarketAddress(marketAddress);
    const enc = await resolveInEuint64(amount, market, this.deps.fhe, encryptedAmount);
    return makeCall(this.deps.chainId, market, CREDIT_MARKET_ABI, "borrow", [
      toContractInEuint64(enc),
    ]);
  }

  async buildRepay(
    amount: bigint,
    encryptedAmount?: InEuint64,
    marketAddress?: Address,
  ): Promise<ContractCall> {
    const market = this.getMarketAddress(marketAddress);
    const enc = await resolveInEuint64(amount, market, this.deps.fhe, encryptedAmount);
    return makeCall(this.deps.chainId, market, CREDIT_MARKET_ABI, "repay", [
      toContractInEuint64(enc),
    ]);
  }
}
