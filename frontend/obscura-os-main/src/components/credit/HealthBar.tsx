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

function hfColor(hf: number): { bar: string; text: string; chip: string; icon: string } {
  if (hf < 1.15) {
    return {
      bar: "bg-red-500",
      text: "text-red-600",
      chip: "border-red-500/20 bg-red-500/8 text-red-700",
      icon: "text-red-500",
    };
  }
  if (hf < 1.5) {
    return {
      bar: "bg-amber-500",
      text: "text-amber-700",
      chip: "border-amber-500/25 bg-amber-500/8 text-amber-800",
      icon: "text-amber-600",
    };
  }
  return {
    bar: "bg-[hsl(var(--dash-forest))]",
    text: "text-[hsl(var(--dash-forest))]",
    chip: "border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.8)] text-[hsl(var(--dash-forest))]",
    icon: "text-[hsl(var(--dash-forest))]",
  };
}

function hfLabel(hf: number): { label: string; hint: string } {
  if (hf < 1.15) return { label: "Danger", hint: "Repay debt or add collateral now to move away from liquidation risk." };
  if (hf < 1.5) return { label: "Caution", hint: "Add collateral or repay a portion of debt to create a safer buffer." };
  return { label: "Healthy", hint: "Your collateral buffer is currently above the caution zone." };
}

function hfFill(hf: number): number {
  return Math.min(hf / 3, 1);
}

export default function HealthBar({ hf, loading = false, className = "" }: HealthBarProps) {
  if (loading) {
    return (
      <div className={cn("ref-mini-card flex items-center gap-2", className)}>
        <Activity className="h-4 w-4 animate-pulse text-muted-foreground" />
        <span className="text-xs text-muted-foreground">Loading position health...</span>
      </div>
    );
  }

  if (hf === null) {
    return (
      <div className={cn("rounded-2xl border border-[hsl(var(--dash-forest)/0.12)] bg-[hsl(var(--dash-mint)/0.45)] p-4", className)}>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 text-[hsl(var(--dash-forest))]" />
          <div>
            <p className="text-sm font-semibold text-foreground">No active debt</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Health factor appears after you borrow. Add collateral first, then borrow from the action panel below.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const colors = hfColor(hf);
  const info = hfLabel(hf);
  const fill = hfFill(hf);

  return (
    <div className={cn("flex flex-col gap-4 rounded-2xl border border-[hsl(var(--dash-forest)/0.12)] bg-white/90 p-4 shadow-[0_1px_2px_hsl(var(--dash-forest)/0.08)]", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-[hsl(var(--dash-forest)/0.12)] bg-[hsl(var(--dash-mint)/0.65)]">
            {hf < 1.5 ? (
              <AlertTriangle className={cn("h-4 w-4", colors.icon)} />
            ) : (
              <CheckCircle2 className={cn("h-4 w-4", colors.icon)} />
            )}
          </span>
          <div>
            <span className="text-sm font-semibold text-foreground">Health factor</span>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Public risk score for your encrypted borrow.</p>
          </div>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn("font-display text-xl tabular-nums", colors.text)}>
            {hf.toFixed(2)}
          </span>
          <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", colors.chip)}>
            {info.label}
          </span>
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-[hsl(var(--dash-mint)/0.8)]">
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
        <span className="text-amber-700/80">1.5 caution</span>
        <span>3+</span>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">{info.hint}</p>
    </div>
  );
}
