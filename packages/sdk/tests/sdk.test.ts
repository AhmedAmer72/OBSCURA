import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { encodeFunctionData } from "viem";
import { ACTIVITY_EVENT_FILTERS } from "../src/config/activity-filters.js";
import { DEFAULT_ADDRESSES } from "../src/config/defaults.js";
import { ObscuraSDK } from "../src/client.js";
import { HttpClient } from "../src/core/http.js";
import { normalizeWallet, toContractInEuint64 } from "../src/core/utils.js";
import { FheRequiredError } from "../src/fhe/types.js";
import { OC_USDC_PAY_ABI, OBSCURA_VOTE_ABI } from "../src/abis/index.js";
import { ReputationModule } from "../src/modules/reputation.js";
import { NotificationsModule } from "../src/modules/notifications.js";
import { ActivityModule } from "../src/modules/activity.js";
import type { InEuint64 } from "../src/types/index.js";

const WALLET = "0xAb5801a7D398351bEFbE913C7950273DED6F6637" as const;

describe("utils", () => {
  it("normalizes wallet to lowercase", () => {
    expect(normalizeWallet(WALLET)).toBe(WALLET.toLowerCase());
    expect(normalizeWallet("invalid")).toBeNull();
  });

  it("serializes InEuint64 for contract args", () => {
    const input: InEuint64 = {
      ctHash: 123n,
      securityZone: 0,
      utype: 5,
      signature: "0xdeadbeef",
    };
    expect(toContractInEuint64(input)).toEqual(input);
  });
});

describe("activity filters", () => {
  it("includes credit and vote event namespaces", () => {
    expect(ACTIVITY_EVENT_FILTERS.credit.length).toBeGreaterThan(0);
    expect(ACTIVITY_EVENT_FILTERS.vote.some((e) => e.startsWith("ObscuraVote"))).toBe(true);
  });
});

describe("ObscuraSDK", () => {
  it("creates with default Arbitrum Sepolia addresses", () => {
    const sdk = ObscuraSDK.create();
    expect(sdk.addresses.ocUSDC_Pay).toBe(DEFAULT_ADDRESSES.ocUSDC_Pay);
    expect(sdk.pay).toBeDefined();
    expect(sdk.credit).toBeDefined();
    expect(sdk.vote).toBeDefined();
    expect(sdk.reputation).toBeDefined();
    expect(sdk.agent).toBeDefined();
    expect(sdk.activity).toBeDefined();
    expect(sdk.notifications).toBeDefined();
  });

  it("encodes pay transfer call when pre-encrypted input supplied", async () => {
    const sdk = ObscuraSDK.create();
    const enc: InEuint64 = {
      ctHash: 1n,
      securityZone: 0,
      utype: 5,
      signature: "0x00",
    };
    const call = await sdk.pay.buildTransfer(
      "0x0000000000000000000000000000000000000001",
      1000n,
      enc,
    );
    const data = sdk.encodeCall(call);
    expect(data.startsWith("0x")).toBe(true);
    expect(call.address).toBe(DEFAULT_ADDRESSES.ocUSDC_Pay);
  });

  it("throws FheRequiredError without provider or pre-encrypted input", async () => {
    const sdk = ObscuraSDK.create();
    await expect(
      sdk.pay.buildShield(100n),
    ).rejects.toBeInstanceOf(FheRequiredError);
  });

  it("builds delegate call without FHE", () => {
    const sdk = ObscuraSDK.create();
    const call = sdk.vote.buildDelegate("0x0000000000000000000000000000000000000002");
    const expected = encodeFunctionData({
      abi: OBSCURA_VOTE_ABI,
      functionName: "delegate",
      args: ["0x0000000000000000000000000000000000000002"],
    });
    expect(sdk.encodeCall(call)).toBe(expected);
  });
});

