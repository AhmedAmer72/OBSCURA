import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Lock,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CHAIN_NAME, EXPLORER_URL, FHEStepStatus } from "@/lib/constants";
import FHEStepper from "@/components/shared/FHEStepper";
import type { VoteDecryptPhase, VoteTxPhase } from "@/hooks/useVoteTransactionFlow";

export type VoteTxBadge = "private" | "public" | "gas_only" | "irreversible" | "fhe_read";

export type VoteTxSummaryRow = {
  label: string;
  value: ReactNode;
  mono?: boolean;
};

const BADGE_LABELS: Record<VoteTxBadge, string> = {
  private: "Private",
  public: "Public",
  gas_only: "Gas only",
  irreversible: "Irreversible",
  fhe_read: "FHE read",
};

const WALLET_STEPS: { key: VoteTxPhase; label: string; hint: string }[] = [
  { key: "prepare", label: "Prepare", hint: "Validate inputs and build transaction" },
  { key: "wallet", label: "Wallet", hint: "Confirm in your wallet" },
  { key: "confirm", label: "On-chain", hint: "Waiting for block confirmation" },
  { key: "done", label: "Done", hint: "Transaction complete" },
];

const DECRYPT_STEPS: { key: VoteDecryptPhase; label: string; hint: string }[] = [
  { key: "authorize", label: "Authorize", hint: "Grant local decryption permission" },
  { key: "fetch", label: "Fetch", hint: "Read encrypted on-chain data" },
  { key: "decrypt", label: "Decrypt", hint: "Decrypt locally in your browser" },
  { key: "done", label: "Ready", hint: "Result available" },
];

function phaseIndex(steps: { key: string }[], phase: string): number {
  const idx = steps.findIndex((s) => s.key === phase);
  return idx >= 0 ? idx : -1;
}

