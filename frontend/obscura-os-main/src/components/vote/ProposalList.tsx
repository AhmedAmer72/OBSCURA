import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, RefreshCw, Users, Timer, ArrowRight } from "lucide-react";
import { useWatchContractEvent } from "wagmi";
import { useProposalCount, useProposal, CATEGORY_LABELS } from "@/hooks/useProposals";
import { OBSCURA_VOTE_ABI, OBSCURA_VOTE_ADDRESS } from "@/config/contracts";
import { useChainTime } from "@/hooks/useChainTime";
import { cn } from "@/lib/utils";
import { VoteStatusPill, type VoteProposalStatus } from "@/components/harmony/voteHarmonyUi";

type ProposalStatus = VoteProposalStatus;
type StatusFilter = "all" | ProposalStatus;

function getStatus(deadline: bigint, isFinalized: boolean, isCancelled: boolean, now: bigint): ProposalStatus {
  if (isCancelled) return "cancelled";
  if (isFinalized) return "finalized";
  return now < deadline ? "active" : "ended";
}

function ProposalRowSkeleton() {
  return (
    <div className="vote-proposal-card animate-pulse space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="h-5 w-10 rounded bg-muted" />
        <div className="h-6 w-24 rounded-full bg-muted" />
      </div>
      <div className="h-6 rounded bg-muted w-[88%]" />
      <div className="h-4 rounded bg-muted w-full" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-full bg-muted" />
        <div className="h-5 w-20 rounded-full bg-muted" />
      </div>
      <div className="h-10 rounded-lg bg-muted w-full" />
    </div>
  );
}

function Countdown({ deadline }: { deadline: bigint }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    function update() {
      const now = Math.floor(Date.now() / 1000);
      const diff = Number(deadline) - now;
      if (diff <= 0) { setRemaining("Ended"); return; }
      const d = Math.floor(diff / 86400);
      const h = Math.floor((diff % 86400) / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = diff % 60;
      if (d > 0) setRemaining(`${d}d ${h}h ${m}m`);
      else if (h > 0) setRemaining(`${h}h ${m}m ${s}s`);
      else setRemaining(`${m}m ${s}s`);
    }
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  return <span className="text-foreground font-semibold">{remaining}</span>;
}

function ProposalRow({ proposalId, searchQuery, statusFilter, onVote, now }: { proposalId: bigint; searchQuery: string; statusFilter: StatusFilter; onVote?: (id: number) => void; now: bigint }) {
  const { proposal, isLoading } = useProposal(proposalId);

  if (isLoading || !proposal || !proposal.exists) return null;

  const status = getStatus(proposal.deadline, proposal.isFinalized, proposal.isCancelled, now);

  // Filter by status
  if (statusFilter !== "all" && status !== statusFilter) return null;

  // Filter by search
  if (searchQuery && !proposal.title.toLowerCase().includes(searchQuery.toLowerCase())) return null;

  const deadlineDate = new Date(Number(proposal.deadline) * 1000);
  const catLabel = CATEGORY_LABELS[proposal.category] ?? "General";

  return (
    <motion.article
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("vote-proposal-card", `vote-proposal-card--${status}`)}
    >
      <header className="vote-proposal-card__header">
        <span className="vote-proposal-card__id">#{proposal.id.toString()}</span>
        <VoteStatusPill status={status} />
      </header>

      <h3 className="vote-proposal-card__title">{proposal.title}</h3>

      {proposal.description ? (
        <p className="vote-proposal-card__desc">{proposal.description}</p>
      ) : null}

      <div className="vote-proposal-card__tags">
        <span className="vote-proposal-card__tag">{catLabel}</span>
        <span className="vote-proposal-card__tag">{proposal.numOptions} options</span>
        <span className="vote-proposal-card__tag">
          <Users className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
          {proposal.totalVoters.toString()}
          {proposal.quorum > 0n ? ` / ${proposal.quorum.toString()}` : " voters"}
        </span>
      </div>

      {proposal.quorum > 0n && (
        <div className="vote-proposal-card__quorum space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {proposal.totalVoters.toString()} / {proposal.quorum.toString()} voters
            </span>
            {proposal.totalVoters >= proposal.quorum ? (
              <span className="inline-flex items-center gap-1 font-medium text-[hsl(var(--success))]">
                <CheckCircle2 className="h-3 w-3" aria-hidden />
                Quorum met
              </span>
            ) : (
              <span className="font-medium text-amber-700/90">Quorum needed</span>
            )}
          </div>
          <div className="dash-progress h-1.5">
            <span
              style={{
                width: `${Math.min(Number((proposal.totalVoters * 100n) / proposal.quorum), 100)}%`,
                background:
                  proposal.totalVoters >= proposal.quorum
                    ? "linear-gradient(90deg, hsl(var(--success)), hsl(145 55% 55%))"
                    : "linear-gradient(90deg, hsl(38 80% 50%), hsl(38 90% 60%))",
              }}
            />
          </div>
        </div>
      )}

      <div className="vote-proposal-card__meta">
        <span className="vote-proposal-card__deadline">
          Deadline · {deadlineDate.toLocaleString()}
        </span>
        {status === "active" && (
          <span className="vote-proposal-card__countdown">
            <Timer className="h-3.5 w-3.5 shrink-0" aria-hidden />
            <Countdown deadline={proposal.deadline} />
          </span>
        )}
      </div>

      {status === "active" && onVote && (
        <button
          type="button"
          onClick={() => onVote(Number(proposalId))}
          className="vote-proposal-card__cta dash-btn-primary min-h-[44px] gap-2 text-sm font-semibold"
        >
          Vote privately
          <ArrowRight className="h-4 w-4" />
        </button>
      )}
    </motion.article>
  );
}

