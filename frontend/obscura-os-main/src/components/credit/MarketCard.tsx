/**
 * MarketCard — market summary tile.
 */
import { Layers, ArrowRight, Activity } from "lucide-react";
import type { CreditMarketMeta } from "@/config/credit";
import { useUtilizationApr } from "@/hooks/useCredit";

interface Props {
  market: CreditMarketMeta & {
    totalSupplyAssets?: bigint;
    totalBorrowAssets?: bigint;
    utilizationBps?: bigint;
    borrowersCount?: bigint;
  };
  onAction?: () => void;
  active?: boolean;
  compact?: boolean;
}

const MarketCard = ({ market, onAction, active, compact }: Props) => {
  const { aprBps } = useUtilizationApr(market.utilizationBps);
  const util = market.utilizationBps !== undefined
    ? `${(Number(market.utilizationBps) / 100).toFixed(1)}%`
    : "—";
  const apr = aprBps !== null ? `${(aprBps / 100).toFixed(2)}%` : "—";
  const supplied = market.totalSupplyAssets !== undefined
    ? `$${(Number(market.totalSupplyAssets) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "—";

  return (
    <button
      type="button"
      onClick={onAction}
      className={`text-left w-full p-4 rounded-xl border transition group dash-card ${
        active
          ? "border-[hsl(var(--dash-forest))]/30 bg-[hsl(var(--dash-mint))]"
          : "hairline bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[hsl(var(--dash-forest))]" />
            <span className="text-[13px] font-medium text-foreground truncate">{market.label}</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1.5">
            LLTV {(market.lltvBps / 100).toFixed(0)}% · Liq bonus {(market.liqBonusBps / 100).toFixed(1)}%
          </p>
        </div>
        <span className="dash-badge text-[10px] tracking-[0.18em] uppercase font-mono">
          {market.isCanonical ? "CORE" : market.status === "legacy" ? "LEGACY" : "TEST"}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
        <div className="rounded-md bg-muted/40 border border-border/60 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Supplied</div>
          <div className="text-[12px] font-mono text-foreground">{supplied}</div>
        </div>
        <div className="rounded-md bg-muted/40 border border-border/60 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Util</div>
          <div className="text-[12px] font-mono text-amber-600">{util}</div>
        </div>
        <div className="rounded-md bg-muted/40 border border-border/60 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">APR</div>
          <div className="text-[12px] font-mono text-[hsl(var(--dash-forest))]">{apr}</div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[hsl(var(--dash-forest))] group-hover:opacity-80">
          <Activity className="w-3 h-3" /> Borrow <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </button>
  );
};

export default MarketCard;
