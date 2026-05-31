/**
 * PercentChips — 0 / 25 / 50 / 75 / 100 % quick-fill buttons.
 */
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PERCENTS = [0, 25, 50, 75, 100] as const;

interface Props {
  max: bigint;
  decimals?: number;
  onPick: (value: bigint) => void;
  className?: string;
  accent?: "violet" | "cyan" | "emerald";
}

export default function PercentChips({ max, decimals = 6, onPick, className = "" }: Props) {
  const pick = (pct: number) => {
    const value = (max * BigInt(pct)) / 100n;
    onPick(value);
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      {PERCENTS.map((pct) => (
        <motion.button
          key={pct}
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={() => pick(pct)}
          className="ref-ghost-action h-7 px-2 text-[10px] font-medium"
        >
          {pct === 0 ? "Clear" : `${pct}%`}
        </motion.button>
      ))}
    </div>
  );
}
