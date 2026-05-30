import { describe, expect, it } from "vitest";
import {
  APP_WALLET_SESSION_MAX_AGE_SEC,
  buildAppSessionMessage,
  buildWalletAuthMessage,
} from "../src/wallet-auth.js";

describe("app wallet session auth", () => {
  it("uses 7-day default max age", () => {
    expect(APP_WALLET_SESSION_MAX_AGE_SEC).toBe(7 * 24 * 60 * 60);
  });

  it("builds app session message with duration", () => {
    const msg = buildAppSessionMessage("0xAb5801a7D398351bEFbE913C7950273DED6F6637", 1_700_000_000);
    expect(msg).toContain("Obscura App Session");
    expect(msg).toContain("Valid for:");
    expect(msg).not.toEqual(buildWalletAuthMessage("0xab5801a7d398351befbe913c7950273ded6f6637", 1_700_000_000));
  });
});
