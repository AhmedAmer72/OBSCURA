/**
 * HealthBar — color-coded health factor progress bar (premium light theme).
 */
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthBarProps {
  hf: number | null;
  loading?: boolean;
  className?: string;
}

function hfColor(hf: number): { bar: string; text: string; bg: string; icon: string } {
  if (hf < 1.15) return { bar: "bg-red-500", text: "text-red-600", bg: "bg-red-500/8 border-red-500/20", icon: "text-red-500" };
  if (hf < 1.5) return { bar: "bg-amber-500", text: "text-amber-700", bg: "bg-amber-500/8 border-amber-500/20", icon: "text-amber-600" };
  return { bar: "bg-[hsl(var(--success))]", text: "text-[hsl(var(--success))]", bg: "bg-[hsl(var(--success)/0.08)] border-[hsl(var(--success)/0.2)]", icon: "text-[hsl(var(--success))]" };
}

function hfLabel(hf: number): { label: string; hint: string } {
  if (hf < 1.15) return { label: "Danger", hint: "Liquidation risk — repay debt or add collateral now" };
  if (hf < 1.5) return { label: "Caution", hint: "Add collateral to buffer against price movements" };
  return { label: "Healthy", hint: "Your position is safely collateralised" };
}

function hfFill(hf: number): number {
  return Math.min(hf / 3, 1);
}

export default function HealthBar({ hf, loading = false, className = "" }: HealthBarProps) {
  if (loading) {
    return (
      <div className={cn("ref-mini-card flex items-center gap-2", className)}>
        <Activity className="h-4 w-4 animate-pulse text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading health factor…</span>
      </div>
    );
  }

  if (hf === null) {
    return (
      <div className={cn("ref-mini-card", className)}>
        <p className="text-xs text-muted-foreground">No borrow position — health factor N/A</p>
      </div>
    );
  }

  const colors = hfColor(hf);
  const info = hfLabel(hf);
  const fill = hfFill(hf);

  return (
    <div className={cn("rounded-xl border p-4 flex flex-col gap-3", colors.bg, className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {hf < 1.5 ? (
            <AlertTriangle className={cn("h-4 w-4", colors.icon)} />
          ) : (
            <CheckCircle2 className={cn("h-4 w-4", colors.icon)} />
          )}
          <span className="text-xs font-medium text-foreground">Health factor</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("font-display text-xl tabular-nums", colors.text)}>
            {hf.toFixed(2)}
          </span>
          <span className={cn("dash-eyebrow text-[9px]", colors.text, "opacity-80")}>
            {info.label}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", colors.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${fill * 100}%` }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>0</span>
        <span className="text-red-500/80">1.15 danger</span>
        <span className="text-amber-600/80">1.5 caution</span>
        <span>3+</span>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">{info.hint}</p>
    </div>
  );
}