export default function ProposalList({
  onVote,
  initialFilter = "active",
  embedded = false,
}: {
  onVote?: (id: number) => void;
  initialFilter?: StatusFilter;
  embedded?: boolean;
}) {
  const { data: count, isLoading, refetch } = useProposalCount();
  const proposalCount = Number(count ?? 0);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(initialFilter);
  const now = useChainTime();

  // Instantly refetch when a new proposal is created on-chain
  useWatchContractEvent({
    address: OBSCURA_VOTE_ADDRESS,
    abi: OBSCURA_VOTE_ABI,
    eventName: 'ProposalCreated',
    onLogs: () => { refetch(); },
  });

  const filters: { key: StatusFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "ended", label: "Ended" },
    { key: "finalized", label: "Finalized" },
    { key: "cancelled", label: "Cancelled" },
  ];

  return (
    <div className="space-y-5">
      {!embedded && (
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted hairline">
            <FileText className="h-4 w-4 text-foreground" />
          </div>
          <div className="min-w-0">
            <h3 className="font-display text-sm font-semibold leading-tight text-foreground">Private proposals</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">Browse, filter, and vote privately</p>
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh proposals"
            className="ml-auto grid h-10 w-10 place-items-center rounded-full hairline text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      {embedded && (
        <button
          type="button"
          onClick={() => refetch()}
          title="Refresh proposals"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      )}

      {/* Search + Filters */}
      <div className="space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search proposals..."
          className="pay-input"
          aria-label="Search proposals"
        />
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={`min-h-[36px] rounded-full border px-3 py-1.5 text-[11px] font-medium transition-all ${
                statusFilter === f.key
                  ? "border-[hsl(var(--success))]/40 bg-[hsl(var(--accent))]/12 text-foreground"
                  : "hairline text-muted-foreground hover:bg-muted/60"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => <ProposalRowSkeleton key={i} />)}
        </div>
      ) : proposalCount === 0 ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <FileText className="w-8 h-8 text-muted-foreground/20" />
          <div className="text-sm text-muted-foreground/60">No proposals yet.</div>
            <div className="text-[11px] text-muted-foreground/40">Create a private proposal when you are ready for voters.</div>
        </div>
      ) : (
        <div className="vote-proposal-list">
          {statusFilter !== "all" && (
            <p className="vote-proposal-filter-hint" role="status">
              Showing {statusFilter} proposals first. If nothing is listed, no {statusFilter} proposal is available for this wallet right now. Use All to review closed history and revealable results.
            </p>
          )}
          {Array.from({ length: proposalCount }, (_, i) => (
            <ProposalRow key={i} proposalId={BigInt(i)} searchQuery={searchQuery} statusFilter={statusFilter} onVote={onVote} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
