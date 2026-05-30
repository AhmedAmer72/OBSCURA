import { Router, Request, Response } from "express";
import { db } from "./db";
import { ACTIVITY_EVENT_FILTERS, isActivityFilter } from "./activity-filters";
import { requireAgentToken, enforceWalletScopeOrLegacy } from "./agent-middleware";

export const MAX_PAGE_SIZE = 25;
export const DEFAULT_PAGE_SIZE = 20;

function normalizeWallet(wallet: unknown): string | null {
  return typeof wallet === "string" && /^0x[0-9a-fA-F]{40}$/.test(wallet)
    ? wallet.toLowerCase()
    : null;
}

function parseListQuery(req: Request) {
  const filterRaw = typeof req.query.filter === "string" ? req.query.filter : "all";
  const filter = isActivityFilter(filterRaw) ? filterRaw : "all";
  const page = Math.max(0, parseInt(String(req.query.page ?? "0"), 10) || 0);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(req.query.pageSize ?? String(DEFAULT_PAGE_SIZE)), 10) || DEFAULT_PAGE_SIZE),
  );
  return { filter, page, pageSize };
}

export async function queryActivityForWallet(
  wallet: string,
  filter: ReturnType<typeof parseListQuery>["filter"],
  page: number,
  pageSize: number,
) {
  let query = db
    .from("obscura_activity")
    .select("*")
    .contains("participants", [wallet])
    .order("block_number", { ascending: false })
    .range(page * pageSize, page * pageSize + pageSize - 1);

  const allowed = ACTIVITY_EVENT_FILTERS[filter];
  if (allowed.length > 0) {
    query = query.in("event_name", [...allowed]);
  }

  const { data, error } = await query;
  if (error) throw error;

  const items = data ?? [];
  return { items, page, pageSize, hasMore: items.length === pageSize };
}

export const activityRouter = Router();

/**
 * GET /agent/activity — authenticated wallet activity (Bearer agent token)
 */
activityRouter.get(
  "/agent/activity",
  requireAgentToken("activity:read"),
  async (req: Request, res: Response) => {
    const wallet = req.agentToken!.wallet;
    const { filter, page, pageSize } = parseListQuery(req);

    try {
      const result = await queryActivityForWallet(wallet, filter, page, pageSize);
      res.json(result);
    } catch (e) {
      console.error(
        `[activity] agent list failed wallet=${wallet.slice(0, 6)}... error=${(e as Error).message}`,
      );
      res.status(503).json({ error: "Activity feed unavailable" });
    }
  },
);

/**
 * GET /activity/:wallet — legacy path; requires agent token when AGENT_AUTH_LEGACY_PUBLIC=false
 */
activityRouter.get("/activity/:wallet", async (req: Request, res: Response) => {
  const wallet = normalizeWallet(req.params.wallet);
  if (!wallet) {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  const scope = await enforceWalletScopeOrLegacy(req, res, wallet);
  if (scope === "done") return;

  const { filter, page, pageSize } = parseListQuery(req);

  try {
    const result = await queryActivityForWallet(wallet, filter, page, pageSize);
    res.json(result);
  } catch (e) {
    console.error(
      `[activity] list failed wallet=${wallet.slice(0, 6)}...${wallet.slice(-4)} error=${(e as Error).message}`,
    );
    res.status(503).json({ error: "Activity feed unavailable" });
  }
});
