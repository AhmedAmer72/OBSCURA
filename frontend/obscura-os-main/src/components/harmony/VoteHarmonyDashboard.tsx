import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  FileText,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { useProposalCount } from "@/hooks/useProposals";
import { useReputationSummary } from "@/hooks/useReputationSummary";
import { usePendingReward } from "@/hooks/useRewards";
import { VoteKpi, vh } from "@/components/harmony/voteHarmonyUi";

const TIER_LABEL: Record<string, string> = {
  new: "New",
  active: "Active",
  steady: "Steady",
  reliable: "Reliable",
};

export function VoteHarmonyDashboard({
  onVote,
  onParticipation,
  onOpenProposals,
  onCreate,
}: {
  onVote: () => void;
  onParticipation: () => void;
  onOpenProposals: () => void;
  onCreate?: () => void;
}) {
  const { isConnected, address } = useAccount();
  const { summary, isLoading: repLoading } = useReputationSummary();
  const { data: count, isLoading: countLoading } = useProposalCount();
  const { data: pendingRewardWei } = usePendingReward(address);
  const totalProposals = Number(count ?? 0);
  const pendingEth =
    pendingRewardWei != null && pendingRewardWei > 0n
      ? Number(formatEther(pendingRewardWei)).toFixed(3)
      : null;

  const tierLabel =
    !isConnected || repLoading ? "—" : TIER_LABEL[summary?.tier ?? "new"];
  const scoreLabel =
    !isConnected || repLoading ? "—" : String(summary?.totalCappedWeight ?? 0);
  const proposalLabel = countLoading ? "…" : String(totalProposals);

  return (
    <div className="vote-harmony-panel space-y-6">
      <section className="dash-card p-5 sm:p-8">
        <div className={`${vh.kpiGrid}`}>
          <VoteKpi
            icon={FileText}
            label="Proposals"
            value={proposalLabel}
            sub="Active proposals listed below"
          />
          <VoteKpi icon={Award} label="Reputation tier" value={tierLabel} sub="Shared Pay signals" />
          <VoteKpi icon={TrendingUp} label="Participation score" value={scoreLabel} sub="Aggregate only" />
          <VoteKpi icon={ShieldCheck} label="Privacy mode" value="Encrypted" sub="Reveal on demand" />
        </div>
      </section>

      {pendingEth ? (
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
        >
          <p className="dash-eyebrow text-amber-800">Rewards pending</p>
          <p className="mt-2 font-display text-2xl font-semibold text-amber-950">
            {pendingEth} ETH in rewards pending
          </p>
          <p className="mt-2 text-sm text-amber-900/80">
            Claim after each finalized vote — go to Rewards.
          </p>
          <button type="button" onClick={onParticipation} className="dash-btn-primary mt-4 h-9 px-4 text-xs">
            Claim rewards
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </motion.section>
      ) : null}

      <div className="dash-card p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Recommended next step</p>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              {totalProposals === 0
                ? "No proposals yet. Create one to start private governance, or check back soon."
                : "Review open proposals and cast your encrypted ballot before deadlines pass."}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={onVote} className="dash-btn-primary h-9 px-3 text-xs">
              Vote now
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            {onCreate && (
              <button type="button" onClick={onCreate} className="dash-btn-outline h-9 px-3 text-xs">
                Create proposal
              </button>
            )}
            <button type="button" onClick={onParticipation} className="dash-btn-outline h-9 px-3 text-xs">
              Claim rewards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
