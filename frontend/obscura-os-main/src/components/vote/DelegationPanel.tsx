import { useState } from "react";
import { useAccount } from "wagmi";
import {
  Users, ArrowRight, XCircle, Loader2, CheckCircle, AlertCircle,
  ExternalLink, Scale, Copy, Check, ChevronDown, ChevronUp, Shield, Eye,
} from "lucide-react";
import {
  useDelegateTo, useVoteWeight, useDelegationWrite, useDelegators,
} from "@/hooks/useDelegation";
import { VoteSection, vh } from "@/components/harmony/voteHarmonyUi";
import { useWalletPhaseFromFlags } from "@/hooks/useVoteTransactionFlow";
import {
  VoteTxSuccess,
  VoteTxSummaryCard,
  VoteTxValueBadge,
  VoteTxWalletProgress,
} from "@/components/vote/VoteTransactionFlow";

const ARBISCAN = "https://sepolia.arbiscan.io";
const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function shortAddr(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Deterministic gradient avatar from address */
function AddrAvatar({ addr, size = 40 }: { addr: string; size?: number }) {
  const seed = parseInt(addr.slice(2, 10), 16);
  const hue1 = seed % 360;
  const hue2 = (seed * 137) % 360;
  return (
    <div
      className="rounded-full shrink-0 flex items-center justify-center font-bold text-muted-foreground/80 text-xs"
      style={{
        width: size, height: size,
        background: `linear-gradient(135deg, hsl(${hue1},65%,40%), hsl(${hue2},70%,30%))`,
      }}
    >
      {addr.slice(2, 4).toUpperCase()}
    </div>
  );
}

function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
      className="text-muted-foreground/40 hover:text-muted-foreground/80 transition-colors"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-foreground" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  );
}

