import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { CipherDecryptReveal } from "@/components/harmony/CipherDecryptReveal";
import type { CipherMaskSize } from "@/components/harmony/CipherMask";

/** Large sealed stat display — cipher tiles or reveal-dissolve value. Presentation only. */
export function EncryptedStatBlock({
  value,
  isRevealed,
  onReveal,
  unit,
  size = "xl",
  className,
}: {
  value?: string | null;
  isRevealed?: boolean;
  onReveal?: () => void;
  unit?: string;
  size?: CipherMaskSize;
  className?: string;
}) {
  const displayValue = value != null ? String(value) : null;

  return (
    <div className={cn("relative min-w-0 max-w-full", className)}>
      <div className="flex flex-wrap items-end gap-2 min-w-0 max-w-full">
        <CipherDecryptReveal
          revealed={!!(isRevealed && displayValue)}
          value={displayValue}
          blocks={6}
          size={size}
          tone="metric"
          suffix={unit ? <span className="pb-1 text-xs text-muted-foreground shrink-0">{unit}</span> : undefined}
        />
        {!isRevealed && onReveal ? (
          <button type="button" onClick={onReveal} className="ref-ghost-action text-xs shrink-0">
            <Eye className="h-3.5 w-3.5" />
            Decrypt
          </button>
        ) : null}
      </div>
    </div>
  );
}
