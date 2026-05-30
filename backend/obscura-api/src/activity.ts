import { Router, Request, Response } from "express";
import { db } from "./db";
import { ACTIVITY_EVENT_FILTERS, isActivityFilter } from "./activity-filters";

const MAX_PAGE_SIZE = 25;
const DEFAULT_PAGE_SIZE = 20;

function normalizeWallet(wallet: unknown): string | null {
  return typeof wallet === "string" && /^0x[0-9a-fA-F]{40}$/.test(wallet)
    ? wallet.toLowerCase()
    : null;
}

export const activityRouter = Router();

/**
 * GET /activity/:wallet?filter=all&page=0&pageSize=20
 *
 * Wallet-scoped activity feed — service-role query, no client Supabase credentials.
 * Same semantics as SDK ActivityModule (participants filter + event namespaces).
 */
activityRouter.get("/activity/:wallet", async (req: Request, res: Response) => {
  const wallet = normalizeWallet(req.params.wallet);
  if (!wallet) {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  const filterRaw = typeof req.query.filter === "string" ? req.query.filter : "all";
  const filter = isActivityFilter(filterRaw) ? filterRaw : "all";

  const page = Math.max(0, parseInt(String(req.query.page ?? "0"), 10) || 0);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, parseInt(String(req.query.pageSize ?? String(DEFAULT_PAGE_SIZE)), 10) || DEFAULT_PAGE_SIZE),
  );

  try {
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
    res.json({
      items,
      page,
      pageSize,
      hasMore: items.length === pageSize,
    });
  } catch (e) {
    console.error(
      `[activity] list failed wallet=${wallet.slice(0, 6)}...${wallet.slice(-4)} error=${(e as Error).message}`,
    );
    res.status(503).json({ error: "Activity feed unavailable" });
  }
});
