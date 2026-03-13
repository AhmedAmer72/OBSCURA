import { useCallback, useMemo, useState } from "react";
import { FHEStepStatus } from "@/lib/constants";

/** Wallet transaction lifecycle phases (non-FHE writes). */
export type VoteTxPhase = "idle" | "prepare" | "wallet" | "confirm" | "done" | "error";

/** Local decrypt / read lifecycle (no on-chain write). */
export type VoteDecryptPhase = "idle" | "authorize" | "fetch" | "decrypt" | "done" | "error";

export function useVoteTransactionFlow() {
  const [phase, setPhase] = useState<VoteTxPhase>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setTxHash(null);
    setError(null);
  }, []);

  const startPrepare = useCallback(() => {
    setError(null);
    setPhase("prepare");
  }, []);

  const startWallet = useCallback(() => {
    setPhase("wallet");
  }, []);

  const startConfirm = useCallback((hash: string) => {
    setTxHash(hash);
    setPhase("confirm");
  }, []);

  const complete = useCallback(() => {
    setPhase("done");
  }, []);

  const fail = useCallback((message: string) => {
    setError(message);
    setPhase("error");
  }, []);

  const isActive = phase !== "idle" && phase !== "done" && phase !== "error";

  return {
    phase,
    txHash,
    error,
    isActive,
    reset,
    startPrepare,
    startWallet,
    startConfirm,
    complete,
    fail,
    setPhase,
    setError,
    setTxHash,
  };
}

export function useVoteDecryptFlow() {
  const [phase, setPhase] = useState<VoteDecryptPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setPhase("idle");
    setError(null);
  }, []);

  const startAuthorize = useCallback(() => {
    setError(null);
    setPhase("authorize");
  }, []);

  const startFetch = useCallback(() => setPhase("fetch"), []);
  const startDecrypt = useCallback(() => setPhase("decrypt"), []);
  const complete = useCallback(() => setPhase("done"), []);
  const fail = useCallback((message: string) => {
    setError(message);
    setPhase("error");
  }, []);

  return {
    phase,
    error,
    reset,
    startAuthorize,
    startFetch,
    startDecrypt,
    complete,
    fail,
    setPhase,
  };
}

/** Map FHEStepStatus to wallet stepper index for hybrid displays. */
export function fheStatusToWalletPhase(status: FHEStepStatus): VoteTxPhase {
  switch (status) {
    case FHEStepStatus.ENCRYPTING:
    case FHEStepStatus.COMPUTING:
      return "prepare";
    case FHEStepStatus.SENDING:
      return "wallet";
    case FHEStepStatus.SETTLING:
      return "confirm";
    case FHEStepStatus.READY:
      return "done";
    case FHEStepStatus.ERROR:
      return "error";
    default:
      return "idle";
  }
}

export function mapFheToDecryptPhase(status: FHEStepStatus): VoteDecryptPhase {
  switch (status) {
    case FHEStepStatus.ENCRYPTING:
      return "authorize";
    case FHEStepStatus.COMPUTING:
      return "fetch";
    case FHEStepStatus.SENDING:
    case FHEStepStatus.SETTLING:
      return "decrypt";
    case FHEStepStatus.READY:
      return "done";
    case FHEStepStatus.ERROR:
      return "error";
    default:
      return "idle";
  }
}

export function useWalletPhaseFromFlags(opts: {
  isPending?: boolean;
  isConfirming?: boolean;
  isSuccess?: boolean;
  error?: string | null;
  txHash?: string | null;
}): VoteTxPhase {
  return useMemo(() => {
    if (opts.error) return "error";
    if (opts.isSuccess) return "done";
    if (opts.isConfirming && opts.txHash) return "confirm";
    if (opts.isPending) return "wallet";
    if (opts.txHash && !opts.isSuccess && !opts.isConfirming) return "confirm";
    return "idle";
  }, [opts.error, opts.isSuccess, opts.isConfirming, opts.isPending, opts.txHash]);
}
