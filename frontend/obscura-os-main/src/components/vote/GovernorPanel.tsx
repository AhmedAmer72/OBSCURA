/**
 * GovernorPanel — Wave 5 Phase 8 (merged into VotePage)
 *
 * Surfaces the deployed OpenZeppelin Governor (0xE480…7186) + TimelockController
 * (0x07b7…9E05) + TreasuryStreamer (0x4af7…0FeD) inside the existing /vote sidebar.
 *
 * Voter weight is read from `voterParticipation(account)` on ObscuraVote V5 — a
 * public counter. Encrypted ballots inside ObscuraVote stay sealed; nothing here
 * decrypts FHE state.
 *
 * This component was extracted from the now-deleted GovernancePage.tsx as part of
 * the architecture refactor — see MASTER_REFACTOR_PLAN.md §2.
 */
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Vote as VoteIcon,
  Plus,
  Shield,
  Clock,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Wallet as WalletIcon,
  Users,
  TimerReset,
} from "lucide-react";
import { useAccount } from "wagmi";
import { encodeFunctionData, formatEther, isAddress } from "viem";
import { toast } from "sonner";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { VoteKpi, vh } from "@/components/harmony/voteHarmonyUi";
import {
  VoteTxConfirmBlock,
  VoteTxSuccess,
  VoteTxSummaryCard,
  VoteTxValueBadge,
  VoteTxWalletProgress,
} from "@/components/vote/VoteTransactionFlow";

import {
  OBSCURA_GOVERNOR_ADDRESS,
  OBSCURA_TIMELOCK_ADDRESS,
  OBSCURA_TREASURY_STREAMER_ADDRESS,
} from "@/abis/ObscuraGovernor";
import {
  useGovernorConfig,
  useGovernorProposals,
  useProposalState,
  useProposalVotes,
  useHasVotedGovernor,
  useGovernorPropose,
  useCastGovernorVote,
  useQueueProposal,
  useExecuteProposal,
  parseProposalDescription,
  type ProposalRow,
} from "@/hooks/useGovernor";
import { useVoterParticipation } from "@/hooks/useProposals";

const ARB_SCAN = "https://sepolia.arbiscan.io";

const stateTone: Record<string, string> = {
  Pending: "border-amber-500/30 bg-amber-500/10 text-amber-900",
  Active: "border-accent/40 bg-accent/15 text-[hsl(var(--success))]",
  Canceled: "hairline bg-muted text-muted-foreground",
  Defeated: "border-destructive/30 bg-destructive/10 text-destructive",
  Succeeded: "border-accent/40 bg-accent/15 text-[hsl(var(--success))]",
  Queued: "border-border bg-muted text-foreground",
  Expired: "hairline bg-muted text-muted-foreground",
  Executed: "border-accent/35 bg-accent/10 text-foreground",
};

const truncate = (addr: string) =>
  addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";

const blocksToHours = (n?: bigint | null) => {
  if (!n) return "—";
  const seconds = Number(n) * 0.25; // Arbitrum Sepolia ~0.25s blocks
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
};

const NotConnected = ({ message }: { message: string }) => (
  <Card className="p-10 text-center">
    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted border border-border mb-3">
      <WalletIcon className="w-5 h-5 text-foreground" />
    </div>
    <div className="font-display text-[15px] text-foreground mb-1">Wallet not connected</div>
    <p className="text-[12px] text-muted-foreground/65 max-w-sm mx-auto">{message}</p>
  </Card>
);


const VotesBar = ({
  forVotes,
  against,
  abstain,
}: {
  forVotes: bigint;
  against: bigint;
  abstain: bigint;
}) => {
  const total = forVotes + against + abstain;
  if (total === 0n) {
    return <div className="text-[11px] text-muted-foreground/55">No votes cast yet.</div>;
  }
  const pct = (n: bigint) => Number((n * 1000n) / total) / 10;
  return (
    <div className="space-y-1.5">
      <div className="flex h-1.5 rounded overflow-hidden bg-muted">
        <div className="bg-foreground/80" style={{ width: `${pct(forVotes)}%` }} />
        <div className="bg-red-500/70" style={{ width: `${pct(against)}%` }} />
        <div className="bg-zinc-500/70" style={{ width: `${pct(abstain)}%` }} />
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground/70 font-mono">
        <span className="text-[hsl(var(--success))]">For {forVotes.toString()}</span>
        <span className="text-destructive">Against {against.toString()}</span>
        <span className="text-muted-foreground">Abstain {abstain.toString()}</span>
      </div>
    </div>
  );
};

