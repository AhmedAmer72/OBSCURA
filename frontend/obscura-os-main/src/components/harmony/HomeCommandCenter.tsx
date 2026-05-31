import { useMemo, useEffect } from "react";
import { CREDIT_MARKETS } from "@/config/credit";
import { useCreditMarkets, useUtilizationApr } from "@/hooks/useCredit";
import { useHealthEngine, type HealthSeverity } from "@/hooks/useHealthEngine";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Banknote,
  Check,
  ChevronRight,
  Coins,
  Droplets,
  Send,
  Shield,
  Sparkles,
  Vote,
  Wallet,
} from "lucide-react";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { PrivacyContextBanner } from "@/components/harmony/PrivacyContextBanner";
import {
  FAUCET_URL,
  HomeGettingStarted,
  type HomeStarterStep,
} from "@/components/harmony/pay-home/HomeGettingStarted";
import {
  PayHomeChecklistPanel,
  PayHomeMetricAction,
  PayHomeMetricCard,
  PayHomeMetricEmpty,
  PayHomeSealedValue,
  PayHomeWelcome,
  SealedCipherBars,
} from "@/components/harmony/pay-home/PayHomePremiumSections";
import { useOcUSDCBalance } from "@/hooks/useOcUSDCBalance";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import { useReputationSummary } from "@/hooks/useReputationSummary";
import { useValuesReveal, useCardCipherReveal } from "@/contexts/ValuesRevealContext";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  }),
};

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function formatOcusdcUsd(value: bigint | null | undefined): string | null {
  if (value === undefined || value === null) return null;
  const amount = Number(value) / 1e6;
  return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatBpsPercent(bps: number | bigint): string {
  return `${(Number(bps) / 100).toFixed(1)}%`;
}

function hfBadgeLabel(hf: number | null, severity: HealthSeverity): string {
  if (hf === null) return "No debt";
  const qual =
    severity === "safe"
      ? "Safe"
      : severity === "caution"
        ? "Watch"
        : severity === "warning"
          ? "Warning"
          : severity === "critical"
            ? "At risk"
            : "Idle";
  return `HF ${hf.toFixed(1)}× · ${qual}`;
}

function hfBadgeTone(severity: HealthSeverity): "success" | "warn" | "neutral" {
  if (severity === "safe" || severity === "idle") return "success";
  if (severity === "caution" || severity === "warning" || severity === "critical") return "warn";
  return "neutral";
}

/** Borrowed / (borrowed + maxBorrowable) — share of LLTV capacity in use. */
function creditLineUtilPercent(borrow: bigint, maxBorrowable: bigint): number {
  const capacity = borrow + maxBorrowable;
  if (capacity === 0n) return 0;
  return Math.min(100, Math.round(Number((borrow * 100n) / capacity)));
}

const FLYWHEEL = [
  { layer: 1, title: "Private Payments", hint: "Shielded USDC", to: "/pay", doneKey: "pay" as const },
  { layer: 2, title: "Private Credit", hint: "Position opened", to: "/credit", doneKey: "credit" as const },
  { layer: 3, title: "Governance", hint: "Cast first vote", to: "/vote", doneKey: "govern" as const },
  { layer: 4, title: "Elite Reputation", hint: "Reach Steady tier", to: "/vote", doneKey: "reputation" as const },
];

function MetricStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="dash-eyebrow text-[9px]">{label}</p>
      <p className={cn("mt-1 truncate text-[13px] font-medium", accent ? "text-[hsl(var(--success))]" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function FlywheelStrip({
  completed,
}: {
  completed: Record<(typeof FLYWHEEL)[number]["doneKey"], boolean>;
}) {
  const activeCount = FLYWHEEL.filter((l) => completed[l.doneKey]).length;
  return (
    <section className="dash-card overflow-hidden p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="dash-eyebrow">The Obscura flywheel</p>
          <h2 className="mt-1 font-display text-xl tracking-tight text-foreground">
            Pay fuels Credit. Credit fuels Govern. Govern fuels Reputation.
          </h2>
        </div>
        <div className="text-right">
          <p className="font-display text-xl text-foreground">
            {activeCount} <span className="text-muted-foreground">/ {FLYWHEEL.length}</span>
          </p>
          <p className="dash-eyebrow text-[9px]">Ecosystem layers active</p>
        </div>
      </div>
      <div className="home-flywheel-grid mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {FLYWHEEL.map((item, index) => {
          const done = completed[item.doneKey];
          const active = !done && index === activeCount;
          return (
            <Link
              key={item.layer}
              to={item.to}
              className={cn(
                "home-flywheel-layer group relative flex flex-col rounded-xl border p-4 transition-colors",
                done
                  ? "border-[hsl(var(--dash-mint-border))] bg-[hsl(var(--dash-mint))]"
                  : active
                    ? "border-border-strong bg-card hover:bg-muted/30"
                    : "border-border bg-card opacity-70 hover:opacity-100 hover:bg-muted/30",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Layer {item.layer}
                </span>
                {done ? (
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-[hsl(var(--success))] text-background">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                ) : active ? (
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--success))]" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-border" />
                )}
              </div>
              <p className="mt-3 font-display text-base text-foreground">{item.title}</p>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{item.hint}</p>
              {index < FLYWHEEL.length - 1 ? (
                <ArrowRight className="home-flywheel-arrow absolute -right-[11px] top-1/2 hidden h-4 w-4 -translate-y-1/2 text-muted-foreground/40 xl:block" />
              ) : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function GlancePanel({
  connected,
  hfBadge,
  hfTone,
  borrowedUsd,
  collateralUsd,
  borrowedRevealed,
  collateralRevealed,
  onToggleBorrowed,
  onToggleCollateral,
}: {
  connected: boolean;
  hfBadge: string;
  hfTone: "success" | "warn" | "neutral";
  borrowedUsd: string | null;
  collateralUsd: string | null;
  borrowedRevealed: boolean;
  collateralRevealed: boolean;
  onToggleBorrowed: () => void;
  onToggleCollateral: () => void;
}) {
  return (
    <section className="dash-card overflow-hidden">
      <header className="flex items-center justify-between gap-3 border-b border-border/70 px-5 py-4">
        <h2 className="font-display text-lg tracking-tight text-foreground">Pay &amp; Credit at a glance</h2>
        <Link to="/pay?tab=activity" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
          Full activity
          <ArrowRight className="h-3 w-3" />
        </Link>
      </header>
      <div className="grid gap-0 md:grid-cols-2 md:divide-x md:divide-border/60">
        <div className="space-y-3 border-b border-border/60 p-5 md:border-b-0">
          <div className="flex items-center justify-between gap-2">
            <p className="dash-eyebrow">Pay · Automations</p>
            <span className="dash-badge dash-badge-success">2 active</span>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center justify-between gap-2">
              <span>Stream to 0x1234…7C9E</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">Live</span>
            </li>
            <li className="flex items-center justify-between gap-2">
              <span>Escrow #3</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.12em]">Pending</span>
            </li>
          </ul>
          <p className="text-[11px] text-muted-foreground/70">Next settlement · open Automate to manage</p>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between gap-2">
            <p className="dash-eyebrow">Credit · Position</p>
            <span
              className={cn(
                "dash-badge",
                hfTone === "success" && "dash-badge-success",
                hfTone === "warn" && "dash-badge-warn",
              )}
            >
              {hfBadge}
            </span>
          </div>
          <div className="home-glance-sealed">
            <div className="home-glance-sealed__tile">
              <SealedCipherBars
                size="md"
                bars={5}
                valueTone="glance"
                caption={connected ? "Borrowed · sealed" : "Connect wallet"}
                revealed={borrowedRevealed && connected}
                value={borrowedRevealed && connected ? borrowedUsd : null}
                onToggleReveal={connected ? onToggleBorrowed : undefined}
              />
            </div>
            <div className="home-glance-sealed__tile">
              <SealedCipherBars
                size="md"
                bars={5}
                valueTone="glance"
                caption={connected ? "Collateral · sealed" : "Connect wallet"}
                revealed={collateralRevealed && connected}
                value={collateralRevealed && connected ? collateralUsd : null}
                onToggleReveal={connected ? onToggleCollateral : undefined}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground/70">Borrowed &amp; collateral sealed — reveal on Credit</p>
          <Link to="/credit" className="dash-btn-outline inline-flex h-9 px-3 text-xs">
            Open Credit
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function HomeCommandCenter() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const onboarding = useOnboardingState();
  const { decrypted, reveal, busy: revealBusy } = useOcUSDCBalance();
  const usdcBalance = useUSDCBalance();
  const { summary } = useReputationSummary();
  const { revealed: masterRevealed, setRevealed: setMasterRevealed } = useValuesReveal();
  const balanceReveal = useCardCipherReveal();
  const borrowReveal = useCardCipherReveal();
  const glanceBorrowReveal = useCardCipherReveal();
  const glanceCollateralReveal = useCardCipherReveal();
  const creditHealth = useHealthEngine();
  const { markets: creditMarkets, refresh: refreshCreditMarkets } = useCreditMarkets();

  useEffect(() => {
    void refreshCreditMarkets();
  }, [refreshCreditMarkets]);

  const canonicalMarket = useMemo(
    () => creditMarkets.find((m) => m.isCanonical) ?? creditMarkets[0] ?? CREDIT_MARKETS.find((m) => m.isCanonical),
    [creditMarkets],
  );

  const canonicalHealth = useMemo(
    () => creditHealth.perMarket.find((s) => s.market.isCanonical) ?? creditHealth.perMarket[0],
    [creditHealth.perMarket],
  );

  const { aprBps } = useUtilizationApr(canonicalMarket?.utilizationBps);

  const maxBorrowUsd = formatOcusdcUsd(canonicalHealth?.maxBorrowable);
  const borrowedUsd = formatOcusdcUsd(canonicalHealth?.borrow);
  const collateralUsd = formatOcusdcUsd(canonicalHealth?.collateral);
  const creditHf = canonicalHealth?.hf ?? null;
  const creditHfSeverity = canonicalHealth?.severity ?? "idle";
  const creditLineUtil = canonicalHealth
    ? creditLineUtilPercent(canonicalHealth.borrow, canonicalHealth.maxBorrowable)
    : 0;
  const poolUtilLabel =
    canonicalMarket?.utilizationBps != null ? formatBpsPercent(canonicalMarket.utilizationBps) : "—";
  const borrowAprLabel = aprBps != null ? `${(aprBps / 100).toFixed(2)}%` : "—";
  const lltvLabel = canonicalMarket
    ? `${(canonicalMarket.lltvBps / 100).toFixed(0)}% LLTV`
    : "86% LLTV";
  const hasCreditPosition =
    (canonicalHealth?.collateral ?? 0n) > 0n || (canonicalHealth?.borrow ?? 0n) > 0n;

  useEffect(() => {
    const shouldDecrypt = masterRevealed || balanceReveal.isVisible;
    if (!shouldDecrypt || !isConnected || decrypted != null || revealBusy) return;
    void reveal().catch(() => undefined);
  }, [masterRevealed, balanceReveal.isVisible, isConnected, decrypted, revealBusy, reveal]);

  const greeting = getGreeting();
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const ocDisplay =
    decrypted != null ? (Number(decrypted) / 1_000_000).toFixed(2) : null;
  const showBalance = balanceReveal.isVisible && !!ocDisplay;
  const hasPrivateUsdc = ocDisplay != null && Number(ocDisplay) > 0;
  const repPoints = summary?.totalCappedWeight ?? 0;
  const repProgress = Math.min(100, Math.round((repPoints / 100) * 100));
  const usdcNum = usdcBalance ? Number.parseFloat(usdcBalance) : 0;
  const balanceReference =
    usdcNum > 0 ? `≈ $${usdcNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} reference` : undefined;

  const setupSteps = useMemo(
    () => [
      { title: "Connect wallet", done: isConnected },
      { title: "Get ETH for gas", done: isConnected },
      { title: "Add testnet USDC", done: onboarding.hasUsdc ?? false },
      { title: "Shield to ocUSDC", done: hasPrivateUsdc },
      { title: "Register stealth inbox", done: onboarding.isStealthRegistered },
      { title: "Enable paymaster", done: false },
      { title: "Review privacy settings", done: onboarding.isStealthRegistered },
    ],
    [hasPrivateUsdc, isConnected, onboarding.hasUsdc, onboarding.isStealthRegistered],
  );

  const doneCount = setupSteps.filter((s) => s.done).length;
  const progress = setupSteps.length ? (doneCount / setupSteps.length) * 100 : 0;

  const starterSteps: HomeStarterStep[] = useMemo(
    () => [
      {
        id: "connect",
        icon: Wallet,
        title: "Connect your wallet",
        description: "Switch to Arbitrum Sepolia in your wallet, then connect. Nothing is read until you approve.",
        done: isConnected,
        actionLabel: "Connect",
        onAction: () => window.dispatchEvent(new CustomEvent("obscura:connect-wallet")),
      },
      {
        id: "faucet",
        icon: Droplets,
        title: "Get testnet USDC",
        description: "Fund your wallet with free USDC from Circle's faucet (Arbitrum Sepolia). You need USDC before sealing or sending.",
        done: onboarding.hasUsdc ?? false,
        actionLabel: "Get USDC",
        externalHref: FAUCET_URL,
      },
      {
        id: "shield",
        icon: Banknote,
        title: "Make USDC private (ocUSDC)",
        description: "Shield plain USDC into encrypted ocUSDC. Balances stay masked on-chain until you choose to reveal.",
        done: hasPrivateUsdc,
        actionLabel: "Make private",
        onAction: () => navigate("/pay?tab=pay&sub=convert"),
      },
      {
        id: "inbox",
        icon: Send,
        title: "Set up private receiving",
        description: "Register a stealth inbox so others can pay you without exposing your main address.",
        done: onboarding.isStealthRegistered,
        actionLabel: "Receive setup",
        onAction: () => navigate("/pay?tab=getpaid&sub=setup"),
      },
      {
        id: "send",
        icon: Shield,
        title: "Try a private payment",
        description: "Send sealed USDC or explore Credit and Govern — use Reveal only when you need exact numbers.",
        done: hasPrivateUsdc && (onboarding.isStealthRegistered ?? false),
        actionLabel: "Open Pay",
        onAction: () => navigate("/pay?tab=pay&sub=send"),
      },
    ],
    [hasPrivateUsdc, isConnected, navigate, onboarding.hasUsdc, onboarding.isStealthRegistered],
  );

  const starterDoneCount = starterSteps.filter((s) => s.done).length;

  const flywheelDone = {
    pay: hasPrivateUsdc || isConnected,
    credit: hasCreditPosition,
    govern: (summary?.signals?.vote_participated?.count ?? 0) > 0,
    reputation: repPoints > 0,
  };

  return (
    <div className="home-command-stack">
      <PrivacyContextBanner onDecryptAll={() => setMasterRevealed(true)} />

      <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
        <PayHomeWelcome
        eyebrow={`Sealed · ${greeting}`}
        title={isConnected && shortAddress ? `Welcome back, ${shortAddress}` : "Welcome to Obscura"}
        subtitle="Your privacy engine is active. Governance proposals, credit positions, and rewards — all in one sealed ledger. Reveal values only when you need them."
        badges={[
          { label: "Private mode", tone: "success" },
          { label: "Reveal-on-demand", tone: "neutral" },
          { label: "Arbitrum Sepolia", tone: "neutral" },
        ]}
        />
      </motion.div>

      <motion.div
        custom={0.5}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="pay-home-metric-grid"
      >
        <PayHomeMetricCard
          label="Private balance"
          badge={hasPrivateUsdc ? "Sealed" : "Empty"}
          badgeTone={hasPrivateUsdc ? "success" : "warn"}
          footer={
            <>
              <PayHomeMetricAction label="Send" icon={Send} primary onClick={() => navigate("/pay?tab=pay&sub=send")} />
              <PayHomeMetricAction label="Receive" onClick={() => navigate("/pay?tab=getpaid&sub=inbox")} />
            </>
          }
        >
          {isConnected ? (
            <>
              <p className="mb-3 text-sm font-medium text-foreground">ocUSDC · Private USDC</p>
              <PayHomeSealedValue
                revealed={showBalance}
                value={ocDisplay}
                reference={showBalance ? undefined : balanceReference}
                onToggleReveal={balanceReveal.toggle}
                revealBusy={revealBusy}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
                <MetricStat label="Last private tx" value="4h 12m ago" />
                <MetricStat label="FHE proof" value="Verified" accent />
              </div>
            </>
          ) : (
            <PayHomeMetricEmpty
              message="Connect wallet to view sealed balance."
              hint="Encrypted ocUSDC stays masked until you connect."
            />
          )}
        </PayHomeMetricCard>

        <PayHomeMetricCard
          label="Borrowing power"
          badge={
            isConnected && canonicalHealth
              ? hfBadgeLabel(creditHf, creditHfSeverity)
              : "Sealed"
          }
          badgeTone={isConnected ? hfBadgeTone(creditHfSeverity) : "neutral"}
          progress={isConnected ? creditLineUtil : undefined}
          progressLabel={
            isConnected
              ? `Credit line · ${creditLineUtil}% used`
              : undefined
          }
          footer={
            <>
              <PayHomeMetricAction label="Borrow" icon={Coins} primary onClick={() => navigate("/credit?tab=borrow")} />
              <PayHomeMetricAction label="Deposit" onClick={() => navigate("/credit?tab=position")} />
            </>
          }
        >
          {isConnected ? (
            <>
              <p className="mb-3 text-sm font-medium text-foreground">
                Private credit line · {lltvLabel}
              </p>
              <SealedCipherBars
                size="lg"
                bars={5}
                caption={
                  (canonicalHealth?.maxBorrowable ?? 0n) > 0n
                    ? "Available to borrow · sealed"
                    : "Supply collateral · sealed"
                }
                revealed={borrowReveal.isVisible}
                value={borrowReveal.isVisible ? maxBorrowUsd : null}
                onToggleReveal={borrowReveal.toggle}
              />
              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border/60 pt-3">
                <MetricStat label="Line used" value={`${creditLineUtil}%`} />
                <MetricStat label="Borrow APR" value={borrowAprLabel} />
                <MetricStat label="Pool util." value={poolUtilLabel} />
              </div>
            </>
          ) : (
            <PayHomeMetricEmpty
              message="Connect wallet to view borrowing power."
              hint="Reads max borrowable from the canonical ocUSDC credit market."
            />
          )}
        </PayHomeMetricCard>

        <PayHomeMetricCard
          label="Governance"
          badge="2 ending"
          badgeTone="warn"
          footer={
            <>
              <PayHomeMetricAction label="Vote now" icon={Vote} primary onClick={() => navigate("/vote?tab=proposals&mode=vote")} />
              <PayHomeMetricAction label="Rewards" onClick={() => navigate("/vote?tab=rewards")} />
            </>
          }
        >
          <p className="text-sm font-medium text-foreground">FHE ballots · Treasury · Rewards</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="dash-metric-value text-4xl">3</span>
            <span className="text-[13px] text-muted-foreground">active proposals</span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">You've voted in 4 of 12 total</p>
          <p className="mt-3 rounded-lg border border-amber-500/25 bg-amber-500/[0.06] px-3 py-2 text-[11px] text-amber-900">
            0.004 ETH rewards pending · claim after each finalized vote
          </p>
        </PayHomeMetricCard>

        <PayHomeMetricCard
          label="Reputation"
          badge="Active"
          badgeTone="success"
          footer={
            <>
              <PayHomeMetricAction label="How to grow" onClick={() => navigate("/identity?tab=reputation")} />
              <PayHomeMetricAction label="History" onClick={() => navigate("/identity?tab=activity")} />
            </>
          }
        >
          <p className="text-sm font-medium text-foreground">Cross-product identity</p>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="dash-metric-value text-4xl">{repPoints}</span>
            <span className="text-[13px] text-muted-foreground">/ 100 points</span>
          </div>
          <div className="mt-4 space-y-1.5">
            <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-[0.16em] text-muted-foreground">
              <span>Active</span>
              <span>Steady at 65</span>
            </div>
            <div className="dash-progress">
              <span style={{ width: `${repProgress}%` }} />
            </div>
            <p className="pt-1 text-[11px] text-muted-foreground">Reach Steady → unlock +4% LLTV on every borrow</p>
          </div>
        </PayHomeMetricCard>
      </motion.div>

      <motion.div custom={0.85} variants={fadeUp} initial="hidden" animate="visible">
        <HomeGettingStarted steps={starterSteps} doneCount={starterDoneCount} total={starterSteps.length} />
      </motion.div>

      <motion.div custom={1.2} variants={fadeUp} initial="hidden" animate="visible">
        <FlywheelStrip completed={flywheelDone} />
      </motion.div>

      <motion.div custom={1.4} variants={fadeUp} initial="hidden" animate="visible" className="grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <GlancePanel
          connected={isConnected}
          hfBadge={
            isConnected && canonicalHealth
              ? hfBadgeLabel(creditHf, creditHfSeverity)
              : "Sealed"
          }
          hfTone={isConnected ? hfBadgeTone(creditHfSeverity) : "neutral"}
          borrowedUsd={borrowedUsd}
          collateralUsd={collateralUsd}
          borrowedRevealed={glanceBorrowReveal.isVisible}
          collateralRevealed={glanceCollateralReveal.isVisible}
          onToggleBorrowed={glanceBorrowReveal.toggle}
          onToggleCollateral={glanceCollateralReveal.toggle}
        />
        <PayHomeChecklistPanel
          title="Your private setup"
          subtitle={`${doneCount} of ${setupSteps.length} sealed`}
          progress={progress}
          doneCount={doneCount}
          total={setupSteps.length}
          footer={
            <Link to="/pay?tab=home" className="dash-btn-primary inline-flex h-9 px-4 text-xs">
              Continue in Pay
              <Sparkles className="h-3.5 w-3.5" />
            </Link>
          }
        >
          {setupSteps.map((step, index) => (
            <div key={step.title} className="flex items-center gap-3 px-5 py-3">
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  step.done
                    ? "border-[hsl(var(--success))] bg-[hsl(var(--success))] text-background"
                    : "border-border bg-card text-muted-foreground/40",
                )}
              >
                {step.done ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm", step.done ? "text-muted-foreground line-through" : "text-foreground")}>
                  {step.title}
                </p>
                {!step.done && index === doneCount ? (
                  <p className="text-[11px] text-muted-foreground">Next recommended step</p>
                ) : null}
              </div>
            </div>
          ))}
        </PayHomeChecklistPanel>
      </motion.div>
    </div>
  );
}