export function VoteTxLink({ hash, className }: { hash?: string | null; className?: string }) {
  if (!hash) return null;
  return (
    <a
      href={`${EXPLORER_URL}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-[hsl(var(--dash-forest))] hover:underline",
        className,
      )}
    >
      View on Arbiscan <ExternalLink className="h-3 w-3" />
    </a>
  );
}

export function VoteTxValueBadge({
  sendEth,
  receiveEth,
  gasNote = "plus network gas",
}: {
  sendEth?: string | null;
  receiveEth?: string | null;
  gasNote?: string;
}) {
  let label = "0 ETH";
  if (sendEth) label = `Send ${sendEth} ETH`;
  else if (receiveEth) label = `Receive ${receiveEth} ETH`;

  return (
    <div className="rounded-xl border border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.55)] px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--dash-forest)/0.72)]">
        Transaction value
      </p>
      <p className="mt-0.5 text-sm font-semibold text-foreground">
        {label}
        {!sendEth && !receiveEth ? ` + ${gasNote}` : ` · ${gasNote}`}
      </p>
    </div>
  );
}

export function VoteTxSummaryCard({
  title,
  subtitle,
  badges = [],
  rows,
  valueBadge,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  badges?: VoteTxBadge[];
  rows: VoteTxSummaryRow[];
  valueBadge?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("vote-tx-summary rounded-2xl border p-4 sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{CHAIN_NAME}</p>
          <h4 className="mt-1 font-display text-base font-semibold text-foreground">{title}</h4>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {badges.map((b) => (
            <span
              key={b}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                b === "irreversible"
                  ? "border-amber-500/35 bg-amber-500/10 text-amber-900"
                  : b === "private" || b === "fhe_read"
                    ? "border-[hsl(var(--dash-forest)/0.28)] bg-[hsl(var(--dash-mint))] text-[hsl(var(--dash-forest))]"
                    : "border-border bg-white text-muted-foreground",
              )}
            >
              {BADGE_LABELS[b]}
            </span>
          ))}
        </div>
      </div>

      {valueBadge ? <div className="mt-4">{valueBadge}</div> : null}

      <dl className="mt-4 space-y-2.5">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-3 rounded-xl border border-[hsl(var(--dash-forest)/0.1)] bg-white px-3 py-2.5 shadow-[var(--dash-shadow-input)]"
          >
            <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{row.label}</dt>
            <dd className={cn("text-right text-sm text-foreground", row.mono && "font-mono text-xs")}>{row.value}</dd>
          </div>
        ))}
      </dl>

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

function StepRow({
  steps,
  currentPhase,
  error,
  className,
}: {
  steps: { key: string; label: string; hint: string }[];
  currentPhase: string;
  error?: string | null;
  className?: string;
}) {
  const idx = phaseIndex(steps, currentPhase);
  const isError = currentPhase === "error";

  if (currentPhase === "idle") return null;

  return (
    <div
      className={cn(
        "vote-tx-stepper rounded-xl border p-3 sm:p-4",
        isError ? "border-destructive/30 bg-destructive/5" : "border-[hsl(var(--dash-forest)/0.14)] bg-white",
        className,
      )}
    >
      <div className="grid grid-cols-4 gap-1.5">
        {steps.map((step, i) => {
          const done = !isError && idx > i;
          const active = !isError && idx === i;
          return (
            <div key={step.key} className="min-w-0 text-center">
              <div
                className={cn(
                  "mx-auto grid h-8 w-8 place-items-center rounded-full border",
                  done && "border-[hsl(var(--dash-forest))] bg-[hsl(var(--dash-forest))] text-[hsl(96_18%_97%)]",
                  active && "border-[hsl(var(--dash-forest))] bg-[hsl(var(--dash-mint))] text-[hsl(var(--dash-forest))]",
                  !done && !active && "border-border bg-muted/40 text-muted-foreground",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="text-[11px] font-semibold">{i + 1}</span>
                )}
              </div>
              <p className={cn("mt-1.5 text-[10px] font-semibold uppercase tracking-wide", active ? "text-foreground" : "text-muted-foreground")}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>
      {idx >= 0 && !isError && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{steps[idx]?.label}</span>
          {" · "}
          {steps[idx]?.hint}
        </p>
      )}
      {isError && error ? (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function VoteTxWalletProgress({
  phase,
  error,
  txHash,
  className,
}: {
  phase: VoteTxPhase;
  error?: string | null;
  txHash?: string | null;
  className?: string;
}) {
  if (phase === "idle") return null;
  return (
    <div className={cn("space-y-2", className)}>
      <StepRow steps={WALLET_STEPS} currentPhase={phase} error={error} />
      {txHash ? <VoteTxLink hash={txHash} /> : null}
    </div>
  );
}

export function VoteTxDecryptProgress({
  phase,
  error,
  className,
}: {
  phase: VoteDecryptPhase;
  error?: string | null;
  className?: string;
}) {
  if (phase === "idle") return null;
  return <StepRow steps={DECRYPT_STEPS} currentPhase={phase} error={error} className={className} />;
}

export function VoteTxFHEProgress({
  status,
  error,
  className,
}: {
  status: FHEStepStatus;
  error?: string | null;
  className?: string;
}) {
  if (status === FHEStepStatus.IDLE) return null;
  return <FHEStepper status={status} error={error ?? undefined} className={className} />;
}

export function VoteTxSuccess({
  title,
  message,
  txHash,
  children,
}: {
  title: string;
  message?: string;
  txHash?: string | null;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="vote-tx-success rounded-2xl border-2 border-[hsl(var(--dash-forest)/0.35)] bg-white p-4 shadow-[var(--dash-surface-shadow-sm)] sm:p-5"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--dash-forest))] text-[hsl(96_18%_97%)]">
          <ShieldCheck className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-foreground">{title}</p>
          {message ? <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message}</p> : null}
          {txHash ? (
            <div className="mt-3">
              <VoteTxLink hash={txHash} />
            </div>
          ) : null}
          {children ? <div className="mt-3">{children}</div> : null}
        </div>
      </div>
    </motion.div>
  );
}

export function VoteTxConfirmBlock({
  title,
  message,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  disabled,
  loading,
  destructive,
}: {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
  loading?: boolean;
  destructive?: boolean;
}) {
  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <div className="mt-2 text-sm text-muted-foreground">{message}</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onConfirm}
          disabled={disabled || loading}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center rounded-full px-4 text-sm font-semibold disabled:opacity-50",
            destructive
              ? "bg-destructive text-destructive-foreground"
              : "bg-[hsl(var(--dash-forest))] text-[hsl(96_18%_97%)] hover:bg-[hsl(var(--dash-forest-hover))]",
          )}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : confirmLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium hover:bg-muted/50"
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}

/** Compact inline status for buttons area */
export function VoteTxInlineStatus({
  phase,
  label,
  txHash,
}: {
  phase: VoteTxPhase;
  label?: string;
  txHash?: string | null;
}) {
  if (phase === "idle" || phase === "done") return null;
  const icons = {
    prepare: Lock,
    wallet: Wallet,
    confirm: Send,
    error: AlertCircle,
  } as const;
  const Icon = phase === "error" ? icons.error : icons[phase as keyof typeof icons] ?? Loader2;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Icon className={cn("h-3.5 w-3.5", phase === "error" ? "text-destructive" : "text-[hsl(var(--dash-forest))]")} />
      <span>{label ?? phase}</span>
      {txHash ? <VoteTxLink hash={txHash} /> : null}
    </div>
  );
}

export function VoteTransactionFlowPanel({
  summary,
  walletPhase,
  walletError,
  txHash,
  fheStatus,
  fheError,
  decryptPhase,
  decryptError,
  success,
}: {
  summary?: ReactNode;
  walletPhase?: VoteTxPhase;
  walletError?: string | null;
  txHash?: string | null;
  fheStatus?: FHEStepStatus;
  fheError?: string | null;
  decryptPhase?: VoteDecryptPhase;
  decryptError?: string | null;
  success?: ReactNode;
}) {
  return (
    <AnimatePresence mode="wait">
      <div className="vote-tx-flow space-y-3">
        {summary}
        {fheStatus && fheStatus !== FHEStepStatus.IDLE ? (
          <VoteTxFHEProgress status={fheStatus} error={fheError} />
        ) : null}
        {decryptPhase && decryptPhase !== "idle" ? (
          <VoteTxDecryptProgress phase={decryptPhase} error={decryptError} />
        ) : null}
        {walletPhase && walletPhase !== "idle" ? (
          <VoteTxWalletProgress phase={walletPhase} error={walletError} txHash={txHash} />
        ) : null}
        {success}
      </div>
    </AnimatePresence>
  );
}
