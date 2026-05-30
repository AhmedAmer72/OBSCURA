import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { fetchAgentApi, getAgentToken } from "@/lib/agentToken";

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
  needsAgentToken: boolean;
}

export function useReputationSummary(): UseReputationSummaryResult {
  const { address } = useAccount();
  const wallet = address?.toLowerCase() ?? null;
  const [summary, setSummary] = useState<ReputationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshNonce, setRefreshNonce] = useState(0);
  const [lastFetchedAt, setLastFetchedAt] = useState<string | null>(null);
  const [needsAgentToken, setNeedsAgentToken] = useState(false);

  const refresh = useCallback(() => {
    setRefreshNonce((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!wallet) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      setLastFetchedAt(null);
      setNeedsAgentToken(false);
      return;
    }

    if (!getAgentToken()) {
      setSummary(null);
      setError(null);
      setIsLoading(false);
      setNeedsAgentToken(true);
      return;
    }

    setNeedsAgentToken(false);
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    fetchAgentApi<ReputationSummary>("/agent/reputation", { signal: controller.signal })
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
  }, [wallet, refreshNonce]);

  useEffect(() => {
    if (!wallet || !getAgentToken()) return;
    const id = window.setInterval(refresh, 60_000);
    return () => window.clearInterval(id);
  }, [wallet, refresh]);

  return { summary, isLoading, error, refresh, lastFetchedAt, needsAgentToken };
}
