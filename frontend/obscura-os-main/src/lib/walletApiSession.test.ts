import { describe, expect, it, beforeEach, vi } from "vitest";
import {
  APP_SESSION_DURATION_SEC,
  APP_SESSION_REFRESH_BEFORE_SEC,
  APP_SESSION_VERSION,
  buildAppSessionMessage,
  createAppWalletSession,
  isSessionValid,
  readAppWalletSession,
  sessionNeedsRefresh,
  writeAppWalletSession,
  clearAppWalletSession,
} from "./walletApiSession";

describe("walletApiSession", () => {
  const wallet = "0xf76e6b0920e9332ff4410f6dd53f01722abc71a3";
  const signature = "0xabc123";

  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-29T12:00:00Z"));
  });

  it("builds 7-day app session message", () => {
    const msg = buildAppSessionMessage(wallet, 1_700_000_000);
    expect(msg).toContain("Obscura App Session");
    expect(msg).toContain(`Valid for: ${APP_SESSION_DURATION_SEC} seconds`);
  });

  it("creates and reads a valid session from localStorage", () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const session = createAppWalletSession(wallet, signature, issuedAt);
    writeAppWalletSession(session);
    const loaded = readAppWalletSession(wallet);
    expect(loaded?.wallet).toBe(wallet.toLowerCase());
    expect(loaded?.version).toBe(APP_SESSION_VERSION);
  });

  it("expires session after 7 days", () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const session = createAppWalletSession(wallet, signature, issuedAt);
    writeAppWalletSession(session);
    vi.advanceTimersByTime(APP_SESSION_DURATION_SEC * 1000 + 1);
    expect(readAppWalletSession(wallet)).toBeNull();
  });

  it("flags refresh window within 24h of expiry", () => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const session = createAppWalletSession(wallet, signature, issuedAt);
    const nearExpiry = issuedAt + APP_SESSION_DURATION_SEC - APP_SESSION_REFRESH_BEFORE_SEC + 60;
    vi.setSystemTime(nearExpiry * 1000);
    expect(isSessionValid(session, wallet, nearExpiry)).toBe(true);
    expect(sessionNeedsRefresh(session, nearExpiry)).toBe(true);
  });

  it("rejects session for different wallet", () => {
    const session = createAppWalletSession(wallet, signature);
    expect(isSessionValid(session, "0x1111111111111111111111111111111111111111")).toBe(false);
  });

  it("clears session on wallet change cleanup", () => {
    writeAppWalletSession(createAppWalletSession(wallet, signature));
    clearAppWalletSession(wallet);
    expect(readAppWalletSession(wallet)).toBeNull();
  });
});
