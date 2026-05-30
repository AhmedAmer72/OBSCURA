import { describe, expect, it } from "vitest";
import {
  TOKEN_PREFIX,
  buildAgentTokenMessage,
  generateAgentToken,
  hashAgentToken,
  hasPermission,
  isTokenActive,
  isTokenExpired,
  parseBearerToken,
  sanitizePermissions,
  type AgentTokenRow,
} from "../src/agent-auth.js";

describe("agent-auth", () => {
  it("generates tokens with obsc_at_ prefix", () => {
    const { token, hash } = generateAgentToken();
    expect(token.startsWith(TOKEN_PREFIX)).toBe(true);
    expect(hash).toBe(hashAgentToken(token));
    expect(hash).not.toBe(token);
  });

  it("hashes consistently", () => {
    const token = `${TOKEN_PREFIX}test123`;
    expect(hashAgentToken(token)).toBe(hashAgentToken(token));
  });

  it("parses bearer header", () => {
    const token = `${TOKEN_PREFIX}abc123def456ghij789`;
    expect(parseBearerToken(`Bearer ${token}`)).toBe(token);
    expect(parseBearerToken("Basic foo")).toBeNull();
    expect(parseBearerToken(undefined)).toBeNull();
  });

  it("builds EIP-191 message with action", () => {
    const msg = buildAgentTokenMessage("0xAb5801a7D398351bEFbE913C7950273DED6F6637", 123, "create");
    expect(msg).toContain("Obscura Agent Token Request");
    expect(msg).toContain("Action: create");
    expect(msg).toContain("0xab5801a7d398351befbe913c7950273ded6f6637");
  });

  it("sanitizes permissions to allowed set", () => {
    expect(sanitizePermissions(["activity:read", "evil:admin"])).toEqual(["activity:read"]);
    expect(sanitizePermissions([])).toEqual([
      "activity:read",
      "reputation:read",
      "balance:read",
    ]);
  });

  it("checks token active state", () => {
    const row: AgentTokenRow = {
      id: "1",
      token_hash: "abc",
      wallet: "0xab5801a7d398351befbe913c7950273ded6f6637",
      label: null,
      permissions: ["activity:read"],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      last_used_at: null,
      revoked_at: null,
    };
    expect(isTokenActive(row)).toBe(true);
    expect(isTokenExpired(row.expires_at)).toBe(false);
    expect(hasPermission(row.permissions, "activity:read")).toBe(true);
    expect(hasPermission(row.permissions, "balance:read")).toBe(false);
  });

  it("rejects revoked tokens", () => {
    const row: AgentTokenRow = {
      id: "1",
      token_hash: "abc",
      wallet: "0xab5801a7d398351befbe913c7950273ded6f6637",
      label: null,
      permissions: ["activity:read"],
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 86400000).toISOString(),
      last_used_at: null,
      revoked_at: new Date().toISOString(),
    };
    expect(isTokenActive(row)).toBe(false);
  });
});
