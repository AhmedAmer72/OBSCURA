import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { resolveAgentContext, resetAgentContextCache } from "../src/user/agent-context.js";

describe("MCP agent context", () => {
  const fetchMock = vi.fn();
  const savedToken = process.env.OBSCURA_AGENT_TOKEN;
  const savedApi = process.env.OBSCURA_API_URL;

  beforeEach(() => {
    resetAgentContextCache();
    vi.stubGlobal("fetch", fetchMock);
    delete process.env.OBSCURA_AGENT_TOKEN;
    delete process.env.OBSCURA_API_URL;
  });

  afterEach(() => {
    resetAgentContextCache();
    vi.unstubAllGlobals();
    fetchMock.mockReset();
    if (savedToken === undefined) delete process.env.OBSCURA_AGENT_TOKEN;
    else process.env.OBSCURA_AGENT_TOKEN = savedToken;
    if (savedApi === undefined) delete process.env.OBSCURA_API_URL;
    else process.env.OBSCURA_API_URL = savedApi;
  });

  it("throws when OBSCURA_AGENT_TOKEN missing", async () => {
    await expect(resolveAgentContext()).rejects.toThrow(/OBSCURA_AGENT_TOKEN/);
  });

  it("resolves wallet from /agent/me", async () => {
    const token = "obsc_at_mcp_test_token_value_here_12345";
    process.env.OBSCURA_AGENT_TOKEN = token;
    process.env.OBSCURA_API_URL = "https://api.test";

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({
        wallet: "0xab5801a7d398351befbe913c7950273ded6f6637",
        permissions: ["activity:read", "reputation:read"],
        expiresAt: "2026-12-31T00:00:00.000Z",
        tokenId: "uuid-1",
      }),
    });

    const ctx = await resolveAgentContext();
    expect(ctx.wallet).toBe("0xab5801a7d398351befbe913c7950273ded6f6637");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/agent/me",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${token}` }),
      }),
    );
  });
});
