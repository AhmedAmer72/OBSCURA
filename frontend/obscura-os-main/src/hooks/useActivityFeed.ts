/**
 * useActivityFeed.ts — Wallet session authenticated activity via Obscura API
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAccount } from "wagmi";
import { useWalletSession } from "@/contexts/WalletSessionContext";
import { fetchWithAppSession } from "@/lib/walletApiSession";

const POLL_INTERVAL = 30_000;
const PAGE_SIZE       = 20;

export type ActivityEventType =
  | "all"
  | "sent"
  | "received"
  | "stream"
  | "invoice"
  | "escrow"
  | "stealth"
  | "credit"
  | "vote";

export interface ActivityItem {
  id:               number;
  chain_id:         number;
  block_number:     string;
  tx_hash:          string;
  log_index:        number;
  contract_address: string;
  event_name:       string;
  wallet:           string;
  participants:     string[];
  args:             Record<string, unknown>;
  created_at:       string;
}

export type ActivityRealtimeStatus = "idle" | "connecting" | "listening" | "polling" | "error";

const creditContractEventNames = (
  prefixes: string[],
  events: string[],
) => prefixes.flatMap((prefix) => events.map((event) => `${prefix}.${event}`));

const CREDIT_MARKET_PREFIXES = [
  "CreditMarket",
  "CreditMarket2",
  "CreditMarket3",
  "CreditMarket4",
  "CreditMarket5",
  "ObscuraCreditMarket",
];
const CREDIT_VAULT_PREFIXES = ["CreditVault", "CreditVault2", "ObscuraCreditVault"];
const CREDIT_AUCTION_PREFIXES = ["CreditAuction", "ObscuraCreditAuction"];
const CREDIT_SCORE_PREFIXES = ["CreditScore", "ObscuraCreditScoreV2"];

export const CREDIT_ACTIVITY_EVENT_NAMES = [
  ...creditContractEventNames(CREDIT_MARKET_PREFIXES, [
    "Supplied",
    "Withdrew",
    "CollateralSupplied",
    "CollateralWithdrawn",
    "Borrowed",
    "Repaid",
    "LiquidationOpened",
  ]),
  ...creditContractEventNames(CREDIT_VAULT_PREFIXES, ["Deposited", "Withdrew"]),
  ...creditContractEventNames(CREDIT_AUCTION_PREFIXES, ["AuctionOpened", "BidSubmitted", "AuctionSettled"]),
  ...creditContractEventNames(CREDIT_SCORE_PREFIXES, ["ScoreUpdated"]),
];

export const VOTE_ACTIVITY_EVENT_NAMES = [
  ...creditContractEventNames(["ObscuraVote"], [
    "ProposalCreated",
    "VoteCast",
    "VoteChanged",
    "VoteFinalized",
    "ProposalCancelled",
    "DeadlineExtended",
    "DelegateSet",
    "DelegateRemoved",
  ]),
  ...creditContractEventNames(["ObscuraGovernor"], [
    "ProposalCreated",
    "VoteCast",
    "ProposalQueued",
    "ProposalExecuted",
    "ProposalCanceled",
  ]),
  ...creditContractEventNames(["ObscuraTreasury"], [
    "FundsReceived",
    "SpendAttached",
    "FinalizationRecorded",
    "SpendExecuted",
    "TimelockDurationUpdated",
  ]),
  ...creditContractEventNames(["ObscuraRewards"], [
    "RewardAccrued",
    "WithdrawalRequested",
    "RewardWithdrawn",
    "RewardsFunded",
  ]),
];

function eventMatchesAnyPrefix(eventName: string, prefixes: string[]) {
  return prefixes.some((prefix) => eventName === prefix || eventName.startsWith(`${prefix}.`));
}

export function isCreditActivityEvent(eventName: string) {
  return (
    CREDIT_ACTIVITY_EVENT_NAMES.includes(eventName) ||
    eventMatchesAnyPrefix(eventName, [
      ...CREDIT_MARKET_PREFIXES,
      ...CREDIT_VAULT_PREFIXES,
      ...CREDIT_AUCTION_PREFIXES,
      ...CREDIT_SCORE_PREFIXES,
    ])
  );
}

export function isVoteActivityEvent(eventName: string) {
  return (
    VOTE_ACTIVITY_EVENT_NAMES.includes(eventName) ||
    eventMatchesAnyPrefix(eventName, [
      "ObscuraVote",
      "ObscuraGovernor",
      "ObscuraTreasury",
      "ObscuraRewards",
    ])
  );
}

interface UseActivityFeedResult {
  items:      ActivityItem[];
  isLoading:  boolean;
  error:      string | null;
  filter:     ActivityEventType;
  setFilter:  (f: ActivityEventType) => void;
  loadMore:   () => void;
  hasMore:    boolean;
  refresh:    () => void;
  realtimeStatus: ActivityRealtimeStatus;
  lastEventAt: string | null;
  lastRefreshAt: string | null;
  awaitingSession: boolean;
}

export function useActivityFeed(initialFilter: ActivityEventType = "all"): UseActivityFeedResult {
  const { address } = useAccount();
  const wallet = address?.toLowerCase() ?? null;
  const { session, isReady } = useWalletSession();

  const [items,     setItems]     = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [filter,    setFilter]    = useState<ActivityEventType>(initialFilter);
  const [page,      setPage]      = useState(0);
  const [hasMore,   setHasMore]   = useState(false);
  const [realtimeStatus, setRealtimeStatus] = useState<ActivityRealtimeStatus>("idle");
  const [lastEventAt, setLastEventAt] = useState<string | null>(null);
  const [lastRefreshAt, setLastRefreshAt] = useState<string | null>(null);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevTopIdRef = useRef<number | null>(null);

  const fetchPage = useCallback(async (pageIndex: number, replace: boolean) => {
    if (!wallet || !session || !isReady) return;
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      const serverFilter = filter === "credit" || filter === "vote" ? "all" : filter;
      if (serverFilter !== "all") params.set("filter", serverFilter);
      if (pageIndex > 0) params.set("page", String(pageIndex));
      params.set("pageSize", String(PAGE_SIZE));
      const qs = params.toString();
      const data = await fetchWithAppSession<{ items: ActivityItem[]; hasMore: boolean }>(
        `/activity/${wallet}${qs ? `?${qs}` : ""}`,
        session,
      );

      if (replace && data.items[0]?.id && prevTopIdRef.current !== null && data.items[0].id !== prevTopIdRef.current) {
        setLastEventAt(new Date().toISOString());
      }
      if (data.items[0]?.id) prevTopIdRef.current = data.items[0].id;

      setHasMore(data.hasMore);
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setLastRefreshAt(new Date().toISOString());
      setRealtimeStatus("polling");
    } catch (e) {
      setError((e as Error).message);
      setRealtimeStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, [wallet, session, isReady, filter]);

  useEffect(() => {
    if (!wallet || !isReady) {
      setItems([]);
      setRealtimeStatus("idle");
      return;
    }
    setPage(0);
    fetchPage(0, true);
  }, [wallet, isReady, filter, fetchPage]);

  useEffect(() => {
    if (!wallet || !isReady) {
      if (pollRef.current) clearInterval(pollRef.current);
      return;
    }

    pollRef.current = setInterval(() => fetchPage(0, true), POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [wallet, isReady, filter, fetchPage]);

  const loadMore = useCallback(() => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPage(nextPage, false);
  }, [page, fetchPage]);

  const refresh = useCallback(() => {
    setPage(0);
    fetchPage(0, true);
  }, [fetchPage]);

  return useMemo(() => ({
    items, isLoading, error, filter, setFilter, loadMore, hasMore, refresh, realtimeStatus, lastEventAt, lastRefreshAt,
    awaitingSession: Boolean(wallet) && !isReady,
  }), [items, isLoading, error, filter, loadMore, hasMore, refresh, realtimeStatus, lastEventAt, lastRefreshAt, wallet, isReady]);
}
