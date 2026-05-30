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
import { WalletVerifyModal } from "@/components/wallet/WalletVerifyModal";
import { WalletSessionRenewBanner } from "@/components/wallet/WalletSessionRenewBanner";

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
  const [modalOpen, setModalOpen] = useState(false);
  const prevWalletRef = useRef<string | null>(null);
  const verifyInFlightRef = useRef(false);

  const loadSessionForWallet = useCallback((w: string) => {
    const existing = readAppWalletSession(w);
    if (!existing) {
      setSession(null);
      setStatus("needs_verify");
      setModalOpen(true);
      return;
    }
    setSession(existing);
    if (sessionNeedsRefresh(existing)) {
      setStatus("needs_refresh");
      setModalOpen(false);
    } else {
      setStatus("ready");
      setModalOpen(false);
    }
  }, []);

  // Wallet connect / change / disconnect
  useEffect(() => {
    if (!isConnected || !wallet) {
      setStatus("disconnected");
      setSession(null);
      setModalOpen(false);
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

  // Cross-tab sync
  useEffect(() => {
    if (!wallet) return;
    return subscribeAppSessionSync((updatedWallet) => {
      if (updatedWallet !== wallet) return;
      loadSessionForWallet(wallet);
    });
  }, [wallet, loadSessionForWallet]);

  // Proactive refresh when tab becomes visible and session near expiry
  useEffect(() => {
    if (!wallet || status !== "needs_refresh") return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        setModalOpen(true);
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [wallet, status]);

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
      setModalOpen(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Wallet verification failed";
      setError(msg);
      setStatus(session ? "needs_refresh" : "needs_verify");
      setModalOpen(true);
    } finally {
      verifyInFlightRef.current = false;
    }
  }, [wallet, signMessageAsync, session]);

  const clearError = useCallback(() => setError(null), []);

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

  const showModal =
    modalOpen &&
    wallet !== null &&
    (status === "needs_verify" || status === "verifying" || status === "error" ||
      (status === "needs_refresh" && modalOpen));

  return (
    <WalletSessionContext.Provider value={value}>
      <WalletSessionRenewBanner />
      {children}
      <WalletVerifyModal
        open={showModal}
        status={status}
        error={error}
        onVerify={() => void verify()}
        dismissible={status === "needs_refresh"}
        onDismiss={status === "needs_refresh" ? () => setModalOpen(false) : undefined}
      />
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

/** Safe for optional usage outside provider (returns disconnected stub) */
export function useWalletSessionOptional(): WalletSessionContextValue | null {
  return useContext(WalletSessionContext);
}
