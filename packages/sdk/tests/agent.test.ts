import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { HttpClient } from "../src/core/http.js";
import { ActivityModule } from "../src/modules/activity.js";
import { ReputationModule } from "../src/modules/reputation.js";
import { buildAgentTokenMessage } from "../src/modules/agent.js";

const WALLET = "0xAb5801a7D398351bEFbE913C7950273DED6F6637" as const;
const AGENT_TOKEN = "obsc_at_testtoken123456789012345678901234";

describe("AgentModule message", () => {
  it("builds consistent EIP-191 message", () => {
    const msg = buildAgentTokenMessage(WALLET, 100, "create");
    expect(msg).toContain("Action: create");
    expect(msg).toContain(WALLET.toLowerCase());
  });
});

describe("authenticated HTTP reads", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    fetchMock.mockReset();
  });

  it("sends Authorization header for agent reputation", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ wallet: WALLET.toLowerCase(), tier: "new", totalCappedWeight: 0, signals: {}, sourceApp: "all", updatedAt: null }),
    });
    const http = new HttpClient("https://api.test", AGENT_TOKEN);
    const mod = new ReputationModule(http);
    await mod.getAuthenticatedSummary();
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/agent/reputation",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${AGENT_TOKEN}` }),
      }),
    );
  });

  it("uses /agent/activity when agent token configured", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], page: 0, pageSize: 20, hasMore: false }),
    });
    const http = new HttpClient("https://api.test", AGENT_TOKEN);
    const mod = new ActivityModule(http);
    await mod.listAuthenticated({ filter: "credit" });
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.test/agent/activity?filter=credit",
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: `Bearer ${AGENT_TOKEN}` }),
      }),
    );
  });

  it("listForWallet routes to authenticated path when token set", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ items: [], page: 0, pageSize: 20, hasMore: false }),
    });
    const http = new HttpClient("https://api.test", AGENT_TOKEN);
    const mod = new ActivityModule(http);
    await mod.listForWallet(WALLET);
    expect(fetchMock.mock.calls[0][0]).toContain("/agent/activity");
  });
});
