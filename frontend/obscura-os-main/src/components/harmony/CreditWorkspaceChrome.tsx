import { ArrowDownToLine, Coins, Gavel, Gauge, Landmark, WalletCards } from "lucide-react";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";

export type CreditWorkspaceTab = "overview" | "borrow" | "position" | "earn" | "liquidations" | "risk";

const CREDIT_TABS = [
  { key: "overview" as const, label: "Overview", icon: Landmark },
  { key: "borrow" as const, label: "Borrow", icon: ArrowDownToLine },
  { key: "position" as const, label: "Position", icon: WalletCards },
  { key: "earn" as const, label: "Earn", icon: Coins },
  { key: "liquidations" as const, label: "Liquidations", icon: Gavel },
  { key: "risk" as const, label: "Risk", icon: Gauge },
];

export function CreditWorkspaceChrome({
  tab,
  onSelectTab,
  unreadCount = 0,
}: {
  tab: CreditWorkspaceTab;
  onSelectTab: (tab: CreditWorkspaceTab) => void;
  unreadCount?: number;
}) {
  return (
    <AppWorkspaceChrome
      eyebrow="Obscura · Credit"
      title="Private lending."
      description="Supply private USDC as collateral. Borrow at up to 86% LLTV. Your position size, collateral, and debt are encrypted on-chain — only the public health factor is visible."
      tabs={CREDIT_TABS.map((t) =>
        t.key === "risk" && unreadCount > 0 ? { ...t, badge: unreadCount } : t,
      )}
      tab={tab}
      onSelectTab={onSelectTab}
    />
  );
}

export { CREDIT_TABS };
