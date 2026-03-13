import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Vote, AlertCircle, AlertTriangle, ExternalLink, CheckCircle2, ShieldCheck, Timer, Eye, Users } from "lucide-react";
import { useAccount, useReadContract, usePublicClient, useWalletClient } from "wagmi";
import { useEncryptedVote } from "@/hooks/useEncryptedVote";
import { useProposalCount, useProposal, useProposalOptions, useHasVoted } from "@/hooks/useProposals";
import { OBSCURA_TOKEN_ABI, OBSCURA_TOKEN_ADDRESS, OBSCURA_VOTE_ABI, OBSCURA_VOTE_ADDRESS } from "@/config/contracts";
import { FHEStepStatus } from "@/lib/constants";
import {
  VoteTxFHEProgress,
  VoteTxSummaryCard,
  VoteTxValueBadge,
} from "@/components/vote/VoteTransactionFlow";
import { initFHEClient } from "@/lib/fhe";

import { useChainTime } from "@/hooks/useChainTime";
import { useDelegateTo, useVoteWeight } from "@/hooks/useDelegation";
import { VoteProposalDetailCard } from "@/components/vote/VoteProposalDetailCard";
import { VoteFormField, VotePanelHeader } from "@/components/harmony/voteHarmonyUi";

/** Dropdown option that fetches its own proposal data */
function ProposalOption({ index, now }: { index: number; now: bigint }) {
  const { proposal } = useProposal(BigInt(index));
  const cancelled = proposal?.isCancelled;
  const ended = proposal && (proposal.deadline <= now || proposal.isFinalized);
  const label = proposal?.title
    ? `#${index} — ${proposal.title}${cancelled ? " (cancelled)" : ended ? " (ended)" : ""}`
    : `Proposal #${index}`;
  return <option value={index}>{label}</option>;
}

interface CastVoteFormProps {
  initialProposalId?: string;
  embedded?: boolean;
  onOpenDelegation?: () => void;
}

const getVoteErrorMessage = (error: unknown) => {
  if (error && typeof error === "object") {
    const maybeError = error as { shortMessage?: unknown; message?: unknown };
    if (typeof maybeError.shortMessage === "string") return maybeError.shortMessage;
    if (typeof maybeError.message === "string") return maybeError.message;
  }
  return "Vote failed";
};

