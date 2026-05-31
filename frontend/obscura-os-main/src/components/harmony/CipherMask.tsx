import { cn } from "@/lib/utils";

export type CipherMaskSize = "sm" | "md" | "lg" | "xl";

/** Frosted vertical tiles — reference-style encrypted character mask. */
export function CipherMask({
  blocks = 6,
  size = "md",
  className,
  delayStep = 80,
}: {
  blocks?: number;
  size?: CipherMaskSize;
  className?: string;
  /** Stagger between tiles (ms). Reference uses ~80ms steps. */
  delayStep?: number;
}) {
  return (
    <span className={cn("cipher-mask", className)} aria-hidden>
      {Array.from({ length: blocks }, (_, i) => (
        <span
          key={i}
          className={cn("cipher-block", `cipher-block-${size}`)}
          style={{ animationDelay: `${i * delayStep}ms` }}
        />
      ))}
    </span>
  );
}
