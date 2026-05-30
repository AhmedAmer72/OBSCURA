import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { createUserSdk, getPublicChainConfig } from "../src/user/sdk-adapter.js";

describe("User MCP SDK adapter", () => {
  const saved: Record<string, string | undefined> = {};

  beforeEach(() => {
    saved.OBSCURA_SUPABASE_ANON_KEY = process.env.OBSCURA_SUPABASE_ANON_KEY;
    saved.OBSCURA_SUPABASE_URL = process.env.OBSCURA_SUPABASE_URL;
    delete process.env.OBSCURA_SUPABASE_ANON_KEY;
    delete process.env.OBSCURA_SUPABASE_URL;
  });

  afterEach(() => {
    if (saved.OBSCURA_SUPABASE_ANON_KEY === undefined) delete process.env.OBSCURA_SUPABASE_ANON_KEY;
    else process.env.OBSCURA_SUPABASE_ANON_KEY = saved.OBSCURA_SUPABASE_ANON_KEY;
    if (saved.OBSCURA_SUPABASE_URL === undefined) delete process.env.OBSCURA_SUPABASE_URL;
    else process.env.OBSCURA_SUPABASE_URL = saved.OBSCURA_SUPABASE_URL;
  });

  it("creates SDK without Supabase env vars", () => {
    const sdk = createUserSdk();
    expect(sdk.activity.isConfigured()).toBe(true);
    expect(sdk.reputation).toBeDefined();
  });

  it("getPublicChainConfig exposes no secrets", () => {
    const cfg = getPublicChainConfig();
    expect(cfg.apiUrl).toBeTruthy();
    expect(cfg).not.toHaveProperty("supabaseAnonKey");
    expect(String(cfg.note)).toMatch(/Obscura API/i);
  });
});
