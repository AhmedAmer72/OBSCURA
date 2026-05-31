import { motion } from "framer-motion";
import { ArrowUpRight, Landmark } from "lucide-react";
import { CreditReputationPanel } from "@/components/credit/CreditReputationPanel";
import { SealedCipherBars } from "@/components/harmony/pay-home/PayHomePremiumSections";
import { useValuesReveal, useCardCipherReveal } from "@/contexts/ValuesRevealContext";
import {
  HarmonyKpi,
  HarmonyKpiGrid,
  HarmonySection,
} from "@/components/harmony/harmony-ui";
import type { CreditMarketMeta } from "@/hooks/useCreditMarkets";
import type { CreditVaultMeta } from "@/hooks/useCreditVaults";
import { useUtilizationApr } from "@/hooks/useCredit";
import { BETA_LIQUIDITY_TARGET, BETA_POOL_LABEL, formatBetaOcusdc } from "@/hooks/useBetaBorrowLimit";

function formatUsd(value?: bigint) {
  if (value === undefined) return "—";
  const amount = Number(value) / 1e6;
  const maximumFractionDigits = amount > 0 && amount < 1 ? 6 : 2;
  return `$${amount.toLocaleString(undefined, { maximumFractionDigits })}`;
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
}: {
  markets: CreditMarketMeta[];
  vaults: CreditVaultMeta[];
  onSupply: () => void;
  onBorrow: () => void;
  onOpenVault: () => void;
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

  return (
    <div className="credit-overview-grid">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-6 lg:col-span-2">
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
              <p className="mt-1 font-display text-2xl text-foreground">Sealed, healthy</p>
            </div>
            <span className="rounded-full border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--success))]">
              HF 2.4× · Safe
            </span>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Public shadow value</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="dash-eyebrow text-[9px]">Borrowed</p>
              <SealedCipherBars
                caption="Encrypted · reveal in Position"
                revealed={borrowedReveal.isVisible}
                value={borrowedReveal.isVisible ? "$0.00" : null}
                onToggleReveal={borrowedReveal.toggle}
              />
            </div>
            <div>
              <p className="dash-eyebrow text-[9px]">Collateral</p>
              <SealedCipherBars
                caption="Encrypted · reveal in Position"
                revealed={collateralReveal.isVisible}
                value={collateralReveal.isVisible ? "$0.00" : null}
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
