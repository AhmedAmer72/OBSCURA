import { Award, BarChart3, Home, ShieldCheck, Users, Vault, Vote } from "lucide-react";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";

export type GovernWorkspaceTab = "overview" | "proposals" | "delegation" | "treasury" | "rewards" | "advanced";

const GOVERN_TABS = [
  { key: "overview" as const, label: "Overview", icon: Home },
  { key: "proposals" as const, label: "Proposals", icon: Vote },
  { key: "delegation" as const, label: "Delegation", icon: Users },
  { key: "treasury" as const, label: "Treasury", icon: Vault },
  { key: "rewards" as const, label: "Rewards", icon: Award },
  { key: "advanced" as const, label: "Advanced", icon: ShieldCheck },
];

export function GovernWorkspaceChrome({
  tab,
  onSelectTab,
}: {
  tab: GovernWorkspaceTab;
  onSelectTab: (tab: GovernWorkspaceTab) => void;
}) {
  return (
    <AppWorkspaceChrome
      eyebrow="Obscura · Vote"
      title="Private voting."
      description="Vote privately on proposals. Direct the treasury. Earn 0.001 ETH for every encrypted ballot you cast."
      tabs={GOVERN_TABS}
      tab={tab}
      onSelectTab={onSelectTab}
    />
  );
}

export { GOVERN_TABS };