function DelegatorRow({ addr, index }: { addr: `0x${string}`; index: number }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0">
      <span className="text-[10px] text-muted-foreground/30 font-mono w-5 text-right shrink-0">{index + 1}</span>
      <AddrAvatar addr={addr} size={28} />
      <div className="flex-1 min-w-0">
        <span className="font-mono text-[13px] text-foreground/80">{shortAddr(addr)}</span>
      </div>
      <CopyBtn text={addr} />
      <a
        href={`${ARBISCAN}/address/${addr}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
      >
        <ExternalLink className="w-3.5 h-3.5" />
      </a>
    </div>
  );
}

export function DelegationPanel() {
  const { address } = useAccount();
  const [showHowTo, setShowHowTo] = useState(false);
  const [confirmDelegate, setConfirmDelegate] = useState(false);
  const [confirmUndelegate, setConfirmUndelegate] = useState(false);
  const [lastAction, setLastAction] = useState<"delegate" | "undelegate" | null>(null);

  const { data: currentDelegatee, refetch: refetchDelegatee } = useDelegateTo(address);
  const { data: voteWeight, refetch: refetchWeight } = useVoteWeight(address);
  const { delegators, isLoading: loadingDelegators } = useDelegators(address);

  const {
    delegateeInput, setDelegateeInput,
    txHash, isConfirming, error,
    handleDelegate, handleUndelegate,
    isPending, isSuccess,
  } = useDelegationWrite();

  const hasDelegated =
    !!currentDelegatee &&
    currentDelegatee !== ZERO_ADDR;

  const effectiveWeight = voteWeight !== undefined ? Number(voteWeight) : 1;

  const walletPhase = useWalletPhaseFromFlags({
    isPending,
    isConfirming,
    isSuccess,
    error,
    txHash,
  });

  async function onDelegate() {
    setLastAction("delegate");
    setConfirmDelegate(false);
    await handleDelegate();
    refetchDelegatee();
    refetchWeight();
  }
  async function onUndelegate() {
    setLastAction("undelegate");
    setConfirmUndelegate(false);
    await handleUndelegate();
    refetchDelegatee();
    refetchWeight();
  }

  if (!address) {
    return (
      <div className="space-y-5 p-8 text-center">
        <Users className="w-8 h-8 text-muted-foreground/20 mx-auto mb-3" />
        <p className="text-[13px] text-muted-foreground/50">Connect your wallet to manage delegation.</p>
      </div>
    );
  }

  return (
    <div className={vh.panel}>

      {/* ── Profile header ─────────────────────────────────────── */}
      <div className={`${vh.section} p-5`}>
        <div className="flex items-start gap-4">
          <AddrAvatar addr={address} size={52} />
          <div className="flex-1 min-w-0">
            <p className={`${vh.label} mb-1`}>Your profile</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[15px] text-foreground font-semibold">
                {shortAddr(address)}
              </span>
              <CopyBtn text={address} />
              <a
                href={`${ARBISCAN}/address/${address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground/30 hover:text-muted-foreground/70 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 mt-3">
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-display text-xl font-bold text-foreground">{effectiveWeight}</span>
                </div>
                <p className={`${vh.label} mt-1`}>Vote weight</p>
              </div>
              <div className="w-px bg-muted self-stretch" />
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-foreground" />
                  <span className="font-display text-xl font-bold text-[hsl(var(--success))]">
                    {loadingDelegators ? "…" : delegators.length}
                  </span>
                </div>
                <p className={`${vh.label} mt-1`}>Delegators</p>
              </div>
              <div className="w-px bg-muted self-stretch" />
              <div className="text-center">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-display text-xl font-bold text-foreground">
                    {hasDelegated ? "Delegated" : "Direct"}
                  </span>
                </div>
                <p className={`${vh.label} mt-1`}>Voting mode</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Current delegation target ───────────────────────────── */}
      <VoteSection title="Delegating to">

        {hasDelegated ? (
          <div className="p-5">
            <div className="flex items-center gap-4">
              <AddrAvatar addr={currentDelegatee as string} size={44} />
              <div className="flex-1 min-w-0">
                <div className="font-mono text-[14px] text-foreground/90 font-medium">
                  {shortAddr(currentDelegatee as string)}
                </div>
                <div className="text-[11px] text-amber-400/60 mt-0.5">Active delegate</div>
                <div className="flex items-center gap-3 mt-1">
                  <CopyBtn text={currentDelegatee as string} />
                  <a
                    href={`${ARBISCAN}/address/${currentDelegatee}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-muted-foreground/40 hover:text-muted-foreground/70 flex items-center gap-1 transition-colors"
                  >
                    View on Arbiscan <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
              <button
                onClick={() => setConfirmUndelegate(true)}
                disabled={isPending || isConfirming || confirmUndelegate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-500/25 bg-red-500/[0.07] text-[12px] text-red-400 hover:bg-red-500/15 transition-colors disabled:opacity-50 shrink-0"
              >
                {isPending || isConfirming
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <XCircle className="h-3.5 w-3.5" />}
                Remove delegation
              </button>
            </div>
            {confirmUndelegate && (
              <VoteTxSummaryCard
                title="Remove delegation"
                subtitle="You will vote directly again with your own weight"
                badges={["public", "gas_only"]}
                valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
                rows={[
                  { label: "Current delegate", value: shortAddr(currentDelegatee as string), mono: true },
                  { label: "Your vote weight", value: String(effectiveWeight) },
                  { label: "After removal", value: "Direct voting mode" },
                ]}
              >
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={onUndelegate}
                    disabled={isPending || isConfirming}
                    className={`${vh.btnPrimary} disabled:opacity-50`}
                  >
                    {isPending || isConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                    Confirm remove
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmUndelegate(false)}
                    className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </VoteTxSummaryCard>
            )}
            {(walletPhase !== "idle" && lastAction === "undelegate") && (
              <VoteTxWalletProgress phase={walletPhase} txHash={txHash} error={error} />
            )}
            {isSuccess && txHash && lastAction === "undelegate" && walletPhase === "done" && (
              <VoteTxSuccess title="Delegation removed" message="You can now cast votes directly from this wallet." txHash={txHash} />
            )}
            <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/[0.05] border border-amber-500/15">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400/70 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-300/50 leading-snug">
                While delegated, you cannot vote directly. Remove delegation to vote yourself.
              </p>
            </div>
          </div>
        ) : (
          <div className="p-5 flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border bg-white">
              <Shield className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-foreground/80">Voting directly</div>
              <div className="text-[11px] text-muted-foreground/50 mt-0.5">
                You cast your own votes. Delegate below to let a representative vote for you.
              </div>
            </div>
          </div>
        )}
      </VoteSection>

      <VoteSection title={hasDelegated ? "Change delegate" : "Set delegate"}>
        <div className="space-y-3">
          <p className={vh.body}>
            Enter any wallet address. That address will cast votes using your weight added to theirs.
            Chains are blocked — your delegate cannot re-delegate.
          </p>

          {/* Privacy disclosure */}
          <div className={vh.noticeWarn}>
            <Eye className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" />
            <div className="space-y-2">
              <p><span className="font-medium">Delegation is public by design.</span> The contract must know your delegatee’s address to add your weight to their votes. Your actual <span className="font-medium">vote choice remains fully private.</span></p>
              <p className="text-amber-900/80">Use a separate wallet if you want to hide the link between your identity and your delegate.</p>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={delegateeInput}
              onChange={(e) => { setDelegateeInput(e.target.value); setConfirmDelegate(false); }}
              placeholder="0x… delegate address"
              className="flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground focus:border-ring focus:outline-none"
            />
            <button
              onClick={() => setConfirmDelegate(true)}
              disabled={isPending || isConfirming || !delegateeInput.trim() || confirmDelegate}
              className={`${vh.btnPrimary} disabled:opacity-50`}
            >
              <ArrowRight className="h-3.5 w-3.5" />
              Review delegate
            </button>
          </div>

          {confirmDelegate && delegateeInput.trim() && (
            <VoteTxSummaryCard
              title={hasDelegated ? "Change delegate" : "Delegate voting power"}
              subtitle="Your delegate will vote with your weight added to theirs"
              badges={["public", "gas_only"]}
              valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
              rows={[
                { label: "Delegate address", value: delegateeInput.trim().slice(0, 10) + "…" + delegateeInput.trim().slice(-4), mono: true },
                { label: "Your vote weight", value: String(effectiveWeight) },
                { label: "Voting mode", value: "Delegated — you cannot vote directly while active" },
              ]}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDelegate}
                  disabled={isPending || isConfirming}
                  className={`${vh.btnPrimary} disabled:opacity-50`}
                >
                  {isPending || isConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ArrowRight className="h-3.5 w-3.5" />}
                  Confirm delegate
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelegate(false)}
                  className="rounded-full border border-border bg-white px-4 py-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </VoteTxSummaryCard>
          )}

          {(walletPhase !== "idle" && lastAction === "delegate") && (
            <VoteTxWalletProgress phase={walletPhase} txHash={txHash} error={error} />
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/[0.07] px-3 py-2 text-[12px] text-red-400">
              <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          {isSuccess && txHash && !error && lastAction === "delegate" && walletPhase === "done" && (
            <VoteTxSuccess title="Delegation updated" message="Your voting power is now delegated." txHash={txHash} />
          )}
        </div>
      </VoteSection>

      <VoteSection
        title="Delegated to you"
        action={
          <span className={delegators.length > 0 ? vh.badgeOk : vh.badgeMuted}>
            {loadingDelegators ? "…" : delegators.length}
          </span>
        }
      >
        {loadingDelegators ? (
          <div className="flex items-center justify-center gap-2 py-8 text-[12px] text-muted-foreground/40">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading delegators…
          </div>
        ) : delegators.length === 0 ? (
          <div className="p-6 text-center">
            <Users className="w-7 h-7 text-muted-foreground/15 mx-auto mb-2" />
            <p className="text-[12px] text-muted-foreground/40">No one has delegated to you yet.</p>
          </div>
        ) : (
          <div>
            {delegators.map((d, i) => (
              <DelegatorRow key={d} addr={d} index={i} />
            ))}
          </div>
        )}
      </VoteSection>

      <div className={vh.section}>
        <button
          onClick={() => setShowHowTo((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3.5 text-left hover:bg-muted transition-colors"
        >
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-muted-foreground/40" />
            <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/50 font-mono">
              How Delegation Works
            </span>
          </div>
          {showHowTo
            ? <ChevronUp className="w-4 h-4 text-muted-foreground/30" />
            : <ChevronDown className="w-4 h-4 text-muted-foreground/30" />}
        </button>

        {showHowTo && (
          <ul className="px-5 pb-4 text-[12px] text-muted-foreground/50 space-y-2 leading-relaxed border-t border-border pt-3">
            <li>• Delegate to any address — they vote with your weight added to theirs.</li>
            <li>• Delegation chains are blocked (A→B→C is not allowed).</li>
            <li>• Your vote privacy is still preserved — only vote direction is hidden on-chain.</li>
            <li>• You can change or remove your delegation at any time before a vote deadline.</li>
            <li>• Already-cast votes are not retroactively changed when delegation changes.</li>
          </ul>
        )}
      </div>
    </div>
  );
}

