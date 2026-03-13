import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import { useIsArbitrumSepolia } from "@/hooks/useWalletSessionChainId";
import {
  BarChart3,
  AlertTriangle,
  Home,
  Plus,
  ShieldCheck,
  Vault,
  Vote,
} from "lucide-react";

import { ActivityFeed } from "@/components/harmony/ActivityFeed";
import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { GovernWorkspaceChrome, GOVERN_TABS, type GovernWorkspaceTab } from "@/components/harmony/GovernWorkspaceChrome";
import { HarmonyFormCard } from "@/components/harmony/harmony-ui";
import { VoteHarmonyDashboard } from "@/components/harmony/VoteHarmonyDashboard";
import {
  VoteHarmonyNotConnected,
  VoteHarmonyPanelCard,
  VoteHarmonySubNav,
  VoteHarmonyTabShell,
} from "@/components/harmony/VoteHarmonyTabShell";

import ProposalList from "@/components/vote/ProposalList";
import CastVoteForm from "@/components/vote/CastVoteForm";
import TallyReveal from "@/components/vote/TallyReveal";
import CreateProposalForm from "@/components/vote/CreateProposalForm";
import VotingHistory from "@/components/vote/VotingHistory";
import AdminControls from "@/components/vote/AdminControls";
import { DelegationPanel } from "@/components/vote/DelegationPanel";
import { TreasuryPanel } from "@/components/vote/TreasuryPanel";
import { RewardsPanel } from "@/components/vote/RewardsPanel";
import { GovernorPanel } from "@/components/vote/GovernorPanel";
import { VoteParticipationProfile } from "@/components/vote/VoteParticipationProfile";
import { VoteAdvancedIntro } from "@/components/vote/VoteAdvancedIntro";
import { useVoteOwner, useVoteRole } from "@/hooks/useProposals";
import { Role } from "@/lib/constants";

type VoteSection = "overview" | "proposals" | "participation" | "delegation" | "advanced";
type ProposalMode = "browse" | "create" | "vote" | "results";
type AdvancedMode = "treasury" | "governor";

const PROPOSAL_MODES: ProposalMode[] = ["browse", "create", "vote", "results"];

function isProposalMode(value: string | null): value is ProposalMode {
  return value != null && PROPOSAL_MODES.includes(value as ProposalMode);
}

function sectionToGovernTab(section: VoteSection, advancedMode: AdvancedMode): GovernWorkspaceTab {
  if (section === "overview") return "overview";
  if (section === "proposals") return "proposals";
  if (section === "delegation") return "delegation";
  if (section === "participation") return "rewards";
  if (advancedMode === "treasury") return "treasury";
  return "advanced";
}

