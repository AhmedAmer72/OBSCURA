import { Eye, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { CipherDecryptReveal, type CipherValueTone } from "@/components/harmony/CipherDecryptReveal";
import type { CipherMaskSize } from "@/components/harmony/CipherMask";

interface EncryptedValueProps {
  value?: string | number | null;
  isRevealed?: boolean;
  onReveal?: () => void;
  size?: CipherMaskSize;
  className?: string;
  label?: string;
  blockCount?: number;
  unit?: string;
  valueTone?: CipherValueTone;
}

const sizeToTone: Record<CipherMaskSize, CipherValueTone> = {
  sm: "compact",
  md: "compact",
  lg: "metric",
  xl: "metric",
};

const sizeToBlocks: Record<CipherMaskSize, number> = {
  sm: 4,
  md: 5,
  lg: 6,
  xl: 6,
};

/** Inline encrypted value — cipher mask or reveal-dissolve. Presentation only. */
export function EncryptedValue({
  value,
  isRevealed = false,
  onReveal,
  size = "md",
  className = "",
  label,
  blockCount,
  unit,
  valueTone,
}: EncryptedValueProps) {
  const blocks = blockCount ?? sizeToBlocks[size];
  const tone = valueTone ?? sizeToTone[size];
  const displayValue = value != null ? String(value) : null;

  return (
    <div className={cn("flex flex-col gap-1 min-w-0 max-w-full", className)}>
      {label ? <span className="dash-eyebrow">{label}</span> : null}

      <div className="flex items-end gap-2 min-w-0 max-w-full">
        <CipherDecryptReveal
          revealed={isRevealed}
          value={displayValue}
          blocks={blocks}
          size={size}
          tone={tone}
          suffix={
            unit ? <span className="text-xs text-muted-foreground font-mono shrink-0">{unit}</span> : undefined
          }
        />
        {!isRevealed && onReveal ? (
          <button
            type="button"
            className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-[hsl(var(--dash-mint))] hover:text-[hsl(var(--dash-forest))] shrink-0"
            onClick={onReveal}
            title="Decrypt value — requires wallet"
          >
            <Eye size={14} />
          </button>
        ) : null}
      </div>

      {isRevealed && displayValue ? (
        <span className="flex items-center gap-0.5 text-xs text-[hsl(var(--success))]">
          <Shield size={10} aria-hidden />
          sealed
        </span>
      ) : null}
    </div>
  );
}

export { EncryptedStatBlock } from "@/components/harmony/EncryptedStatBlock";
