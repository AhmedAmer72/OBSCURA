import { useState } from "react";
import { Ban, Clock, Loader2, AlertCircle } from "lucide-react";
import { useWriteContract, useAccount, usePublicClient } from "wagmi";
import { arbitrumSepolia } from "viem/chains";
import { OBSCURA_VOTE_ADDRESS, OBSCURA_VOTE_ABI } from "@/config/contracts";
import { useProposalCount, useProposal } from "@/hooks/useProposals";
import { useChainTime } from "@/hooks/useChainTime";
import { useVoteTransactionFlow } from "@/hooks/useVoteTransactionFlow";
import {
  VoteTxConfirmBlock,
  VoteTxSuccess,
  VoteTxSummaryCard,
  VoteTxValueBadge,
  VoteTxWalletProgress,
} from "@/components/vote/VoteTransactionFlow";

function ProposalAdminRow({ index }: { index: number }) {
  const { proposal } = useProposal(BigInt(index));
  const [extendHours, setExtendHours] = useState("24");
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [confirmExtend, setConfirmExtend] = useState(false);

  const cancelFlow = useVoteTransactionFlow();
  const extendFlow = useVoteTransactionFlow();
  const { writeContractAsync: cancelAsync, isPending: cancelling } = useWriteContract();
  const { writeContractAsync: extendAsync, isPending: extending } = useWriteContract();
  const publicClient = usePublicClient();
  const { address } = useAccount();

  const now = useChainTime();

  if (!proposal?.exists || proposal.isCancelled) return null;

  const ended = proposal.deadline <= now;
  const newDeadline = now + BigInt(Number(extendHours) * 3600);

  async function handleCancel() {
    setFeedbackMsg(null);
    setConfirmCancel(false);
    try {
      cancelFlow.startPrepare();
      cancelFlow.startWallet();
      const hash = await cancelAsync({
        address: OBSCURA_VOTE_ADDRESS as `0x${string}`,
        abi: OBSCURA_VOTE_ABI,
        functionName: "cancelProposal",
        args: [BigInt(index)],
        account: address,
        chain: arbitrumSepolia,
        gas: 500_000n,
      });
      cancelFlow.startConfirm(hash);
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Cancel transaction reverted");
      cancelFlow.complete();
      setFeedbackMsg("Proposal cancelled.");
    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Cancel failed";
      cancelFlow.fail(msg);
      setFeedbackMsg(msg);
    }
  }

  async function handleExtend() {
    setFeedbackMsg(null);
    setConfirmExtend(false);
    try {
      extendFlow.startPrepare();
      extendFlow.startWallet();
      const hash = await extendAsync({
        address: OBSCURA_VOTE_ADDRESS as `0x${string}`,
        abi: OBSCURA_VOTE_ABI,
        functionName: "extendDeadline",
        args: [BigInt(index), newDeadline],
        account: address,
        chain: arbitrumSepolia,
        gas: 500_000n,
      });
      extendFlow.startConfirm(hash);
      const receipt = await publicClient!.waitForTransactionReceipt({ hash });
      if (receipt.status !== "success") throw new Error("Extend transaction reverted");
      extendFlow.complete();
      setFeedbackMsg("Deadline extended.");
    } catch (err: unknown) {
      const msg = (err as { shortMessage?: string; message?: string }).shortMessage
        ?? (err as Error).message
        ?? "Extend failed";
      extendFlow.fail(msg);
      setFeedbackMsg(msg);
    }
  }

  return (
    <div className="rounded-xl hairline bg-card p-3 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-xs text-foreground truncate font-medium">
          #{index} — {proposal.title}
        </div>
        <span className={`pay-badge ${
          proposal.isFinalized ? "pay-badge-emerald" : ended ? "pay-badge-amber" : "pay-badge-emerald"
        }`}>
          {proposal.isFinalized ? "Finalized" : ended ? "Ended" : "Active"}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {!proposal.isFinalized && !confirmCancel && (
          <button
            type="button"
            onClick={() => setConfirmCancel(true)}
            disabled={cancelling}
            className="btn-pay btn-pay-ghost flex items-center gap-1 text-xs px-3 py-1.5 text-red-400 hover:text-red-300 border-red-500/25"
          >
            <Ban className="w-3 h-3" />
            Review cancel
          </button>
        )}

        {!proposal.isFinalized && !ended && !confirmExtend && (
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min="1"
              value={extendHours}
              onChange={(e) => setExtendHours(e.target.value)}
              className="pay-input w-14 py-1 text-center"
            />
            <button
              type="button"
              onClick={() => setConfirmExtend(true)}
              disabled={extending}
              className="btn-pay btn-pay-emerald flex items-center gap-1 text-xs px-3 py-1.5"
            >
              <Clock className="w-3 h-3" />
              Review extend +{extendHours}h
            </button>
          </div>
        )}
      </div>

      {confirmCancel && (
        <>
          <VoteTxSummaryCard
            title="Cancel proposal"
            subtitle="Stops voting immediately — this cannot be undone"
            badges={["irreversible", "gas_only"]}
            valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
            rows={[
              { label: "Proposal", value: `#${index} · ${proposal.title}` },
              { label: "Current deadline", value: new Date(Number(proposal.deadline) * 1000).toLocaleString() },
              { label: "Effect", value: "Proposal marked cancelled · no further votes" },
            ]}
          />
          <VoteTxConfirmBlock
            title="Cancel this proposal?"
            message="Voters will no longer be able to participate. Existing encrypted ballots remain on-chain but the proposal is void."
            confirmLabel={cancelling ? "Cancelling…" : "Confirm cancel"}
            onConfirm={handleCancel}
            onCancel={() => setConfirmCancel(false)}
            loading={cancelling}
            disabled={cancelling}
            destructive
          />
        </>
      )}

      {confirmExtend && (
        <>
          <VoteTxSummaryCard
            title="Extend voting deadline"
            subtitle="Gives voters more time before the proposal ends"
            badges={["gas_only"]}
            valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
            rows={[
              { label: "Proposal", value: `#${index} · ${proposal.title}` },
              { label: "Current deadline", value: new Date(Number(proposal.deadline) * 1000).toLocaleString() },
              { label: "Extension", value: `+${extendHours} hours` },
              { label: "New deadline", value: new Date(Number(newDeadline) * 1000).toLocaleString() },
            ]}
          />
          <VoteTxConfirmBlock
            title="Extend deadline?"
            message={`Move the close time forward by ${extendHours} hours.`}
            confirmLabel={extending ? "Extending…" : "Confirm extend"}
            onConfirm={handleExtend}
            onCancel={() => setConfirmExtend(false)}
            loading={extending}
            disabled={extending}
          />
        </>
      )}

      {cancelFlow.phase !== "idle" && (
        <VoteTxWalletProgress phase={cancelFlow.phase} txHash={cancelFlow.txHash} error={cancelFlow.error ?? feedbackMsg} />
      )}
      {extendFlow.phase !== "idle" && (
        <VoteTxWalletProgress phase={extendFlow.phase} txHash={extendFlow.txHash} error={extendFlow.error ?? feedbackMsg} />
      )}

      {cancelFlow.phase === "done" && cancelFlow.txHash && (
        <VoteTxSuccess title="Proposal cancelled" txHash={cancelFlow.txHash} />
      )}
      {extendFlow.phase === "done" && extendFlow.txHash && (
        <VoteTxSuccess title="Deadline extended" txHash={extendFlow.txHash} />
      )}

      {feedbackMsg && cancelFlow.phase === "error" && (
        <div className="text-xs flex items-center gap-1 text-red-400">
          <AlertCircle className="w-3 h-3" />
          {feedbackMsg}
        </div>
      )}
    </div>
  );
}

export default function AdminControls() {
  const { data: count } = useProposalCount();
  const proposalCount = Number(count ?? 0);

  if (proposalCount === 0) {
    return (
      <div className="space-y-5 p-6 text-center">
        <p className="text-sm text-muted-foreground">No proposals to manage.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-700/10 border border-amber-500/25 flex items-center justify-center shrink-0">
          <Ban className="w-4 h-4 text-amber-400" />
        </div>
        <div className="min-w-0">
          <h3 className="font-display text-sm font-semibold text-foreground leading-tight">Proposal Management</h3>
          <p className="text-[10px] text-muted-foreground/45 tracking-widest mt-0.5 uppercase">Admin controls</p>
        </div>
        <span className="ml-auto shrink-0 pay-badge pay-badge-amber">Admin</span>
      </div>
      <div className="space-y-2">
        {Array.from({ length: proposalCount }, (_, i) => (
          <ProposalAdminRow key={i} index={i} />
        ))}
      </div>
    </div>
  );
}
