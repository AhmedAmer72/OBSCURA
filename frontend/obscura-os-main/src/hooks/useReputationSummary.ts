import { useCallback, useEffect, useState } from "react";
import { useWalletSession } from "@/contexts/WalletSessionContext";
import { fetchWithAppSession } from "@/lib/walletApiSession";

export interface ReputationSignalSummary {
  label: string;
  count: number;
  cappedWeight: number;
  latestAt: string | null;
}

export interface ReputationSummary {
  wallet: string;
  sourceApp: "all" | "pay" | "credit" | "vote";
  totalCappedWeight: number;
  tier: "new" | "active" | "steady" | "reliable";
  signals: Record<string, ReputationSignalSummary>;
  sources?: Record<string, number>;
  updatedAt: string | null;
}

interface UseReputationSummaryResult {
  summary: ReputationSummary | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => void;
  lastFetchedAt: string | null;
  awaitingSession: boolean;
}

export function useReputationSummary(): UseReputationSummaryResult {
  const { wallet, session, isReady } = useWalletSession();
  const [summary, setSummary] = useState<ReputationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setRefreshNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!wallet || !session || !isReady) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      setLastFetchedAt(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchWithAppSession<ReputationSummary>(`/reputation/${wallet}`, session, {
      signal: controller.signal,
    })
      .then((next) => {
        setSummary(next);
        setLastFetchedAt(new Date().toISOString());
      })
      .catch((err: Error) => {
        if (err.name !== "AbortError") setError(err.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [wallet, session, isReady, refreshNonce]);

  useEffect(() => {
    if (!isReady || !wallet) return;
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [wallet, isReady, refresh]);

  return {
    summary,
    isLoading,
    error,
    refresh,
    lastFetchedAt,
    awaitingSession: Boolean(wallet) && !isReady,
  };
}
