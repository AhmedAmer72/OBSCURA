import { ArrowUpRight, LayoutGrid, Repeat, Send, Wallet } from "lucide-react";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";
import { PaymentModeBar } from "@/components/harmony/PaymentModeBar";
import { usePaymentMode } from "@/contexts/PaymentModeContext";

export type PayWorkspaceTab = "home" | "pay" | "getpaid" | "automations";

const PAY_TABS = [
  { key: "home" as const, label: "Overview", icon: LayoutGrid },
  { key: "pay" as const, label: "Send", icon: Send },
  { key: "getpaid" as const, label: "Receive", icon: Wallet },
  { key: "automations" as const, label: "Automate", icon: Repeat },
];

export function PayWorkspaceChrome({
  tab,
  onSelectTab,
  unreadCount = 0,
  onSetupSmart,
}: {
  tab: PayWorkspaceTab | "activity" | "settings";
  onSelectTab: (tab: PayWorkspaceTab) => void;
  unreadCount?: number;
  onSetupSmart?: () => void;
}) {
  const mainTab = PAY_TABS.some((t) => t.key === tab) ? (tab as PayWorkspaceTab) : undefined;
  const { isPublicMode } = usePaymentMode();

  return (
    <AppWorkspaceChrome
      eyebrow="Obscura · Pay"
      title={isPublicMode ? "Public payments." : "Private payments."}
      description={
        isPublicMode
          ? "Send visible USDC with passkey signing and sponsored gas. Encrypted ocUSDC flows stay in Private Mode."
          : "Send, receive, and automate with encrypted amounts. Balances stay sealed until you choose to reveal them."
      }
      tabs={PAY_TABS.filter((t) => !isPublicMode || t.key !== "automations").map((t) =>
        t.key === "getpaid" && unreadCount > 0 ? { ...t, badge: unreadCount } : t,
      )}
      tab={mainTab}
      onSelectTab={onSelectTab}
      actions={
        <>
          {onSetupSmart ? (
            <PaymentModeBar variant="pill" showHelp onSetupSmart={onSetupSmart} />
          ) : null}
          {tab === "activity" ? (
            <button
              type="button"
              onClick={() => onSelectTab("home")}
              className="dash-btn-outline h-9 shrink-0 px-3 text-xs"
            >
              Back to overview
              <ArrowUpRight className="h-3 w-3 rotate-180" />
            </button>
          ) : null}
        </>
      }
    />
  );
}

export { PAY_TABS };
