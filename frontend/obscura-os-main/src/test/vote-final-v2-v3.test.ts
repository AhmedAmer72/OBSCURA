import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const testDir = dirname(fileURLToPath(import.meta.url));
const sourceRoot = resolve(testDir, "..");

function readSource(relativePath: string): string {
  return readFileSync(resolve(sourceRoot, relativePath), "utf8");
}

describe("Vote V2/V3 information architecture", () => {
  it("collapses Vote to dedicated govern tabs", () => {
    const votePage = readSource("pages/VotePage.tsx");
    const shell = readSource("components/harmony/VoteHarmonyTabShell.tsx");
    const chrome = readSource("components/harmony/GovernWorkspaceChrome.tsx");

    expect(votePage).toContain('"treasury"');
    expect(votePage).toContain('type GovernorSubMode = "proposals" | "new"');
    expect(chrome).toContain('key: "delegation"');
    expect(chrome).toContain('key: "rewards"');
    expect(chrome).toContain('key: "governor"');
    expect(chrome).not.toContain('key: "newProposal"');
    expect(votePage).toContain("GOVERN_TABS.map");
    expect(votePage).toContain('label: "New proposal"');
    expect(votePage).toContain("openGovernorSubMode");
    expect(shell).toContain('"proposals" | "participation" | "delegation" | "governor"');
  });

  it("keeps advanced governance out of the overview", () => {
    const votePage = readSource("pages/VotePage.tsx");
    const dashboard = readSource("components/harmony/VoteHarmonyDashboard.tsx");

    expect(votePage).not.toContain("VoteSetupGuide");
    expect(votePage).not.toContain("SectionDiagram");
    expect(votePage).not.toContain("ClaimDailyObsForm");
    expect(dashboard).not.toContain("Institutional governance");
    expect(dashboard).not.toContain("OBS · sealed");
    expect(dashboard).not.toContain("Treasury");
    expect(dashboard).not.toContain("Totals only, never ballots");
    expect(dashboard).not.toContain("Final results show aggregate totals only");
  });

  it("makes voting the primary proposal path while preserving explicit reveal", () => {
    const votePage = readSource("pages/VotePage.tsx");
    const proposalList = readSource("components/vote/ProposalList.tsx");
    const castVote = readSource("components/vote/CastVoteForm.tsx");
    const tallyReveal = readSource("components/vote/TallyReveal.tsx");

    expect(votePage).toContain('type ProposalMode = "browse" | "create" | "vote" | "results"');
    expect(votePage).toContain('key: "vote", label: "Vote"');
    expect(votePage).toContain("VoteHarmonySubNav");
    expect(proposalList).toContain("Vote privately");
    expect(castVote).toContain("Change Private Vote");
    expect(castVote).toContain("Submit Private Vote");
    expect(castVote).toContain("Show my vote");
    expect(castVote).toContain("Change vote");
    expect(tallyReveal).toContain("Decrypt Public Tally");
    expect(tallyReveal).toContain("Individual votes remain permanently encrypted");
  });

  it("keeps vote alert preferences out of the rewards tab", () => {
    const votePage = readSource("pages/VotePage.tsx");
    const notificationsPanel = readSource("components/vote/VoteNotificationsPanel.tsx");

    expect(votePage).not.toContain("VoteNotificationsPanel");
    expect(votePage).not.toContain("Vote alerts");
    expect(notificationsPanel).toContain("never include the option you chose");
  });

  it("improves mobile and empty-state polish", () => {
    const dashboard = readSource("components/harmony/VoteHarmonyDashboard.tsx");
    const proposalList = readSource("components/vote/ProposalList.tsx");
    const rewards = readSource("components/vote/RewardsPanel.tsx");

    expect(dashboard).toContain("vh.kpiGrid");
    expect(dashboard).toContain("h-9 px-3");
    expect(dashboard).toContain("Vote now");
    expect(proposalList).toContain("activeOnly");
    expect(proposalList).toContain("Showing {effectiveFilter} proposals first");
    expect(rewards).toContain("Reward claims appear after you vote privately");
    expect(rewards).toContain("No reward claim is ready if this list is empty");
    expect(rewards).toContain("Nothing is withdrawable yet");
  });
});