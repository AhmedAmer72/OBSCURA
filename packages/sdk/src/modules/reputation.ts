import type { Address } from "viem";
import type { HttpClient } from "../core/http.js";
import { normalizeWallet } from "../core/utils.js";
import type { ReputationSummary } from "../types/index.js";

export class ReputationModule {
  constructor(private readonly http: HttpClient) {}

  /** True when an agent token is configured for authenticated reads */
  hasAgentToken(): boolean {
    return this.http.hasAgentToken();
  }

  /** Authenticated reputation for the agent token wallet */
  async getAuthenticatedSummary(): Promise<ReputationSummary> {
    if (!this.http.hasAgentToken()) {
      throw new Error("agentToken required — create one at /docs/agents");
    }
    return this.http.get<ReputationSummary>("/agent/reputation");
  }

  async getSummary(wallet?: Address): Promise<ReputationSummary> {
    if (this.http.hasAgentToken()) {
      return this.getAuthenticatedSummary();
    }
    const normalized = normalizeWallet(wallet);
    if (!normalized) {
      throw new Error("Invalid wallet address");
    }
    return this.http.get<ReputationSummary>(`/reputation/${normalized}`);
  }
}