const VotePage = () => {
  const { address, isConnected } = useAccount();
  const { data: ownerAddress } = useVoteOwner();
  const { data: userRoleRaw } = useVoteRole(address);
  const isOwner = !!address && !!ownerAddress && address.toLowerCase() === (ownerAddress as string).toLowerCase();
  const userRole = (userRoleRaw as number) ?? Role.NONE;
  const isAdmin = userRole === Role.ADMIN || isOwner;

  const { isWrongNetwork: wrongNetwork, sessionChainId } = useIsArbitrumSepolia();
  const wrongNetworkConnected = isConnected && wrongNetwork;

  const [searchParams, setSearchParams] = useSearchParams();

  const [section, setSection] = useState<VoteSection>("overview");
  const [proposalMode, setProposalMode] = useState<ProposalMode>("browse");
  const [advancedMode, setAdvancedMode] = useState<AdvancedMode>("treasury");
  const [jumpProposalId, setJumpProposalId] = useState("");

  const writeVoteUrl = useCallback(
    (opts: { tab?: GovernWorkspaceTab; mode?: ProposalMode }) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.delete("mode");
          params.delete("panel");

          const tab = opts.tab ?? "overview";
          if (tab === "overview") {
            params.delete("tab");
          } else {
            params.set("tab", tab);
          }

          if (tab === "proposals" && opts.mode && opts.mode !== "browse") {
            params.set("mode", opts.mode);
          }

          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  useEffect(() => {
    const urlTab = searchParams.get("tab");
    const urlMode = searchParams.get("mode");
    const urlPanel = searchParams.get("panel");

    if (!urlTab || urlTab === "overview") {
      setSection("overview");
      return;
    }

    if (urlTab === "proposals") {
      setSection("proposals");
      setProposalMode(isProposalMode(urlMode) ? urlMode : "browse");
      return;
    }

    if (urlTab === "rewards") {
      setSection("participation");
      return;
    }

    if (urlTab === "delegation" || (urlTab === "participation" && urlPanel === "delegation")) {
      setSection("delegation");
      return;
    }

    if (urlTab === "participation") {
      setSection("participation");
      return;
    }

    if (urlTab === "treasury") {
      setSection("advanced");
      setAdvancedMode("treasury");
      return;
    }

    if (urlTab === "advanced") {
      setSection("advanced");
      setAdvancedMode("governor");
    }
  }, [searchParams]);

  const openDelegation = useCallback(() => {
    setSection("delegation");
    writeVoteUrl({ tab: "delegation" });
  }, [writeVoteUrl]);

  const openParticipationRewards = useCallback(() => {
    setSection("participation");
    writeVoteUrl({ tab: "rewards" });
  }, [writeVoteUrl]);

  const openProposals = useCallback(
    (mode: ProposalMode = "browse", proposalId?: number | string) => {
      setSection("proposals");
      setProposalMode(mode);
      if (proposalId !== undefined) setJumpProposalId(String(proposalId));
      writeVoteUrl({ tab: "proposals", mode });
    },
    [writeVoteUrl],
  );

  const selectGovernTab = useCallback(
    (tab: GovernWorkspaceTab) => {
      switch (tab) {
        case "overview":
          setSection("overview");
          writeVoteUrl({ tab: "overview" });
          break;
        case "proposals":
          openProposals("browse");
          break;
        case "delegation":
          setSection("delegation");
          writeVoteUrl({ tab: "delegation" });
          break;
        case "treasury":
          setSection("advanced");
          setAdvancedMode("treasury");
          writeVoteUrl({ tab: "treasury" });
          break;
        case "rewards":
          setSection("participation");
          writeVoteUrl({ tab: "rewards" });
          break;
        case "advanced":
          setSection("advanced");
          setAdvancedMode("governor");
          writeVoteUrl({ tab: "advanced" });
          break;
      }
    },
    [openProposals, writeVoteUrl],
  );

  const governTab = sectionToGovernTab(section, advancedMode);

  const renderProposalContent = () => {
    switch (proposalMode) {
      case "vote":
        if (!isConnected) {
          return <VoteHarmonyNotConnected message="Connect your wallet to cast an encrypted vote." />;
        }
        return (
          <div className="vote-form-stack flex flex-col gap-8">
            <VoteHarmonyPanelCard title="Vote on proposal" eyebrow="Private ballot">
              <CastVoteForm
                initialProposalId={jumpProposalId}
                embedded
                onOpenDelegation={openDelegation}
              />
            </VoteHarmonyPanelCard>
            <VoteHarmonyPanelCard title="Your ballot history" eyebrow="Private verification">
              <VotingHistory embedded />
            </VoteHarmonyPanelCard>
          </div>
        );
      case "results":
        return (
          <VoteHarmonyPanelCard title="Reveal aggregate totals" eyebrow="Results">
            <div className="harmony-form-inner">
              <TallyReveal onClaimRewards={openParticipationRewards} />
            </div>
          </VoteHarmonyPanelCard>
        );
      case "create":
        if (!isConnected) {
          return <VoteHarmonyNotConnected message="Connect your wallet to create proposals." />;
        }
        return (
          <div className="vote-form-stack flex flex-col gap-8">
            <VoteHarmonyPanelCard title="Create a private proposal" eyebrow="Secondary action">
              <CreateProposalForm onSuccess={() => openProposals("browse")} embedded />
            </VoteHarmonyPanelCard>
            {isAdmin ? (
              <VoteHarmonyPanelCard title="Administrative controls" eyebrow="Admin">
                <AdminControls />
              </VoteHarmonyPanelCard>
            ) : null}
          </div>
        );
      case "browse":
      default:
        return (
          <div className="vote-form-stack flex flex-col gap-8">
            <VoteHarmonyPanelCard title="Private proposals" eyebrow="Needs action">
              <ProposalList onVote={(id) => openProposals("vote", id)} embedded />
            </VoteHarmonyPanelCard>
            {isConnected ? (
              <VoteHarmonyPanelCard title="Your ballot history" eyebrow="Private verification">
                <VotingHistory embedded />
              </VoteHarmonyPanelCard>
            ) : null}
          </div>
        );
    }
  };

  const renderActiveSection = () => {
    switch (section) {
      case "overview":
        return (
          <div className="space-y-6">
            <VoteHarmonyDashboard
              onVote={() => openProposals("vote")}
              onParticipation={() => setSection("participation")}
              onOpenProposals={() => openProposals("browse")}
              onCreate={() => openProposals("create")}
            />

            <HarmonyFormCard title="Proposals needing attention" eyebrow="Active governance">
              <div className="harmony-form-inner vote-harmony-panel -mx-2">
                <ProposalList onVote={(id) => openProposals("vote", id)} initialFilter="active" embedded />
              </div>
            </HarmonyFormCard>

            <ActivityFeed
              defaultFilter="vote"
              filters={["vote"]}
              title="Recent governance activity"
              eyebrow="Shared activity"
              emptyMessage="No indexed Vote activity found for this wallet yet."
            />
          </div>
        );

      case "proposals":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="proposals" sub={proposalMode} hideIntro>
              {proposalMode !== "vote" ? (
                <VoteHarmonySubNav
                  active={proposalMode}
                  onChange={(mode) => openProposals(mode)}
                  items={[
                    { key: "browse", label: "Browse", icon: Home },
                    { key: "vote", label: "Vote", icon: Vote },
                    { key: "create", label: "Create", icon: Plus },
                    { key: "results", label: "Results", icon: BarChart3 },
                  ]}
                />
              ) : null}
              <AnimatePresence mode="wait">
                <motion.div
                  key={proposalMode}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="mt-6"
                >
                  {renderProposalContent()}
                </motion.div>
              </AnimatePresence>
            </VoteHarmonyTabShell>
          </div>
        );

      case "participation":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="participation" hideIntro>
              <div className="vote-form-stack flex flex-col gap-8">
                <VoteParticipationProfile />
                <VoteHarmonyPanelCard title="Claim voter rewards" eyebrow="Voter incentives">
                  <RewardsPanel />
                </VoteHarmonyPanelCard>
              </div>
            </VoteHarmonyTabShell>
          </div>
        );

      case "delegation":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="delegation" hideIntro>
              {!isConnected ? (
                <VoteHarmonyNotConnected message="Connect your wallet to manage delegation." />
              ) : (
                <VoteHarmonyPanelCard title="Delegate voting power" eyebrow="Public power routing">
                  <DelegationPanel />
                </VoteHarmonyPanelCard>
              )}
            </VoteHarmonyTabShell>
          </div>
        );

      case "advanced":
        return (
          <div className="vote-harmony-panel">
            <VoteHarmonyTabShell tab="advanced" hideIntro>
              <VoteAdvancedIntro />
              <VoteHarmonySubNav
                active={advancedMode}
                onChange={setAdvancedMode}
                items={[
                  { key: "treasury", label: "Treasury", icon: Vault },
                  { key: "governor", label: "Governor", icon: ShieldCheck },
                ]}
              />
              <div className="mt-6">
                {advancedMode === "treasury" ? (
                  <VoteHarmonyPanelCard title="Treasury lifecycle" eyebrow="Timelock spends">
                    <div className="harmony-form-inner">
                      <TreasuryPanel />
                    </div>
                  </VoteHarmonyPanelCard>
                ) : (
                  <VoteHarmonyPanelCard title="Executable governance" eyebrow="Governor · Timelock">
                    <div className="harmony-form-inner -mx-2">
                      <GovernorPanel wrongNetwork={wrongNetworkConnected} />
                    </div>
                  </VoteHarmonyPanelCard>
                )}
              </div>
            </VoteHarmonyTabShell>
          </div>
        );
    }
  };

  const harmonySidebar = GOVERN_TABS.map((item) => ({
    key: item.key,
    label: item.label,
    mobileLabel: item.label,
    icon: item.icon,
    active: governTab === item.key,
    onClick: () => selectGovernTab(item.key),
  }));

  return (
    <HarmonyAppShell
      sidebar={harmonySidebar}
      searchPlaceholder="Search proposals…"
    >
      <GovernWorkspaceChrome tab={governTab} onSelectTab={selectGovernTab} />

      {wrongNetworkConnected && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4"
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
          <div>
            <div className="text-sm font-semibold text-amber-900">Wrong network</div>
            <div className="mt-0.5 text-xs text-amber-800/80">
              Your wallet is on chain <span className="font-semibold">{sessionChainId ?? "unknown"}</span>.
              Switch to <span className="font-semibold">Arbitrum Sepolia</span> (421614) in MetaMask or use the header switch button before voting or creating proposals.
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>
    </HarmonyAppShell>
  );
};

export default VotePage;
