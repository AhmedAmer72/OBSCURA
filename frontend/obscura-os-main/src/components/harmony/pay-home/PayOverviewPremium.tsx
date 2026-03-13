import { useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Inbox,
  Repeat,
  Send,
  Shield,
} from "lucide-react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import {
  PayHomeSealedValue,
  SealedCipherBars,
} from "@/components/harmony/pay-home/PayHomePremiumSections";
import { useOcUSDCBalance } from "@/hooks/useOcUSDCBalance";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { useReceipts } from "@/hooks/useReceipts";
import { filterReceiptsByPrivacyMode } from "@/lib/payModeFilters";
import { usePaymentMode } from "@/contexts/PaymentModeContext";
import { PrivacyContextBanner } from "@/components/harmony/PrivacyContextBanner";
import { useValuesReveal, useCardCipherReveal } from "@/contexts/ValuesRevealContext";

type PayTab = "home" | "pay" | "getpaid" | "automations" | "activity" | "settings";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

function QuickAction({
  label,
  icon: Icon,
  primary,
  onClick,
}: {
  label: string;
  icon: typeof Send;
  primary?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("pay-quick-action", primary && "pay-quick-action-primary")}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </button>
  );
}

export function PayOverviewPremium({ onNavigate }: { onNavigate: (tab: PayTab) => void }) {
  const { isConnected } = useAccount();
  const { privacyMode } = usePaymentMode();
  const { decrypted, reveal, busy: revealBusy } = useOcUSDCBalance();
  const { setRevealed: setMasterRevealed } = useValuesReveal();
  const balanceReveal = useCardCipherReveal();

  useEffect(() => {
    const shouldDecrypt = balanceReveal.isVisible;
    if (!shouldDecrypt || !isConnected || decrypted != null || revealBusy) return;
    void reveal().catch(() => undefined);
  }, [balanceReveal.isVisible, isConnected, decrypted, revealBusy, reveal]);

  const ocDisplay = decrypted != null ? (Number(decrypted) / 1_000_000).toFixed(2) : null;
  const showBalance = balanceReveal.isVisible && !!ocDisplay;
  const usdcBalance = useUSDCBalance();
  const { receipts } = useReceipts();
  const usdcNum = usdcBalance ? Number.parseFloat(usdcBalance) : 0;
  const balanceReference =
    usdcNum > 0
      ? `≈ $${usdcNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} reference`
      : undefined;

  const activity = useMemo(() => {
    const filtered = filterReceiptsByPrivacyMode(receipts, privacyMode);
    return filtered.slice(0, 4).map((r) => ({
      title: r.kind.replace(/-/g, " "),
      meta: new Date(r.timestamp).toLocaleDateString(),
    }));
  }, [privacyMode, receipts]);

  return (
    <div className="pay-overview-grid space-y-4">
      <PrivacyContextBanner
        onDecryptAll={() => setMasterRevealed(true)}
      />
      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible" className="space-y-6">
        <section className="dash-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="dash-eyebrow">Private balance</p>
              <p className="mt-1 text-sm font-medium text-foreground">ocUSDC · Private USDC</p>
            </div>
            <span className="dash-badge dash-badge-success">Private mode</span>
          </div>

          <div className="mt-5">
            {isConnected ? (
              <PayHomeSealedValue
                revealed={showBalance}
                value={ocDisplay}
                reference={showBalance ? undefined : balanceReference}
                onToggleReveal={balanceReveal.toggle}
                revealBusy={revealBusy}
              />
            ) : (
              <SealedCipherBars caption="Connect wallet · sealed" />
            )}
          </div>

          <div className="pay-quick-action-grid mt-5">
            <QuickAction label="Send" icon={Send} primary onClick={() => onNavigate("pay")} />
            <QuickAction label="Receive" icon={ArrowDownLeft} onClick={() => onNavigate("getpaid")} />
            <QuickAction label="Make private" icon={Shield} onClick={() => onNavigate("pay")} />
            <QuickAction label="Automate" icon={Repeat} onClick={() => onNavigate("automations")} />
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="dash-card p-5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">Active streams &amp; escrows</p>
              <button
                type="button"
                onClick={() => onNavigate("automations")}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                Manage
              </button>
            </div>
            <div className="mt-4 space-y-2">
              <div className="ref-mini-card">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">Stream to 0x1234…</span>
                  <span className="dash-badge dash-badge-success">Settling</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">Next settlement in 4h 12m</p>
              </div>
              <div className="ref-mini-card">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm text-foreground">Escrow #3</span>
                  <span className="dash-badge dash-badge-warn">2d remaining</span>
                </div>
              </div>
            </div>
          </section>

          <section className="dash-card overflow-hidden">
            <div className="flex items-center justify-between gap-2 border-b border-border/60 px-5 py-3">
              <p className="text-sm font-medium text-foreground">Activity</p>
              <button
                type="button"
                onClick={() => onNavigate("activity")}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                View all
              </button>
            </div>
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No receipts yet.</p>
            ) : (
              <ul className="divide-y divide-border/50">
                {activity.map((row, i) => (
                  <li key={i} className="flex items-center gap-3 px-5 py-3 text-sm">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[hsl(var(--success))]" />
                    <span className="min-w-0 flex-1 truncate text-foreground">{row.title}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">{row.meta}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </motion.div>

      <motion.aside custom={1} variants={fadeUp} initial="hidden" animate="visible">
        <section className="dash-card flex h-full flex-col p-5 sm:p-6">
          <p className="dash-eyebrow">Most important action</p>
          <h2 className="mt-2 font-display text-xl tracking-tight text-foreground">Make USDC private</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Convert standard USDC into ocUSDC — encrypted USDC that only you can see and control. This unlocks every
            Obscura feature.
          </p>
          <ul className="mt-4 space-y-2 text-[13px] text-muted-foreground">
            <li>· Two-step: approve → seal. ~30 seconds.</li>
            <li>· Once sealed, no one can read your balance.</li>
            <li>· Reverse anytime via Convert to USDC.</li>
          </ul>
          <button
            type="button"
            onClick={() => onNavigate("pay")}
            className="dash-btn-primary mt-auto w-full"
          >
            <Shield className="h-4 w-4" />
            Make {usdcNum > 0 ? `${Math.min(25, Math.floor(usdcNum))}` : "25"} USDC private
          </button>
        </section>
      </motion.aside>
    </div>
  );
}