const ProposalCard = ({ row, voterWeight }: { row: ProposalRow; voterWeight: string }) => {
  const { label, refetch: refetchState } = useProposalState(row.proposalId);
  const { for: f, against, abstain, refetch: refetchVotes } = useProposalVotes(row.proposalId);
  const { hasVoted, refetch: refetchVoted } = useHasVotedGovernor(row.proposalId);
  const { castVote, isPending: voting } = useCastGovernorVote();
  const { queue, isPending: queueing } = useQueueProposal();
  const { execute, isPending: executing } = useExecuteProposal();
  const [confirmAction, setConfirmAction] = useState<"queue" | "execute" | null>(null);
  const [pendingVoteSupport, setPendingVoteSupport] = useState<0 | 1 | 2 | null>(null);
  const [actionTxHash, setActionTxHash] = useState<string | null>(null);
  const [actionKind, setActionKind] = useState<"vote" | "queue" | "execute" | null>(null);

  const votePhase = voting ? "wallet" as const : actionKind === "vote" && actionTxHash ? "done" as const : "idle" as const;
  const queuePhase = queueing ? "wallet" as const : actionKind === "queue" && actionTxHash ? "done" as const : "idle" as const;
  const executePhase = executing ? "wallet" as const : actionKind === "execute" && actionTxHash ? "done" as const : "idle" as const;

  const supportLabel = (s: 0 | 1 | 2) => (s === 1 ? "For" : s === 0 ? "Against" : "Abstain");
  const ethValuesTotal = row.values.reduce((sum, v) => sum + v, 0n);
  const ethValuesLabel = ethValuesTotal > 0n ? formatEther(ethValuesTotal) : "0";

  const { title, body } = parseProposalDescription(row.description);
  const idStr = `0x${row.proposalId.toString(16).slice(0, 12)}…`;

  const doVote = async (support: 0 | 1 | 2) => {
    try {
      setActionKind("vote");
      setActionTxHash(null);
      const hash = await castVote(row.proposalId, support);
      setActionTxHash(hash);
      toast.success("Vote cast", { description: `tx ${hash.slice(0, 10)}…` });
      setPendingVoteSupport(null);
      refetchVoted();
      refetchVotes();
      refetchState();
    } catch (e) {
      setActionKind(null);
      toast.error("Vote failed", { description: (e as Error).message });
    }
  };

  const doQueue = async () => {
    try {
      setActionKind("queue");
      setActionTxHash(null);
      const hash = await queue(row);
      setActionTxHash(hash);
      toast.success("Queued in timelock", { description: `tx ${hash.slice(0, 10)}…` });
      setConfirmAction(null);
      refetchState();
    } catch (e) {
      setActionKind(null);
      toast.error("Queue failed", { description: (e as Error).message });
    }
  };

  const doExecute = async () => {
    try {
      setActionKind("execute");
      setActionTxHash(null);
      const hash = await execute(row);
      setActionTxHash(hash);
      toast.success("Executed", { description: `tx ${hash.slice(0, 10)}…` });
      setConfirmAction(null);
      refetchState();
    } catch (e) {
      setActionKind(null);
      toast.error("Execute failed", { description: (e as Error).message });
    }
  };

  const lifecycleHint =
    label === "Pending"
      ? "Waiting to become active."
      : label === "Active"
        ? "Cast a public For / Against / Abstain vote."
        : label === "Succeeded"
          ? "Queue into the timelock before execution."
          : label === "Queued"
            ? "Timelock delay must pass, then execute."
            : label === "Executed"
              ? "This proposal has been executed on-chain."
              : label === "Defeated" || label === "Canceled" || label === "Expired"
                ? "No further action available."
                : null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
      <Card className="hairline bg-card p-5 space-y-4 border-border">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono tracking-[0.12em] text-muted-foreground/55">{idStr}</span>
              {label && (
                <Badge variant="outline" className={stateTone[label] ?? "bg-muted/60 text-muted-foreground/70"}>
                  {label}
                </Badge>
              )}
              {hasVoted && (
                <Badge variant="outline" className="border-foreground/20 bg-foreground text-background">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Voted
                </Badge>
              )}
            </div>
            <h3 className="font-display text-[15px] text-foreground leading-snug">{title || "Untitled proposal"}</h3>
            <div className="text-[11px] text-muted-foreground/55 mt-1">
              Proposer{" "}
              <a
                href={`${ARB_SCAN}/address/${row.proposer}`}
                target="_blank"
                rel="noreferrer"
                className="font-mono hover:text-[hsl(var(--success))]"
              >
                {truncate(row.proposer)}
              </a>{" "}
              · ends block {row.voteEnd.toString()}
            </div>
          </div>
        </div>

        {body && (
          <p className="text-[12.5px] text-muted-foreground/80 leading-relaxed whitespace-pre-wrap">{body}</p>
        )}

        {lifecycleHint && (
          <p className="rounded-lg hairline bg-muted/40 px-3 py-2 text-xs text-muted-foreground">{lifecycleHint}</p>
        )}

        {row.calldatas.length > 0 && (
          <details className="rounded-lg hairline bg-muted/30 px-3 py-2 text-xs">
            <summary className="cursor-pointer font-medium text-foreground">Raw calldata ({row.calldatas.length})</summary>
            <div className="mt-2 space-y-2 font-mono text-[10px] text-muted-foreground break-all">
              {row.calldatas.map((data, index) => (
                <p key={index}>{data}</p>
              ))}
            </div>
          </details>
        )}

        <VotesBar forVotes={f} against={against} abstain={abstain} />

        <Separator className="bg-muted/60" />

        {pendingVoteSupport !== null && (
          <VoteTxSummaryCard
            title="Cast Governor vote"
            subtitle="Public on-chain vote — your support choice is visible"
            badges={["public", "gas_only"]}
            valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
            rows={[
              { label: "Proposal", value: title || idStr },
              { label: "Support", value: supportLabel(pendingVoteSupport) },
              { label: "Your weight", value: voterWeight },
            ]}
          >
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => doVote(pendingVoteSupport)} disabled={voting}>
                {voting ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : null}
                Confirm vote
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPendingVoteSupport(null)}>Cancel</Button>
            </div>
            <VoteTxWalletProgress phase={votePhase} txHash={actionKind === "vote" ? actionTxHash : null} />
          </VoteTxSummaryCard>
        )}

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPendingVoteSupport(1)}
              disabled={voting || hasVoted || label !== "Active" || pendingVoteSupport !== null}
              className="border-foreground/30 text-foreground hover:bg-muted/60"
            >
              For
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPendingVoteSupport(0)}
              disabled={voting || hasVoted || label !== "Active" || pendingVoteSupport !== null}
              className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            >
              Against
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPendingVoteSupport(2)}
              disabled={voting || hasVoted || label !== "Active" || pendingVoteSupport !== null}
            >
              Abstain
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {label === "Succeeded" && confirmAction !== "queue" && (
              <Button size="sm" onClick={() => setConfirmAction("queue")} disabled={queueing}>
                Review queue
              </Button>
            )}
            {label === "Succeeded" && confirmAction === "queue" && (
              <div className="w-full space-y-2">
                <VoteTxSummaryCard
                  title="Queue in timelock"
                  subtitle="Starts the 2-day delay before execution is allowed"
                  badges={["public", "gas_only"]}
                  valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
                  rows={[
                    { label: "Proposal", value: title || idStr },
                    { label: "Actions", value: `${row.targets.length} target(s)` },
                    { label: "ETH values total", value: `${ethValuesLabel} ETH` },
                    { label: "Timelock", value: "2 days after queue" },
                  ]}
                />
                <VoteTxConfirmBlock
                  title="Queue proposal?"
                  message="This schedules the proposal in the TimelockController. Execution becomes available after the delay."
                  confirmLabel={queueing ? "Queueing…" : "Confirm queue"}
                  onConfirm={doQueue}
                  onCancel={() => setConfirmAction(null)}
                  loading={queueing}
                  disabled={queueing}
                />
                <VoteTxWalletProgress phase={queuePhase} txHash={actionKind === "queue" ? actionTxHash : null} />
              </div>
            )}
            {label === "Queued" && confirmAction !== "execute" && (
              <Button size="sm" onClick={() => setConfirmAction("execute")} disabled={executing}>
                Review execute
              </Button>
            )}
            {label === "Queued" && confirmAction === "execute" && (
              <div className="w-full space-y-2">
                <VoteTxSummaryCard
                  title="Execute Governor proposal"
                  subtitle="Irreversible on-chain actions will run through the timelock"
                  badges={["irreversible", "public"]}
                  valueBadge={<VoteTxValueBadge sendEth={ethValuesTotal > 0n ? ethValuesLabel : undefined} gasNote="network gas only" />}
                  rows={[
                    { label: "Proposal", value: title || idStr },
                    { label: "Targets", value: row.targets.map(truncate).join(", ") },
                    { label: "ETH values total", value: `${ethValuesLabel} ETH` },
                    { label: "State", value: "Queued · timelock elapsed required" },
                  ]}
                />
                <VoteTxConfirmBlock
                  title="Execute irreversible action?"
                  message={`This will execute ${row.calldatas.length} on-chain action(s) with ${ethValuesLabel} ETH total value.`}
                  confirmLabel={executing ? "Executing…" : "Confirm execute"}
                  onConfirm={doExecute}
                  onCancel={() => setConfirmAction(null)}
                  loading={executing}
                  disabled={executing}
                  destructive
                />
                <VoteTxWalletProgress phase={executePhase} txHash={actionKind === "execute" ? actionTxHash : null} />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const TREASURY_STREAMER_ABI_FRAG = [
  {
    type: "function",
    stateMutability: "nonpayable",
    name: "openStream",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "ratePerSecond", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
    ],
    outputs: [],
  },
] as const;

const NewProposalForm = ({ onCreated }: { onCreated: () => void }) => {
  const { isConnected } = useAccount();
  const { propose, isPending, txHash: proposeTxHash } = useGovernorPropose();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [recipient, setRecipient] = useState("");
  const [ratePerSecond, setRatePerSecond] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [showReview, setShowReview] = useState(false);

  const proposePhase = isPending ? "wallet" as const : proposeTxHash ? "done" as const : "idle" as const;

  const description = useMemo(() => {
    const t = title.trim();
    const b = body.trim();
    return b ? `${t}\n\n${b}` : t;
  }, [title, body]);

  const canSubmit = useMemo(() => {
    if (!isConnected || !title.trim()) return false;
    if (!isAddress(recipient)) return false;
    if (!/^\d+$/.test(ratePerSecond) || ratePerSecond === "0") return false;
    if (!/^\d+$/.test(startTime) || !/^\d+$/.test(endTime)) return false;
    return BigInt(endTime) > BigInt(startTime);
  }, [isConnected, title, recipient, ratePerSecond, startTime, endTime]);

  const submit = async () => {
    if (!canSubmit) return;
    setShowReview(false);
    const calldata = encodeFunctionData({
      abi: TREASURY_STREAMER_ABI_FRAG,
      functionName: "openStream",
      args: [
        recipient as `0x${string}`,
        BigInt(ratePerSecond),
        BigInt(startTime),
        BigInt(endTime),
      ],
    });
    try {
      const hash = await propose({
        targets: [OBSCURA_TREASURY_STREAMER_ADDRESS],
        values: [0n],
        calldatas: [calldata],
        description,
      });
      toast.success("Proposal submitted", { description: `tx ${hash.slice(0, 10)}…` });
      setTitle("");
      setBody("");
      setRecipient("");
      setRatePerSecond("");
      setStartTime("");
      setEndTime("");
      onCreated();
    } catch (e) {
      toast.error("Propose failed", { description: (e as Error).message });
    }
  };

  const streamDurationSec = startTime && endTime && BigInt(endTime) > BigInt(startTime)
    ? Number(BigInt(endTime) - BigInt(startTime))
    : 0;
  const totalStreamUnits = ratePerSecond && streamDurationSec
    ? (BigInt(ratePerSecond) * BigInt(streamDurationSec)).toString()
    : "—";

  if (!isConnected) {
    return <NotConnected message="Connect your wallet to create a treasury proposal." />;
  }

  return (
    <Card className="p-5 space-y-4">
      <div>
        <h3 className="font-display text-[15px] text-foreground">Open a treasury stream</h3>
        <p className="text-[11.5px] text-muted-foreground/65 mt-1 leading-relaxed">
          Drafts a Governor proposal that — once approved and the 2-day timelock clears — calls{" "}
          <span className="font-mono text-foreground/70">openStream</span> on the Treasury Streamer (
          <span className="font-mono">{truncate(OBSCURA_TREASURY_STREAMER_ADDRESS)}</span>). No funds move until execution.
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">Title</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Stream 10k ocUSDC to grants committee"
        />
      </div>

      <div className="space-y-2">
        <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">Body</label>
        <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3} placeholder="Rationale, links, risk notes…" />
      </div>

      <Separator className="bg-muted/60" />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">Recipient address</label>
          <Input
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            placeholder="0x…"
            className="font-mono text-[12px]"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">
            Rate per second (raw ocUSDC units)
          </label>
          <Input
            value={ratePerSecond}
            onChange={(e) => setRatePerSecond(e.target.value.replace(/[^\d]/g, ""))}
            placeholder="100000"
            className="font-mono"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">Start timestamp (unix)</label>
          <Input
            value={startTime}
            onChange={(e) => setStartTime(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={String(Math.floor(Date.now() / 1000))}
            className="font-mono"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <label className="text-[11px] tracking-[0.14em] uppercase text-muted-foreground/60">End timestamp (unix)</label>
          <Input
            value={endTime}
            onChange={(e) => setEndTime(e.target.value.replace(/[^\d]/g, ""))}
            placeholder={String(Math.floor(Date.now() / 1000) + 30 * 86400)}
            className="font-mono"
          />
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="text-[11px] text-muted-foreground/55 max-w-md leading-relaxed">
          Voting weight is your <span className="text-foreground/80">on-chain participation</span> — a public count. Your
          encrypted ballots in Vote stay sealed.
        </p>
        {!showReview ? (
          <Button onClick={() => setShowReview(true)} disabled={!canSubmit || isPending}>
            Review proposal
          </Button>
        ) : (
          <Button variant="ghost" onClick={() => setShowReview(false)}>Edit</Button>
        )}
      </div>

      {showReview && canSubmit && (
        <VoteTxSummaryCard
          title="Submit Governor proposal"
          subtitle="Creates a public proposal — funds move only after vote, queue, and timelock"
          badges={["public", "gas_only"]}
          valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
          rows={[
            { label: "Title", value: title.trim() },
            { label: "Recipient", value: truncate(recipient), mono: true },
            { label: "Stream rate / sec", value: ratePerSecond },
            { label: "Start / end", value: `${startTime} → ${endTime}` },
            { label: "Total stream (approx)", value: totalStreamUnits },
            { label: "Target", value: truncate(OBSCURA_TREASURY_STREAMER_ADDRESS), mono: true },
            { label: "ETH value", value: "0 ETH" },
          ]}
        >
          <Button onClick={submit} disabled={!canSubmit || isPending}>
            {isPending ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-2" />
                Confirm submit
              </>
            )}
          </Button>
          <VoteTxWalletProgress phase={proposePhase} txHash={proposeTxHash} />
          {proposePhase === "done" && proposeTxHash && (
            <VoteTxSuccess title="Proposal submitted" message="Your Governor proposal is live for voting." txHash={proposeTxHash} />
          )}
        </VoteTxSummaryCard>
      )}
    </Card>
  );
};

export function GovernorPanel({
  wrongNetwork = false,
  view = "proposals",
  onSwitchToNew,
}: {
  wrongNetwork?: boolean;
  view?: "proposals" | "new";
  onSwitchToNew?: () => void;
}) {
  const { isConnected, address } = useAccount();
  const cfg = useGovernorConfig();
  const { proposals, isLoading, refresh } = useGovernorProposals();
  const participation = useVoterParticipation(address);

  const yourWeight =
    (participation.data as bigint | undefined) !== undefined ? (participation.data as bigint).toString() : "—";

  return (
    <div className={vh.panel}>
      {wrongNetwork && (
        <Card className="rounded-xl border border-amber-500/30 bg-amber-500/8 p-4">
          <div className="flex items-center gap-2 text-sm text-amber-900">
            <AlertCircle className="w-4 h-4" />
            Wrong network. Please switch to <span className="font-mono">Arbitrum Sepolia (421614)</span>.
          </div>
        </Card>
      )}

      <div className={vh.kpiGrid}>
        <VoteKpi
          icon={Clock}
          label="Voting period"
          value={blocksToHours(cfg.votingPeriod)}
          sub={cfg.votingPeriod ? `${cfg.votingPeriod.toString()} blocks` : "—"}
        />
        <VoteKpi
          icon={Shield}
          label="Quorum"
          value={cfg.quorum ? `${cfg.quorum.toString()} votes` : "—"}
          sub="Adjustable via governance"
        />
        <VoteKpi icon={TimerReset} label="Timelock delay" value="2 days" sub={truncate(OBSCURA_TIMELOCK_ADDRESS)} />
        <VoteKpi
          icon={Users}
          label="Your voting weight"
          value={yourWeight}
          sub={isConnected ? "From on-chain participation" : "Connect to view"}
        />
      </div>

      <div className={`${vh.section} p-5 grid grid-cols-1 gap-4 md:grid-cols-3`}>
        <div className="space-y-1">
          <p className={vh.label}>Governor</p>
          <a href={`${ARB_SCAN}/address/${OBSCURA_GOVERNOR_ADDRESS}`} target="_blank" rel="noreferrer" className={vh.link}>
            {truncate(OBSCURA_GOVERNOR_ADDRESS)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-1">
          <p className={vh.label}>Timelock</p>
          <a href={`${ARB_SCAN}/address/${OBSCURA_TIMELOCK_ADDRESS}`} target="_blank" rel="noreferrer" className={vh.link}>
            {truncate(OBSCURA_TIMELOCK_ADDRESS)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <div className="space-y-1">
          <p className={vh.label}>Treasury streamer</p>
          <a
            href={`${ARB_SCAN}/address/${OBSCURA_TREASURY_STREAMER_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className={vh.link}
          >
            {truncate(OBSCURA_TREASURY_STREAMER_ADDRESS)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {view === "proposals" && (
        <div className="space-y-3">
          {isLoading && proposals.length === 0 && (
            <div className={`${vh.empty} text-sm text-muted-foreground`}>
              <Loader2 className="mb-2 inline h-4 w-4 animate-spin" />
              Loading proposals from chain…
            </div>
          )}

          {!isLoading && proposals.length === 0 && (
            <div className={vh.empty}>
              <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-muted">
                <VoteIcon className="h-5 w-5 text-foreground" />
              </div>
              <p className="font-display text-lg text-foreground">No proposals yet</p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
                Be the first to propose a treasury action. Switch to{" "}
                <button
                  type="button"
                  onClick={() => onSwitchToNew?.()}
                  className="font-medium text-[hsl(var(--success))] hover:underline"
                >
                  New proposal
                </button>
                .
              </p>
            </div>
          )}

          {proposals.map((p) => (
            <ProposalCard key={p.proposalId.toString()} row={p} voterWeight={yourWeight} />
          ))}
        </div>
      )}

      {view === "new" && <NewProposalForm onCreated={refresh} />}

      <p className="pt-2 text-center text-sm text-muted-foreground">
        Public executable governance · TimelockController ·{" "}
        <span className="text-foreground/65">2-day delay</span> ·{" "}
        <span className="text-foreground/80">private proposals stay separate</span>
      </p>
    </div>
  );
}

export default GovernorPanel;
