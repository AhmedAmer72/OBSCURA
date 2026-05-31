/**
 * VaultCard — vault summary tile.
 */
import { PiggyBank, ArrowRight } from "lucide-react";
import type { CreditVaultMeta } from "@/config/credit";

interface Props {
  vault: CreditVaultMeta & { publicTotalDeposited?: bigint; feeBps?: number };
  onAction?: () => void;
  active?: boolean;
  compact?: boolean;
}

const VaultCard = ({ vault, onAction, active, compact }: Props) => {
  const tvl = vault.publicTotalDeposited !== undefined
    ? `$${(Number(vault.publicTotalDeposited) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
    : "—";
  const fee = vault.feeBps !== undefined ? `${(vault.feeBps / 100).toFixed(2)}%` : "—";
  return (
    <button
      type="button"
      onClick={onAction}
      className={`text-left w-full p-4 rounded-xl border transition group dash-card ${
        active
          ? "border-[hsl(var(--success))]/30 bg-[hsl(var(--dash-mint))]"
          : "hairline bg-card hover:bg-muted/50"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <PiggyBank className="w-4 h-4 text-[hsl(var(--dash-forest))]" />
            <span className="text-[13px] font-medium text-foreground truncate">{vault.name}</span>
          </div>
          {vault.description && !compact && (
            <p className="text-[11.5px] text-muted-foreground mt-1.5 leading-relaxed">{vault.description}</p>
          )}
        </div>
        <span className="dash-badge dash-badge-success text-[10px] tracking-[0.18em] uppercase font-mono">
          {vault.riskTier}
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-md bg-muted/40 border border-border/60 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">TVL (mirror)</div>
          <div className="text-[13px] font-mono text-foreground">{tvl}</div>
        </div>
        <div className="rounded-md bg-muted/40 border border-border/60 px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Curator fee</div>
          <div className="text-[13px] font-mono text-foreground">{fee}</div>
        </div>
      </div>
      {!compact && (
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-[hsl(var(--success))]/80 group-hover:text-[hsl(var(--success))]">
          Manage <ArrowRight className="w-3 h-3" />
        </div>
      )}
    </button>
  );
};

export default VaultCard;
