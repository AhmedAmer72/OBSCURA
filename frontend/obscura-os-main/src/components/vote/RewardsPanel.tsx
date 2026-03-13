import { useState } from "react";
import { useAccount } from "wagmi";
import { motion } from "framer-motion";
import {
  Gift, Coins, Lock, CheckCircle, AlertCircle,
  Loader2, ExternalLink, Info, Trophy,
} from "lucide-react";
import { formatEther } from "viem";
import {
  useRewardPoolBalance,
  useRewardPerVote,
  usePendingReward,
  useRewardAccrued,
  useWithdrawalRequested,
  useAccrueReward,
  useRequestWithdrawal,
  useWithdrawReward,
  useFundRewards,
} from "@/hooks/useRewards";
import { useProposalCount, useProposal, useHasVoted } from "@/hooks/useProposals";
import { VoteKpi, VoteNotice, VoteTabs, vh } from "@/components/harmony/voteHarmonyUi";
import { useWalletPhaseFromFlags } from "@/hooks/useVoteTransactionFlow";
import {
  VoteTxSuccess,
  VoteTxSummaryCard,
  VoteTxValueBadge,
  VoteTxWalletProgress,
} from "@/components/vote/VoteTransactionFlow";

const ARBISCAN = "https://sepolia.arbiscan.io";
const REWARD_PER_VOTE_ETH = "0.001"; // 1_000_000 gwei

function TxLink({ hash }: { hash?: `0x${string}` }) {
  if (!hash) return null;
  return (
    <a href={`${ARBISCAN}/tx/${hash}`} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-foreground hover:underline text-xs">
      View tx <ExternalLink className="h-3 w-3" />
    </a>
  );
}

// ─── Single proposal reward row ────────────────────────────────────────────

function ProposalRewardRow({
  proposalId,
  voterAddress,
}: {
  proposalId: number;
  voterAddress: `0x${string}`;
}) {
  const { proposal } = useProposal(BigInt(proposalId));
  const { data: hasVoted } = useHasVoted(BigInt(proposalId), voterAddress);
  const { data: accruedAlready } = useRewardAccrued(BigInt(proposalId), voterAddress);
  const { accrue, isPending, isConfirming, isSuccess, txHash, error } = useAccrueReward();
  const [showClaimReview, setShowClaimReview] = useState(false);
  const claimPhase = useWalletPhaseFromFlags({
    isPending,
    isConfirming,
    isSuccess,
    error,
    txHash,
  });

  // Only show finalized proposals where user voted
  if (!proposal?.exists || !proposal.isFinalized || proposal.isCancelled) return null;
  if (!hasVoted) return null;

  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm text-foreground truncate">#{proposalId} — {proposal.title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">Reward: {REWARD_PER_VOTE_ETH} ETH</p>
      </div>
      <div className="shrink-0">
        {accruedAlready ? (
          <span className="flex items-center gap-1 text-xs text-foreground">
            <CheckCircle className="h-3.5 w-3.5" /> Accrued
          </span>
        ) : isSuccess && claimPhase === "done" ? (
          <VoteTxSuccess title="Reward accrued" message={`${REWARD_PER_VOTE_ETH} ETH added to your encrypted balance.`} txHash={txHash} />
        ) : showClaimReview ? (
          <div className="space-y-2 text-right">
            <VoteTxSummaryCard
              title="Claim vote reward"
              subtitle="Accrues reward for this finalized proposal into your encrypted balance"
              badges={["private", "gas_only"]}
              valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
              rows={[
                { label: "Proposal", value: `#${proposalId} · ${proposal.title}` },
                { label: "Reward amount", value: `${REWARD_PER_VOTE_ETH} ETH` },
              ]}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowClaimReview(false); void accrue(BigInt(proposalId)); }}
                disabled={isPending || isConfirming}
                className={`${vh.btnPrimary} px-3 py-1 text-xs disabled:opacity-50`}
              >
                {isPending || isConfirming ? <Loader2 className="h-3 w-3 animate-spin" /> : <Coins className="h-3 w-3" />}
                Confirm claim
              </button>
              <button type="button" onClick={() => setShowClaimReview(false)} className="text-xs text-muted-foreground hover:text-foreground">
                Cancel
              </button>
            </div>
            <VoteTxWalletProgress phase={claimPhase} txHash={txHash} error={error} />
          </div>
        ) : (
          <button
            onClick={() => setShowClaimReview(true)}
            disabled={isPending || isConfirming}
            className={`${vh.btnPrimary} px-3 py-1 text-xs disabled:opacity-50`}
          >
            <Coins className="h-3 w-3" />
            Review claim
          </button>
        )}
        {error && <p className="text-xs text-red-400 mt-0.5">{error.slice(0, 60)}</p>}
      </div>
    </div>
  );
}

