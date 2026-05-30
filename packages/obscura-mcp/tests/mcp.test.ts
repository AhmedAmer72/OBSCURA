import { describe, expect, it } from "vitest";
import { assertNoBannedTool, BANNED_TOOL_PATTERNS, MAX_ACTIVITY_PAGE_SIZE } from "../src/shared/privacy-guard.js";
import { isPathDenied, containsSecretContent } from "../src/developer/denylist.js";
import { getDocPages, buildSearchIndex, getPage } from "../src/documentation/portal.js";
import { createUserServer } from "../src/user/server.js";
import { createDeveloperServer } from "../src/developer/server.js";
import { createDocumentationServer } from "../src/documentation/server.js";

describe("privacy guard", () => {
  it("blocks banned tool name patterns", () => {
    expect(() => assertNoBannedTool("decrypt_balance")).toThrow();
    expect(() => assertNoBannedTool("relay_userop")).toThrow();
    expect(() => assertNoBannedTool("pay_get_encrypted_balance_handle")).not.toThrow();
  });

  it("defines banned patterns", () => {
    expect(BANNED_TOOL_PATTERNS.length).toBeGreaterThan(0);
  });

  it("caps activity page size at 25", () => {
    expect(MAX_ACTIVITY_PAGE_SIZE).toBe(25);
  });
});

describe("developer denylist", () => {
  it("denies .env files", () => {
    expect(isPathDenied("backend/obscura-api/.env")).toBe(true);
    expect(isPathDenied("packages/sdk/src/index.ts")).toBe(false);
  });

  it("detects secret content patterns", () => {
    expect(containsSecretContent("SUPABASE_SERVICE_ROLE_KEY=abc")).toBe(true);
    expect(containsSecretContent("PORT=3000")).toBe(false);
  });
});

describe("documentation portal", () => {
  it("loads all 15 docs slugs", () => {
    expect(getDocPages().length).toBe(15);
  });

  it("builds search index", () => {
    const index = buildSearchIndex();
    expect(index.length).toBeGreaterThan(14);
  });

  it("gets page by slug", () => {
    expect(getPage("privacy")?.title).toBe("Privacy model");
    expect(getPage("sdk")?.slug).toBe("sdk");
    expect(getPage("mcp")?.slug).toBe("mcp");
  });
});

describe("MCP servers", () => {
  it("creates user server", () => {
    const server = createUserServer();
    expect(server).toBeDefined();
  });

  it("creates developer server", () => {
    expect(createDeveloperServer()).toBeDefined();
  });

  it("creates documentation server", () => {
    expect(createDocumentationServer()).toBeDefined();
  });
});