describe("CreditModule reads", () => {
  it("getMarketUtilization reads public aggregates via publicClient", async () => {
    const mockRead = vi.fn()
      .mockResolvedValueOnce(5000n)
      .mockResolvedValueOnce(1000000n)
      .mockResolvedValueOnce(500000n);

    const sdk = ObscuraSDK.create({
      publicClient: { readContract: mockRead } as never,
    });

    const util = await sdk.credit.getMarketUtilization();
    expect(util.utilizationBps).toBe(5000n);
    expect(util.totalSupplyAssets).toBe(1000000n);
    expect(util.totalBorrowAssets).toBe(500000n);
    expect(util.marketAddress).toBe(DEFAULT_ADDRESSES.CreditCanonicalPayOcUSDCMarket);
    expect(mockRead).toHaveBeenCalledTimes(3);
  });

  it("getPositionHandles returns opaque handles without shadows by default", async () => {
    const mockRead = vi.fn().mockResolvedValueOnce([0xabcn, 1n, 2n, 3n]);

    const sdk = ObscuraSDK.create({
      publicClient: { readContract: mockRead } as never,
    });

    const pos = await sdk.credit.getPositionHandles(WALLET);
    expect(pos.encryptedSupplySharesHandle).toMatch(/^0x/);
    expect(pos.plainCollateral).toBeUndefined();
    expect(pos.plaintextShadowWarning).toBeUndefined();
    expect(mockRead).toHaveBeenCalledTimes(1);
  });

  it("getPositionHandles includes shadow warning when requested", async () => {
    const mockRead = vi
      .fn()
      .mockResolvedValueOnce([0n, 0n, 0n, 0n])
      .mockResolvedValueOnce(100n)
      .mockResolvedValueOnce(50n);

    const sdk = ObscuraSDK.create({
      publicClient: { readContract: mockRead } as never,
    });

    const pos = await sdk.credit.getPositionHandles(WALLET, { includePlaintextShadows: true });
    expect(pos.plaintextShadowWarning).toContain("Plaintext shadows");
    expect(pos.plainCollateral).toBe(100n);
    expect(pos.plainBorrow).toBe(50n);
  });
});

describe("ReputationModule", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("fetches reputation summary", async () => {
    const summary = {
      wallet: WALLET.toLowerCase(),
      sourceApp: "all" as const,
      totalCappedWeight: 12,
      tier: "steady" as const,
      signals: {},
      updatedAt: "2026-05-29T00:00:00.000Z",
    };
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => summary,
    });

    const mod = new ReputationModule(new HttpClient("https://api.test"));
    const result = await mod.getSummary(WALLET);
    expect(result.tier).toBe("steady");
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.test/reputation/${WALLET.toLowerCase()}`,
      expect.objectContaining({ method: "GET" }),
    );
  });
});

describe("NotificationsModule", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("gets vapid public key", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ publicKey: "BPtest" }),
    });
    const mod = new NotificationsModule(new HttpClient("https://api.test"));
    await expect(mod.getVapidPublicKey()).resolves.toBe("BPtest");
  });

  it("returns null for missing prefs", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 404, text: async () => "Not found" });
    const mod = new NotificationsModule(new HttpClient("https://api.test"));
    await expect(mod.getPrefs(WALLET)).resolves.toBeNull();
  });
});

describe("ActivityModule", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("fetches activity via Obscura API", async () => {
    const payload = {
      items: [{ event_name: "ObscuraPay.PaymentSent", tx_hash: "0xabc" }],
      page: 0,
      pageSize: 20,
      hasMore: false,
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => payload });

    const mod = new ActivityModule(new HttpClient("https://api.test"));
    const result = await mod.listForWallet(WALLET, { filter: "sent" });
    expect(result.items).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledWith(
      `https://api.test/activity/${WALLET.toLowerCase()}?filter=sent`,
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("is configured when API client is present", () => {
    expect(new ActivityModule(new HttpClient("https://api.test")).isConfigured()).toBe(true);
  });

  it("exposes event filter map", () => {
    const mod = new ActivityModule(new HttpClient("https://api.test"));
    expect(mod.getEventFilters().credit).toEqual(ACTIVITY_EVENT_FILTERS.credit);
  });
});

describe("PayModule tx encoding", () => {
  it("matches viem encodeFunctionData for shield", async () => {
    const sdk = ObscuraSDK.create();
    const enc: InEuint64 = {
      ctHash: 42n,
      securityZone: 0,
      utype: 5,
      signature: "0xab",
    };
    const call = await sdk.pay.buildShield(500n, enc);
    const encoded = sdk.encodeCall(call);
    const expected = encodeFunctionData({
      abi: OC_USDC_PAY_ABI,
      functionName: "shield",
      args: [500n, enc],
    });
    expect(encoded).toBe(expected);
  });
});

describe("CreditModule", () => {
  it("defaults to canonical market address", () => {
    const sdk = ObscuraSDK.create();
    expect(sdk.credit.getMarketAddress()).toBe(DEFAULT_ADDRESSES.CreditCanonicalPayOcUSDCMarket);
  });
});