// ─── Main Panel ────────────────────────────────────────────────────────────

export function RewardsPanel() {
  const { address, isConnected } = useAccount();
  const { data: poolWei } = useRewardPoolBalance();
  const { data: pendingWei, refetch: refetchPending } = usePendingReward(address);
  const { data: withdrawalReady, refetch: refetchWithdrawal } = useWithdrawalRequested(address);
  const { data: count } = useProposalCount();
  const proposalCount = Number(count ?? 0);

  const { request, isPending: requesting, isConfirming: requestConfirming, txHash: requestTx, error: requestErr, isSuccess: requestSuccess } = useRequestWithdrawal();
  const { withdrawReward, isPending: withdrawing, isConfirming: withdrawConfirming, txHash: withdrawTx, error: withdrawErr, isSuccess: withdrawSuccess } = useWithdrawReward();
  const { fund, isPending: funding, isConfirming: fundConfirming, txHash: fundTx, error: fundErr, isSuccess: fundSuccess } = useFundRewards();

  const [fundInput, setFundInput] = useState("");
  const [activeTab, setActiveTab] = useState<"earn" | "withdraw" | "fund">("earn");
  const [tabMessage, setTabMessage] = useState<string | null>(null);
  const [showRequestReview, setShowRequestReview] = useState(false);
  const [showWithdrawReview, setShowWithdrawReview] = useState(false);
  const [showFundReview, setShowFundReview] = useState(false);

  const requestPhase = useWalletPhaseFromFlags({
    isPending: requesting,
    isConfirming: requestConfirming,
    isSuccess: requestSuccess,
    error: requestErr,
    txHash: requestTx,
  });
  const withdrawPhase = useWalletPhaseFromFlags({
    isPending: withdrawing,
    isConfirming: withdrawConfirming,
    isSuccess: withdrawSuccess,
    error: withdrawErr,
    txHash: withdrawTx,
  });
  const fundPhase = useWalletPhaseFromFlags({
    isPending: funding,
    isConfirming: fundConfirming,
    isSuccess: fundSuccess,
    error: fundErr,
    txHash: fundTx,
  });

  const poolEth = poolWei ? parseFloat(formatEther(poolWei as bigint)).toFixed(4) : "0";
  const pendingEth = pendingWei ? parseFloat(formatEther(pendingWei as bigint)).toFixed(4) : "0";
  const hasPending = pendingWei && (pendingWei as bigint) > 0n;
  const poolInsufficient = hasPending && poolWei !== undefined && (poolWei as bigint) < (pendingWei as bigint);

  const selectTab = (tab: "earn" | "withdraw" | "fund") => {
    setActiveTab(tab);
    if (tab === "earn") {
      setTabMessage("Reward claims appear after you vote privately and that proposal is finalized.");
    } else if (tab === "withdraw") {
      setTabMessage(hasPending ? "Reveal your encrypted reward balance before withdrawing." : "No reward balance is ready to withdraw yet.");
    } else {
      setTabMessage("Funding adds ETH to the shared voter reward pool.");
    }
  };

  return (
    <div className={vh.panel}>
      <div className="rounded-2xl border-2 border-foreground bg-white p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Voter incentives</p>
            <p className="mt-1 font-display text-2xl font-semibold text-foreground">{REWARD_PER_VOTE_ETH} ETH per vote</p>
            <p className="mt-1 text-sm text-foreground/70">Claim after each proposal you voted on is finalized.</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Your pending balance</p>
            <p className="font-display text-xl font-semibold text-foreground">{isConnected ? `${pendingEth} ETH` : "—"}</p>
          </div>
        </div>
      </div>

      <div className={vh.kpiGrid2}>
        <VoteKpi icon={Gift} label="Reward pool" value={`${poolEth} ETH`} />
        <VoteKpi
          icon={Lock}
          label="Pending reward"
          value={isConnected ? `${pendingEth} ETH` : "—"}
          sub="Claimable after accrual"
          iconClass="text-foreground"
        />
      </div>

      <VoteNotice icon={Info}>
        Your accumulated reward balance is stored as a private encrypted value on-chain.
        Nobody can see your total — not other voters, not observers. Reveal and withdrawal are user-triggered.
        You earn <span className={vh.emphasis}>{REWARD_PER_VOTE_ETH} ETH</span> per finalized proposal you voted on.
      </VoteNotice>

      <VoteTabs
        tabs={[
          { key: "earn", label: "Earn rewards" },
          { key: "withdraw", label: "Withdraw" },
          { key: "fund", label: "Fund pool" },
        ]}
        active={activeTab}
        onChange={selectTab}
      />

      {tabMessage && (
        <div className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {tabMessage}
        </div>
      )}

      {/* Earn Rewards */}
      {activeTab === "earn" && (
        <div className="space-y-2">
          {!isConnected ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Connect your wallet to see eligible proposals.</p>
          ) : proposalCount === 0 ? (
            <p className="text-xs text-muted-foreground/50 text-center py-6">No finalized proposals yet.</p>
          ) : (
            <div className={vh.listCard}>
              <p className={`${vh.label} mb-3 flex items-center gap-1.5`}>
                <Trophy className="h-3.5 w-3.5" /> Proposals where you voted
              </p>
              {Array.from({ length: proposalCount }, (_, i) => (
                <ProposalRewardRow key={i} proposalId={i} voterAddress={address!} />
              ))}
              <div className="rounded-lg border border-dashed border-border bg-background/50 px-3 py-3 text-center">
                <p className="text-xs font-medium text-foreground">No reward claim is ready if this list is empty.</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  Vote on an active private proposal, wait for finalization, then return here to claim.
                </p>
              </div>
              <p className="pt-3 text-center text-xs text-muted-foreground/45">
                Eligible finalized proposals appear here after you vote privately.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Withdraw */}
      {activeTab === "withdraw" && (
        <div className="space-y-3">
          {!isConnected ? (
            <p className="text-xs text-muted-foreground/50 text-center py-6">Connect your wallet.</p>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-muted p-4 space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground/50 mb-0.5">Pending Reward</p>
                  <p className="text-2xl font-bold text-foreground">{pendingEth} ETH</p>
                  {!hasPending && (
                    <p className="mt-1 text-xs text-muted-foreground/60">
                      Nothing is withdrawable yet. Finalized proposals you voted on must be claimed first.
                    </p>
                  )}
                </div>

                {/* Step 1: Request withdrawal (triggers FHE.allow for private decryption) */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground/50">Step 1 — Reveal your balance</p>
                  <p className="text-xs text-muted-foreground/30">
                    Grants you Fhenix FHE decryption permission for your encrypted balance. You can then verify the amount via the gateway.
                  </p>
                  {!showRequestReview ? (
                    <button
                      onClick={() => setShowRequestReview(true)}
                      disabled={requesting || requestConfirming || !hasPending || !!withdrawalReady}
                      className={`${vh.btnGhost} disabled:opacity-50`}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      {withdrawalReady ? "Balance revealed" : "Review reveal request"}
                    </button>
                  ) : (
                    <>
                      <VoteTxSummaryCard
                        title="Request withdrawal permission"
                        subtitle="On-chain permission to decrypt your encrypted reward balance locally"
                        badges={["private", "gas_only"]}
                        valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
                        rows={[
                          { label: "Pending balance", value: `${pendingEth} ETH (encrypted)` },
                          { label: "Action", value: "Grant local decrypt permission — no ETH transfer" },
                        ]}
                      />
                      <button
                        onClick={async () => { setShowRequestReview(false); await request(); refetchWithdrawal(); }}
                        disabled={requesting || requestConfirming || !hasPending || !!withdrawalReady}
                        className={`${vh.btnGhost} disabled:opacity-50`}
                      >
                        {requesting || requestConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                        Confirm reveal request
                      </button>
                    </>
                  )}
                  <VoteTxWalletProgress phase={requestPhase} txHash={requestTx} error={requestErr} />
                  {requestSuccess && requestTx && requestPhase === "done" && (
                    <VoteTxSuccess title="Balance revealed" message="You can now withdraw your accrued ETH." txHash={requestTx} />
                  )}
                  {requestErr && <p className="text-xs text-red-400">{requestErr}</p>}
                </div>

                {/* Step 2: Withdraw ETH */}
                {withdrawalReady && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground/50">Step 2 — Collect ETH</p>
                    <p className="text-xs text-muted-foreground/30">
                      Transfers your accrued ETH and atomically zeroes your FHE encrypted balance.
                    </p>
                    {poolInsufficient && (
                      <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5">
                        <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-400/80">
                          <span className="font-semibold text-amber-400">Reward pool is empty.</span>{" "}
                          The pool needs to be funded before you can withdraw. Go to the{" "}
                          <button onClick={() => setActiveTab("fund")} className="underline text-amber-300 hover:text-amber-200">
                            Fund Pool
                          </button>{" "}
                          tab and contribute ETH.
                        </div>
                      </div>
                    )}
                    {!showWithdrawReview ? (
                      <button
                        type="button"
                        onClick={() => setShowWithdrawReview(true)}
                        disabled={withdrawing || withdrawConfirming || !hasPending || !!poolInsufficient}
                        className={`${vh.btnPrimary} disabled:opacity-50`}
                      >
                        <Coins className="h-3.5 w-3.5" />
                        Review withdraw
                      </button>
                    ) : (
                      <>
                        <VoteTxSummaryCard
                          title="Withdraw rewards"
                          subtitle="Receive ETH from the reward pool and zero your encrypted balance"
                          badges={poolInsufficient ? ["public"] : ["public"]}
                          valueBadge={<VoteTxValueBadge receiveEth={pendingEth} gasNote="network gas only" />}
                          rows={[
                            { label: "You receive", value: `${pendingEth} ETH` },
                            { label: "Pool balance", value: `${poolEth} ETH` },
                            { label: "Pool status", value: poolInsufficient ? "Insufficient — fund pool first" : "Sufficient for withdrawal" },
                          ]}
                        />
                        <motion.button
                          onClick={async () => { setShowWithdrawReview(false); await withdrawReward(); refetchPending(); refetchWithdrawal(); }}
                          disabled={withdrawing || withdrawConfirming || !hasPending || !!poolInsufficient}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className={`${vh.btnPrimary} disabled:opacity-50`}
                        >
                          {withdrawing || withdrawConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Coins className="h-3.5 w-3.5" />}
                          Confirm withdraw {pendingEth} ETH
                        </motion.button>
                      </>
                    )}
                    <VoteTxWalletProgress phase={withdrawPhase} txHash={withdrawTx} error={withdrawErr} />
                    {withdrawSuccess && withdrawTx && withdrawPhase === "done" && (
                      <VoteTxSuccess title="Rewards withdrawn" message={`${pendingEth} ETH sent to your wallet.`} txHash={withdrawTx} />
                    )}
                    {withdrawErr && <p className="text-xs text-red-400">{withdrawErr}</p>}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Fund Pool */}
      {activeTab === "fund" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground/50">
            Donate ETH to the voter rewards pool. Funds are distributed to governance participants.
          </p>
          <div className="flex gap-2">
            <input type="number" step="0.001" placeholder="ETH amount (e.g. 0.1)"
              value={fundInput} onChange={e => { setFundInput(e.target.value); setShowFundReview(false); }}
              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/40 focus:outline-none" />
            <button
              type="button"
              onClick={() => setShowFundReview(true)}
              disabled={funding || fundConfirming || !fundInput}
              className={`${vh.btnPrimary} disabled:opacity-50`}>
              <Gift className="h-3.5 w-3.5" />
              Review fund
            </button>
          </div>
          {showFundReview && fundInput && (
            <VoteTxSummaryCard
              title="Fund reward pool"
              subtitle="Send ETH to the shared voter incentives pool"
              badges={["public"]}
              valueBadge={<VoteTxValueBadge sendEth={fundInput} gasNote="network gas only" />}
              rows={[
                { label: "You send", value: `${fundInput} ETH` },
                { label: "Current pool", value: `${poolEth} ETH` },
              ]}
            >
              <button
                type="button"
                onClick={() => { setShowFundReview(false); void fund(fundInput); }}
                disabled={funding || fundConfirming}
                className={`${vh.btnPrimary} disabled:opacity-50`}
              >
                {funding || fundConfirming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Gift className="h-3.5 w-3.5" />}
                Confirm fund
              </button>
            </VoteTxSummaryCard>
          )}
          {fundErr && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{fundErr}</p>}
          <VoteTxWalletProgress phase={fundPhase} txHash={fundTx} error={fundErr} />
          {fundSuccess && fundTx && fundPhase === "done" && (
            <VoteTxSuccess title="Pool funded" message={`${fundInput || "ETH"} added to the reward pool.`} txHash={fundTx} />
          )}
        </div>
      )}
    </div>
  );
}