export default function CastVoteForm({ initialProposalId = "", embedded = false, onOpenDelegation }: CastVoteFormProps) {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();
  const { castVote, txHash, isTxPending, status, error: fheError, reset } = useEncryptedVote();
  const { data: count } = useProposalCount();
  const proposalCount = Number(count ?? 0);
  const now = useChainTime();

  // Delegation state — must be called before any returns to satisfy Rules of Hooks
  const { data: delegateTo } = useDelegateTo(address);
  const { data: voteWeight } = useVoteWeight(address);
  const hasDelegated = !!delegateTo && delegateTo !== "0x0000000000000000000000000000000000000000";
  const effectiveWeight = voteWeight !== undefined ? Number(voteWeight) : 1;

  // Check if user has claimed OBS tokens
  const { data: lastClaimRaw } = useReadContract({
    address: OBSCURA_TOKEN_ADDRESS,
    abi: OBSCURA_TOKEN_ABI,
    functionName: 'lastClaim',
    args: address ? [address] : undefined,
    query: { enabled: !!OBSCURA_TOKEN_ADDRESS && !!address },
  });
  const hasClaimed = Number(lastClaimRaw ?? 0) > 0;

  const [selectedProposal, setSelectedProposal] = useState<string>(initialProposalId);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [votedOptionIndex, setVotedOptionIndex] = useState<number | null>(null);
  const [wasRevote, setWasRevote] = useState(false);
  const [showSubmittedChoice, setShowSubmittedChoice] = useState(false);

  // Sync to parent-provided initial proposal id
  useEffect(() => {
    if (initialProposalId) setSelectedProposal(initialProposalId);
  }, [initialProposalId]);

  // Show success UI as soon as tx hash lands (don't wait for receipt polling)
  useEffect(() => {
    if (txHash && selectedOption !== null && votedOptionIndex === null) {
      setVotedOptionIndex(selectedOption);
    }
  }, [txHash, selectedOption, votedOptionIndex]);

  // Eagerly pre-init FHE SDK so encryption is fast when the user clicks "Cast Vote"
  useEffect(() => {
    if (publicClient && walletClient) {
      initFHEClient(publicClient, walletClient).catch(() => {});
    }
  }, [publicClient, walletClient]);

  const proposalId = selectedProposal ? BigInt(selectedProposal) : undefined;
  const { proposal } = useProposal(proposalId ?? 0n);
  const { data: optionLabels } = useProposalOptions(proposalId ?? 0n);
  const { data: alreadyVoted } = useHasVoted(proposalId ?? 0n, address);

  // Deadline urgency
  const secondsLeft = proposal?.deadline ? Number(proposal.deadline - now) : null;
  const isUrgent = secondsLeft !== null && secondsLeft > 0 && secondsLeft < 3600;
  const isCritical = secondsLeft !== null && secondsLeft > 0 && secondsLeft < 1800;

  const hasSelection = selectedProposal !== '';
  const isActive = hasSelection && proposal?.exists && !proposal.isCancelled && now < proposal.deadline && !proposal.isFinalized;
  const isOwnProposal = !!(address && proposal?.creator && address.toLowerCase() === proposal.creator.toLowerCase());
  const isEndedNotFinalized = hasSelection && proposal?.exists && !proposal.isCancelled && !proposal.isFinalized && now >= proposal.deadline;
  const canVote =
    isConnected &&
    hasClaimed &&
    !hasDelegated &&
    isActive &&
    !isOwnProposal &&
    selectedOption !== null &&
    !isTxPending &&
    status !== FHEStepStatus.COMPUTING &&
    status !== FHEStepStatus.ENCRYPTING;
  const submitBlockedReason = !isConnected
    ? "Connect your wallet to vote."
    : !hasClaimed
      ? "Unlock beta access in Pay before voting."
      : hasDelegated
        ? "Your voting power is delegated — remove delegation to cast a ballot yourself."
        : isOwnProposal
          ? "Creators cannot vote on their own proposals."
          : !isActive
            ? "This proposal is not accepting votes."
            : selectedOption === null
              ? "Select an option to continue."
              : null;
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (selectedOption === null || !selectedProposal || proposalId === undefined) return;
    setError(null);
    setVotedOptionIndex(null);
    setShowSubmittedChoice(false);
    const wasAlreadyVoted = !!alreadyVoted;
    try {
      await castVote(proposalId, selectedOption);
      setVotedOptionIndex(selectedOption);
      setWasRevote(wasAlreadyVoted);
    } catch (err: unknown) {
      setError(getVoteErrorMessage(err));
    }
  }

  return (
    <div className="space-y-5">
      {!embedded && (
        <VotePanelHeader
          icon={Vote}
          title="Cast private vote"
          subtitle="Your choice is encrypted before submission"
          badge="Private"
        />
      )}

      {!embedded && (
        <p className="text-sm leading-relaxed text-muted-foreground border-l-2 border-[hsl(var(--accent))]/40 pl-3">
          Change your vote before the deadline. Only final totals are revealed — never individual ballots.
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* OBS Token requirement */}
        {isConnected && !hasClaimed && (
          <div className="flex items-start gap-2 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-md">
            <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm text-yellow-400 font-semibold">Beta access required</div>
              <div className="text-xs text-yellow-400/70 mt-0.5">
                This testnet contract requires one faucet claim before voting. Open the{" "}
                <Link to="/pay" className="underline text-foreground">Pay app</Link> and unlock beta access first.
              </div>
            </div>
          </div>
        )}

        {/* Delegation — blocks direct voting */}
        {isConnected && hasDelegated && (
          <div className="vote-delegation-block rounded-2xl border border-violet-500/35 bg-violet-500/8 p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-500/15">
                <Users className="h-5 w-5 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-display text-base font-semibold text-foreground">You delegated your vote</div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  While delegation is active, you cannot submit a private ballot from this wallet. Your delegate votes with your combined weight.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenDelegation?.()}
                  className="mt-4 inline-flex h-11 min-h-[44px] w-full items-center justify-center rounded-full bg-violet-600 px-5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-violet-700 sm:w-auto"
                >
                  Remove delegation to vote
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Vote weight badge */}
        {isConnected && !hasDelegated && effectiveWeight > 1 && (
          <div className="flex items-center gap-2 p-3 bg-violet-500/5 border border-violet-500/20 rounded-md">
            <Users className="w-4 h-4 text-violet-400 shrink-0" />
            <div className="text-xs text-violet-300">
              Your vote weight: <span className="font-bold text-foreground">{effectiveWeight}</span>
              <span className="text-violet-400/70 ml-1">({effectiveWeight - 1} delegate{effectiveWeight - 1 !== 1 ? "s" : ""} have trusted you)</span>
            </div>
          </div>
        )}

        <VoteFormField label="Select proposal" hint="Choose a proposal from the dropdown — open proposals appear first.">
          <select
            value={selectedProposal}
            onChange={(e) => {
              setSelectedProposal(e.target.value);
              setSelectedOption(null);
              setShowSubmittedChoice(false);
              reset();
              setError(null);
            }}
            className="pay-select min-h-[44px]"
            aria-label="Select proposal"
          >
            <option value="">Choose a proposal…</option>
            {Array.from({ length: proposalCount }, (_, i) => (
              <ProposalOption key={i} index={i} now={now} />
            ))}
          </select>
        </VoteFormField>

        {hasSelection && proposal?.exists && (
          <VoteProposalDetailCard
            proposal={proposal}
            now={now}
            alreadyVoted={!!alreadyVoted}
            isOwnProposal={isOwnProposal}
            isEndedNotFinalized={isEndedNotFinalized}
            hasDelegated={hasDelegated}
          />
        )}

        {hasSelection && isActive && !hasDelegated && proposal?.exists && optionLabels && (optionLabels as string[]).length > 0 && !(txHash && votedOptionIndex !== null) && (
          <VoteFormField
            tone="forest"
            label="Your vote"
            hint="Select one option. You can change it before the deadline."
          >
            <div className="vote-choice-stack space-y-3" role="radiogroup" aria-label="Vote options">
              {(optionLabels as string[]).map((label, i) => {
                const isChosen = selectedOption === i;
                return (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={isChosen}
                    data-selected={isChosen ? "true" : "false"}
                    onClick={() => setSelectedOption(i)}
                    className="vote-choice-option"
                  >
                    <span className="vote-choice-option__radio" aria-hidden>
                      {isChosen ? <span className="vote-choice-option__radio-dot" /> : null}
                    </span>
                    <span className="vote-choice-option__index">{i + 1}</span>
                    <span className="vote-choice-option__label">{label}</span>
                    {isChosen ? <CheckCircle2 className="vote-choice-option__check" aria-hidden /> : null}
                  </button>
                );
              })}
            </div>
          </VoteFormField>
        )}

        {selectedOption !== null && optionLabels && status === FHEStepStatus.IDLE && !txHash && (
          <VoteTxSummaryCard
            title="Confirm private vote"
            subtitle="Review before your wallet opens"
            badges={["private", "gas_only"]}
            valueBadge={<VoteTxValueBadge gasNote="network gas only" />}
            rows={[
              { label: "Proposal", value: proposal?.title ? `#${selectedProposal} · ${proposal.title}` : `#${selectedProposal}` },
              { label: "Your choice", value: (optionLabels as string[])[selectedOption] ?? `Option ${selectedOption + 1}` },
              { label: "Vote weight", value: String(effectiveWeight) },
              { label: "Privacy", value: "Encrypted ballot · aggregate totals only at finalization" },
            ]}
          />
        )}

        {status !== FHEStepStatus.IDLE && (
          <VoteTxFHEProgress status={status} error={fheError} />
        )}

        {/* Error */}
        {(error || fheError) && (
          <div className="flex items-center gap-2 text-red-400 text-sm font-mono">
            <AlertCircle className="w-3.5 h-3.5" />
            {error || fheError}
          </div>
        )}

        {/* TX success state with FHE operations visualizer */}
        {txHash && votedOptionIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 flex flex-col gap-5"
          >
            {/* Success banner */}
            <div className="vote-sealed-panel rounded-2xl border-2 border-[hsl(var(--dash-forest)/0.35)] bg-white p-4 shadow-[var(--dash-surface-shadow-sm)] sm:p-5">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[hsl(var(--dash-forest))] text-[hsl(96_18%_97%)]">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-display text-base font-semibold text-foreground">
                    {wasRevote ? "Vote changed — privately." : "Vote sealed — privately."}
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    Your ballot is sealed on Arbitrum Sepolia. No one can see which option you chose.
                    Only the aggregate tally is revealed after finalization.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSubmittedChoice((visible) => !visible)}
                      className="inline-flex h-9 min-h-[36px] items-center gap-1.5 rounded-full border-2 border-[hsl(var(--dash-forest))] bg-[hsl(var(--dash-forest))] px-4 text-xs font-semibold text-[hsl(96_18%_97%)] transition-colors hover:bg-[hsl(var(--dash-forest-hover))] hover:border-[hsl(var(--dash-forest-hover))]"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      {showSubmittedChoice ? "Hide my vote" : "Show my vote"}
                    </button>
                    <button
                      type="button"
                      onClick={() => { reset(); setVotedOptionIndex(null); setSelectedOption(null); setShowSubmittedChoice(false); setError(null); }}
                      className="inline-flex h-9 min-h-[36px] items-center gap-1.5 rounded-full border-2 border-[hsl(var(--border))] bg-white px-4 text-xs font-semibold text-foreground transition-colors hover:border-[hsl(var(--dash-forest)/0.45)] hover:bg-[hsl(145_28%_98%)]"
                    >
                      Change vote
                    </button>
                  </div>
                  {showSubmittedChoice && (
                    <div className="mt-3 rounded-xl border border-[hsl(var(--dash-mint-border))] bg-[hsl(var(--dash-mint))] px-3 py-2.5 text-sm text-foreground">
                      <span className="font-semibold">Shown only on this device:</span>{" "}
                      {(optionLabels as string[])?.[votedOptionIndex] ?? `Option ${votedOptionIndex}`}.
                    </div>
                  )}
                  <div className="mt-3 text-xs text-muted-foreground">
                    TX:{" "}
                    <a
                      href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-[hsl(var(--dash-forest))] hover:underline inline-flex items-center gap-1"
                    >
                      {txHash.slice(0, 10)}…{txHash.slice(-8)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Verify prompt */}
            <div className="flex items-start gap-3 rounded-xl border border-[hsl(var(--border))] bg-[hsl(145_28%_98%)] p-3.5 sm:p-4">
              <Eye className="mt-0.5 h-4 w-4 shrink-0 text-[hsl(var(--dash-forest))]" />
              <div className="text-xs leading-relaxed text-muted-foreground sm:text-sm">
                Want to confirm later? Use <span className="font-semibold text-foreground">Verify My Vote</span>{" "}
                in your ballot history. To change this vote, clear the success state and submit another option before the deadline.
              </div>
            </div>

            <button
              type="button"
              onClick={() => { reset(); setVotedOptionIndex(null); setSelectedOption(null); setShowSubmittedChoice(false); setError(null); }}
              className="inline-flex h-11 w-full items-center justify-center rounded-full border-2 border-[hsl(var(--border))] bg-white text-sm font-semibold text-foreground transition-colors hover:border-[hsl(var(--dash-forest)/0.45)] hover:bg-[hsl(145_28%_98%)]"
            >
              Change this vote or choose another proposal
            </button>
          </motion.div>
        )}

        {/* TX hash (when no success state shown) */}
        {txHash && votedOptionIndex === null && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            TX:{" "}
            <a
              href={`https://sepolia.arbiscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline inline-flex items-center gap-1"
            >
              {txHash.slice(0, 10)}...{txHash.slice(-8)}
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Deadline urgency */}
        {isActive && (isCritical || isUrgent) && (
          <div className={`flex items-center gap-2 p-2.5 rounded-md border text-xs ${
            isCritical
              ? "bg-red-400/5 border-red-400/30 text-red-400"
              : "bg-orange-400/5 border-orange-400/30 text-orange-400"
          }`}>
            <Timer className="w-3.5 h-3.5 shrink-0" />
            {isCritical ? "Less than 30 minutes remaining!" : "Less than 1 hour remaining — vote soon!"}
          </div>
        )}

        {/* Confirmation step: shown after option selected, before submit */}
        {hasSelection && isActive && selectedOption !== null && !txHash && !hasDelegated && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="vote-ready-strip flex items-start gap-3 rounded-2xl border border-[hsl(var(--accent))]/35 bg-[hsl(var(--accent))]/10 p-4 text-sm"
          >
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[hsl(var(--accent))]" />
            <div className="flex-1">
              <div className="font-display text-base font-semibold text-foreground">Ready to seal your ballot?</div>
              <div className="mt-1 text-sm text-muted-foreground">
                You selected{" "}
                <span className="font-semibold text-foreground">
                  “{(optionLabels as string[])?.[selectedOption] ?? `Option ${selectedOption}`}”
                </span>{" "}
                on <span className="font-medium text-foreground">{proposal?.title}</span>. Submit again before the deadline to change your private vote.
              </div>
            </div>
          </motion.div>
        )}

        {!txHash && !hasDelegated && (
          <div className="vote-submit-zone space-y-2 pt-1">
            <motion.button
              type="submit"
              disabled={!canVote}
              whileHover={canVote ? { scale: 1.008 } : undefined}
              whileTap={canVote ? { scale: 0.992 } : undefined}
              className="inline-flex h-12 min-h-[48px] w-full items-center justify-center rounded-full bg-foreground px-6 text-base font-semibold text-background shadow-lg shadow-foreground/10 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isTxPending ? "Submitting…" : alreadyVoted ? "Change Private Vote" : "Submit Private Vote"}
            </motion.button>
            {!canVote && submitBlockedReason && (
              <p className="text-center text-xs leading-relaxed text-muted-foreground">{submitBlockedReason}</p>
            )}
          </div>
        )}

      </form>
    </div>
  );
}
