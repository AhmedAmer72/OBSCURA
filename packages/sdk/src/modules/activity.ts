import type { Address } from "viem";
import { ACTIVITY_EVENT_FILTERS, type ActivityEventFilterMap } from "../config/activity-filters.js";
import { HttpClient } from "../core/http.js";
import { normalizeWallet } from "../core/utils.js";
import type {
  ActivityEventType,
  ActivityListOptions,
  ActivityListResult,
} from "../types/index.js";

const DEFAULT_PAGE_SIZE = 20;

export class ActivityModule {
  constructor(private readonly http: HttpClient) {}

  /** True when API-backed activity reads are available (always when SDK has default apiUrl). */
  isConfigured(): boolean {
    return Boolean(this.http.url);
  }

  hasAgentToken(): boolean {
    return this.http.hasAgentToken();
  }

  getEventFilters(): ActivityEventFilterMap {
    return ACTIVITY_EVENT_FILTERS;
  }

  /** Authenticated activity for the agent token wallet */
  async listAuthenticated(options: ActivityListOptions = {}): Promise<ActivityListResult> {
    if (!this.http.hasAgentToken()) {
      throw new Error("agentToken required — create one at /docs/agents");
    }
    return this.listWithPath("/agent/activity", options);
  }

  async listForWallet(wallet: Address, options: ActivityListOptions = {}): Promise<ActivityListResult> {
    if (this.http.hasAgentToken()) {
      return this.listAuthenticated(options);
    }
    const normalized = normalizeWallet(wallet);
    if (!normalized) throw new Error("Invalid wallet address");
    return this.listWithPath(`/activity/${normalized}`, options);
  }

  private async listWithPath(
    basePath: string,
    options: ActivityListOptions,
  ): Promise<ActivityListResult> {
    const filter: ActivityEventType = options.filter ?? "all";
    const page = options.page ?? 0;
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (page > 0) params.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));

    const qs = params.toString();
    const path = `${basePath}${qs ? `?${qs}` : ""}`;
    return this.http.get<ActivityListResult>(path);
  }
}
