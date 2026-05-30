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

  getEventFilters(): ActivityEventFilterMap {
    return ACTIVITY_EVENT_FILTERS;
  }

  async listForWallet(wallet: Address, options: ActivityListOptions = {}): Promise<ActivityListResult> {
    const normalized = normalizeWallet(wallet);
    if (!normalized) throw new Error("Invalid wallet address");

    const filter: ActivityEventType = options.filter ?? "all";
    const page = options.page ?? 0;
    const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE;

    const params = new URLSearchParams();
    if (filter !== "all") params.set("filter", filter);
    if (page > 0) params.set("page", String(page));
    if (pageSize !== DEFAULT_PAGE_SIZE) params.set("pageSize", String(pageSize));

    const qs = params.toString();
    const path = `/activity/${normalized}${qs ? `?${qs}` : ""}`;
    return this.http.get<ActivityListResult>(path);
  }
}
