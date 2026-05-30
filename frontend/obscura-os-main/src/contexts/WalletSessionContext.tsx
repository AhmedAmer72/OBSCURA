import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAccount, useSignMessage } from "wagmi";
import { toast } from "sonner";
import {
  type AppWalletSession,
  broadcastSessionCleared,
  buildAppSessionMessage,
  clearAppWalletSession,
  createAppWalletSession,
  readAppWalletSession,
  sessionNeedsRefresh,
  subscribeAppSessionSync,
  writeAppWalletSession,
} from "@/lib/walletApiSession";

export type WalletSessionStatus =
  | "disconnected"
  | "checking"
  | "needs_verify"
  | "needs_refresh"
  | "verifying"
  | "ready"
  | "error";

interface WalletSessionContextValue {
  status: WalletSessionStatus;
  session: AppWalletSession | null;
  wallet: string | null;
  isReady: boolean;
  error: string | null;
  verify: () => Promise<void>;
  clearError: () => void;
}

const WalletSessionContext = createContext<WalletSessionContextValue | null>(null);

export function WalletSessionProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const wallet = address?.toLowerCase() ?? null;

  const [status, setStatus] = useState<WalletSessionStatus>("disconnected");
  const [session, setSession] = useState<AppWalletSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const prevWalletRef = useRef<string | null>(null);
  const prevStatusRef = useRef<WalletSessionStatus>("disconnected");
  const verifyInFlightRef = useRef(false);

  const loadSessionForWallet = useCallback((w: string) => {
    const existing = readAppWalletSession(w);
    if (!existing) {
      setSession(null);
      setStatus("needs_verify");
      return;
    }
    setSession(existing);
    setStatus(sessionNeedsRefresh(existing) ? "needs_refresh" : "ready");
  }, []);

  useEffect(() => {
    if (!isConnected || !wallet) {
      setStatus("disconnected");
      setSession(null);
      setError(null);
      prevWalletRef.current = null;
      return;
    }

    if (prevWalletRef.current && prevWalletRef.current !== wallet) {
      clearAppWalletSession(prevWalletRef.current);
      broadcastSessionCleared(prevWalletRef.current);
    }
    prevWalletRef.current = wallet;

    setStatus("checking");
    loadSessionForWallet(wallet);
  }, [isConnected, wallet, loadSessionForWallet]);

  useEffect(() => {
    if (!wallet) return;
    return subscribeAppSessionSync((updatedWallet) => {
      if (updatedWallet !== wallet) return;
      loadSessionForWallet(wallet);
    });
  }, [wallet, loadSessionForWallet]);

  const verify = useCallback(async () => {
    if (!wallet || verifyInFlightRef.current) return;
    verifyInFlightRef.current = true;
    setStatus("verifying");
    setError(null);
    try {
      const issuedAt = Math.floor(Date.now() / 1000);
      const message = buildAppSessionMessage(wallet, issuedAt);
      const signature = await signMessageAsync({ message });
      const next = createAppWalletSession(wallet, signature, issuedAt);
      writeAppWalletSession(next);
      setSession(next);
      setStatus("ready");
      toast.success("Wallet verified — private data unlocked for 7 days");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet verification failed";
      setError(msg);
      setStatus(session ? "needs_refresh" : "needs_verify");
      toast.error(msg);
    } finally {
      verifyInFlightRef.current = false;
    }
  }, [wallet, signMessageAsync, session]);

  const clearError = useCallback(() => setError(null), []);

  // Non-blocking toast when session required (returning users + fresh connect)
  useEffect(() => {
    const prev = prevStatusRef.current;
    prevStatusRef.current = status;

    if (!wallet) return;

    if (status === "needs_verify" && prev !== "needs_verify" && prev !== "verifying") {
      toast("Verify your wallet to unlock private data", {
        description: "One signature · valid for 7 days · use the Sign button next to your wallet",
        action: { label: "Sign now", onClick: () => void verify() },
        duration: 10_000,
      });
    }

    if (status === "needs_refresh" && prev !== "needs_refresh" && prev !== "verifying") {
      toast("Session expiring soon", {
        description: "Tap Renew next to your wallet to keep activity & reputation loading instantly",
        action: { label: "Renew", onClick: () => void verify() },
        duration: 8_000,
      });
    }
  }, [status, wallet, verify]);

  const value = useMemo(
    (): WalletSessionContextValue => ({
      status,
      session,
      wallet,
      isReady: session !== null && (status === "ready" || status === "needs_refresh"),
      error,
      verify,
      clearError,
    }),
    [status, session, wallet, error, verify, clearError],
  );

  return (
    <WalletSessionContext.Provider value={value}>
      {children}
    </WalletSessionContext.Provider>
  );
}

export function useWalletSession(): WalletSessionContextValue {
  const ctx = useContext(WalletSessionContext);
  if (!ctx) {
    throw new Error("useWalletSession must be used within WalletSessionProvider");
  }
  return ctx;
}

export function useWalletSessionOptional(): WalletSessionContextValue | null {
  return useContext(WalletSessionContext);
}
