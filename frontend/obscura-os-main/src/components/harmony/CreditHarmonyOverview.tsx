import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownToLine,
  ArrowUpRight,
  CheckCircle2,
  Landmark,
  PiggyBank,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { CreditReputationPanel } from "@/components/credit/CreditReputationPanel";
import { SealedCipherBars } from "@/components/harmony/pay-home/PayHomePremiumSections";
import { useCardCipherReveal } from "@/contexts/ValuesRevealContext";
import {
  HarmonyKpi,
  HarmonyKpiGrid,
  HarmonySection,
} from "@/components/harmony/harmony-ui";
import type { CreditMarketMeta } from "@/hooks/useCreditMarkets";
import type { CreditVaultMeta } from "@/hooks/useCreditVaults";
import { useMarketPosition, useUtilizationApr } from "@/hooks/useCredit";
import { BETA_LIQUIDITY_TARGET, BETA_POOL_LABEL, formatBetaOcusdc } from "@/hooks/useBetaBorrowLimit";

function formatUsd(value?: bigint) {
  if (value === undefined) return "—";
  const amount = Number(value) / 1e6;
  const maximumFractionDigits = amount > 0 && amount < 1 ? 6 : 2;
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits })}`;
}

function formatPositionUsd(value?: bigint | null) {
  if (value === null || value === undefined) return "—";
  return formatUsd(value);
}

function formatPercentBps(value?: bigint | number) {
  if (value === undefined) return "—";
  return `${(Number(value) / 100).toFixed(1)}%`;
}

export function CreditHarmonyOverview({
  markets,
  vaults: _vaults,
  onSupply,
  onBorrow,
  onOpenVault,
  onOpenPay,
  onSetup,
  onPosition,
}: {
  markets: CreditMarketMeta[];
  vaults: CreditVaultMeta[];
  onSupply: () => void;
  onBorrow: () => void;
  onOpenVault: () => void;
  onOpenPay: () => void;
  onSetup: () => void;
  onPosition: () => void;
}) {
  const primary = markets[0];
  const totalSupplied = markets.reduce((sum, market) => sum + (market.totalSupplyAssets ?? 0n), 0n);
  const totalBorrowed = markets.reduce((sum, market) => sum + (market.totalBorrowAssets ?? 0n), 0n);
  const availableLiquidity = totalSupplied >= totalBorrowed ? totalSupplied - totalBorrowed : 0n;
  const utilizationBps = totalSupplied > 0n ? Number((totalBorrowed * 10000n) / totalSupplied) : Number(primary?.utilizationBps ?? 0n);
  const { aprBps } = useUtilizationApr(primary?.utilizationBps);
  const borrowApy = aprBps === null ? "—" : `${(aprBps / 100).toFixed(2)}%`;
  const supplyApy = aprBps === null ? "—" : `${((aprBps * utilizationBps) / 10000 / 100).toFixed(2)}%`;
  const borrowedReveal = useCardCipherReveal();
  const collateralReveal = useCardCipherReveal();
  const position = useMarketPosition(primary?.address);

  const healthFactor = useMemo(() => {
    if (!primary || !position.plainBorrow || position.plainBorrow === 0n) return null;
    return (Number(position.plainCollateral ?? 0n) * primary.liqThresholdBps) /
      (Number(position.plainBorrow) * 10000);
  }, [primary, position.plainBorrow, position.plainCollateral]);
  const healthLabel = healthFactor === null
    ? "No debt"
    : healthFactor >= 1
      ? `HF ${healthFactor.toFixed(2)}× · Safe`
      : `HF ${healthFactor.toFixed(2)}× · Risk`;
  const hasPrivatePosition = (position.plainBorrow ?? 0n) > 0n || (position.plainCollateral ?? 0n) > 0n;

  const startSteps = [
    {
      label: "1. Get private USDC",
      body: "Credit uses Pay-backed ocUSDC. If you do not have ocUSDC yet, start in Pay and shield USDC first.",
      cta: "Open Pay",
      icon: WalletCards,
      onClick: onOpenPay,
      tone: "secondary",
    },
    {
      label: "2. Set up Credit",
      body: "Use the guided setup to continue with existing ocUSDC, approve the Credit flow, then enter collateral and borrow amount.",
      cta: "Set up credit",
      icon: ShieldCheck,
      onClick: onSetup,
      tone: "primary",
    },
    {
      label: "3. Borrow or manage",
      body: hasPrivatePosition
        ? "You already have a Credit position. Review health, repay, add collateral, or borrow more from Position."
        : "Ready users can go straight to the Borrow flow and open their first private credit line.",
      cta: hasPrivatePosition ? "Open position" : "Borrow privately",
      icon: hasPrivatePosition ? CheckCircle2 : ArrowDownToLine,
      onClick: hasPrivatePosition ? onPosition : onBorrow,
      tone: hasPrivatePosition ? "secondary" : "primary",
    },
  ] as const;

  return (
    <div className="credit-overview-grid">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 lg:col-span-2">
        <section className="dash-card overflow-hidden p-0">
          <div className="grid gap-0 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="border-b border-border bg-[hsl(var(--dash-mint)/0.45)] p-5 sm:p-6 lg:border-b-0 lg:border-r">
              <p className="dash-eyebrow text-[10px]">New to Credit? Start here</p>
              <h2 className="mt-2 font-display text-2xl tracking-tight text-foreground">
                Borrow privately in three clear steps.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Credit is powered by Pay-backed ocUSDC. Get private USDC, run the guided setup, then
                borrow against encrypted collateral while your amounts stay sealed on-chain.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={onSetup} className="dash-btn-primary h-10 px-4 text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Start guided setup
                </button>
                <button type="button" onClick={onOpenPay} className="dash-btn-outline h-10 px-4 text-xs">
                  <WalletCards className="h-3.5 w-3.5" />
                  Need ocUSDC?
                </button>
              </div>
            </div>

            <div className="grid gap-3 p-5 sm:p-6">
              {startSteps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="grid gap-3 rounded-2xl border border-border/70 bg-card p-3 sm:grid-cols-[auto_1fr_auto] sm:items-center">
                    <div className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-muted/50 text-[hsl(var(--dash-forest))]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground">{step.label}</p>
                      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                    </div>
                    <button
                      type="button"
                      onClick={step.onClick}
                      className={step.tone === "primary" ? "dash-btn-primary h-9 px-3 text-xs" : "dash-btn-outline h-9 px-3 text-xs"}
                    >
                      {step.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="dash-card p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="dash-eyebrow text-[10px]">Canonical market</p>
              <p className="mt-1 text-sm font-medium text-foreground">{primary?.label ?? BETA_POOL_LABEL}</p>
            </div>
            <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground">
              Public stats
            </span>
          </div>
          <HarmonyKpiGrid>
            <HarmonyKpi label="TVL">
              <span className="dash-metric-value text-3xl">{formatUsd(totalSupplied)}</span>
            </HarmonyKpi>
            <HarmonyKpi label="Utilization">
              <span className="dash-metric-value text-3xl text-[hsl(var(--success))]">{formatPercentBps(utilizationBps)}</span>
            </HarmonyKpi>
            <HarmonyKpi label="Borrow APR">
              <span className="dash-metric-value text-3xl">{borrowApy}</span>
            </HarmonyKpi>
            <HarmonyKpi label="Supply APY">
              <span className="dash-metric-value text-3xl">{supplyApy}</span>
            </HarmonyKpi>
          </HarmonyKpiGrid>
        </section>

        <section className="dash-card p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="dash-eyebrow text-[10px]">Your position</p>
              <p className="mt-1 font-display text-2xl text-foreground">
                {healthFactor === null ? "No active borrow" : healthFactor >= 1 ? "Sealed, healthy" : "Needs attention"}
              </p>
            </div>
            <span className="rounded-full border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--success))]">
              {healthLabel}
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Public shadow value</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="dash-eyebrow text-[9px]">Borrowed</p>
              <SealedCipherBars
                caption="Encrypted · reveal in Position"
                revealed={borrowedReveal.isVisible}
                value={borrowedReveal.isVisible ? formatPositionUsd(position.plainBorrow) : null}
                onToggleReveal={borrowedReveal.toggle}
              />
            </div>
            <div>
              <p className="dash-eyebrow text-[9px]">Collateral</p>
              <SealedCipherBars
                caption="Encrypted · reveal in Position"
                revealed={collateralReveal.isVisible}
                value={collateralReveal.isVisible ? formatPositionUsd(position.plainCollateral) : null}
                onToggleReveal={collateralReveal.toggle}
              />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button type="button" onClick={onBorrow} className="dash-btn-outline h-9 px-3 text-xs">
              Borrow more
            </button>
            <button type="button" onClick={onSupply} className="dash-btn-primary h-9 px-3 text-xs">
              Manage
              <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </section>
      </motion.div>

      <motion.aside initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.05 }} className="space-y-6">
        <section className="dash-card p-5 sm:p-6">
          <CreditReputationPanel compact />
        </section>

        <section className="dash-card flex h-full flex-col p-5 sm:p-6">
          <p className="dash-eyebrow text-[10px]">Earn</p>
          <p className="mt-2 text-sm font-medium text-foreground">Supply liquidity</p>
          <p className="mt-4 dash-metric-value text-4xl text-[hsl(var(--success))]">{supplyApy}</p>
          <p className="mt-1 text-[13px] text-muted-foreground">APY · canonical market</p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            Earn yield by supplying private USDC to the canonical market. Your supplied amount stays sealed.
          </p>
          <button type="button" onClick={onOpenVault} className="dash-btn-primary mt-5 w-full">
            <PiggyBank className="h-3.5 w-3.5" />
            Supply liquidity
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </motion.aside>

      <div className="mt-2 rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground lg:col-span-2">
        Health Factor is your buffer before liquidation. It uses public shadow values — no decryption needed.
      </div>

      <div className="lg:col-span-2">
        <section className="dash-card p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="dash-eyebrow text-[10px]">Early access liquidity</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Landmark className="h-4 w-4 text-[hsl(var(--success))]" />
                <p className="font-display text-2xl">{BETA_POOL_LABEL}</p>
              </div>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                Real Pay-backed ocUSDC supplied from the current treasury wallet. No synthetic TVL, no extra market, no faucet path.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-1">
              <div className="ref-mini-card">
                <p className="dash-eyebrow text-[9px]">Beta target</p>
                <p className="mt-1 font-mono text-sm text-foreground">{formatBetaOcusdc(BETA_LIQUIDITY_TARGET)} ocUSDC</p>
              </div>
              <div className="ref-mini-card">
                <p className="dash-eyebrow text-[9px]">Live borrowable</p>
                <p className="mt-1 font-mono text-sm text-foreground">{formatUsd(availableLiquidity)}</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="lg:col-span-2">
        <HarmonySection title="Beta liquidity pool" hint="Live public pool metrics from the canonical Pay-backed ocUSDC market.">
          <div className="grid gap-3 md:hidden">
            {markets.map((m) => (
              <div key={m.address} className="dash-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-base font-medium leading-snug">{m.label}</p>
                  <span className="rounded-full bg-muted px-2 py-1 font-mono text-[10px] text-muted-foreground">LLTV {m.lltvBps / 100}%</span>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="dash-eyebrow text-[9px]">Supplied</p>
                    <p className="mt-1 font-mono text-foreground">{formatUsd(m.totalSupplyAssets)}</p>
                  </div>
                  <div>
                    <p className="dash-eyebrow text-[9px]">Borrowed</p>
                    <p className="mt-1 font-mono text-foreground">{formatUsd(m.totalBorrowAssets)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="hidden overflow-hidden dash-card md:block">
            <div className="grid grid-cols-12 bg-surface px-6 py-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="col-span-4">Market</span>
              <span className="col-span-2">Supplied</span>
              <span className="col-span-2">Borrowed</span>
              <span className="col-span-1">LLTV</span>
              <span className="col-span-2">Est. supply APY</span>
              <span className="col-span-1 text-right">Util</span>
            </div>
            {markets.map((m) => (
              <div
                key={m.address}
                className="grid grid-cols-12 items-center border-t border-border px-6 py-4 transition-colors hover:bg-muted/40"
              >
                <span className="col-span-4 font-medium">{m.label}</span>
                <span className="col-span-2 font-mono text-sm text-muted-foreground">{formatUsd(m.totalSupplyAssets)}</span>
                <span className="col-span-2 font-mono text-sm text-muted-foreground">{formatUsd(m.totalBorrowAssets)}</span>
                <span className="col-span-1 font-mono text-sm">{m.lltvBps / 100}%</span>
                <span className="col-span-2 font-mono text-sm text-[hsl(var(--success))]">{m.address === primary?.address ? supplyApy : "—"}</span>
                <span className="col-span-1 flex items-center justify-end gap-2">
                  <span className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <span className="block h-full bg-accent" style={{ width: `${Math.min(100, Number(m.utilizationBps ?? 0n) / 100)}%` }} />
                  </span>
                </span>
              </div>
            ))}
          </div>
        </HarmonySection>
      </div>
    </div>
  );
}
