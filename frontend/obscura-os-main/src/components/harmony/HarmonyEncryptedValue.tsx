import { useCallback, useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { CipherDecryptReveal } from "@/components/harmony/CipherDecryptReveal";
import { HarmonyRevealChip } from "@/components/harmony/harmony-ui";

const DEFAULT_REVEAL_SECONDS = 300; // 5 minutes

export function HarmonyEncryptedValue({
  value,
  symbol = "USDC",
  defaultRevealed = false,
  size = "md",
  revealSessionSeconds = DEFAULT_REVEAL_SECONDS,
  className,
}: {
  value: string;
  symbol?: string;
  defaultRevealed?: boolean;
  size?: "sm" | "md" | "lg";
  revealSessionSeconds?: number;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startSession = useCallback(() => {
    setSecondsLeft(revealSessionSeconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current!);
          timerRef.current = null;
          setRevealed(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, [revealSessionSeconds]);

  const handleToggle = useCallback(() => {
    if (revealed) {
      // Hide immediately
      setRevealed(false);
      setSecondsLeft(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } else {
      setRevealed(true);
      startSession();
    }
  }, [revealed, startSession]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const sizes = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-5xl md:text-6xl",
  } as const;

  const cipherSize = size === "lg" ? "xl" : size === "md" ? "lg" : "md";

  return (
    <div className={cn("flex flex-wrap items-baseline gap-3 min-w-0 max-w-full", className)}>
      <div className={cn("min-w-0 max-w-full", size === "lg" ? "flex-1" : undefined)}>
        <CipherDecryptReveal
          revealed={revealed}
          value={value}
          blocks={6}
          size={cipherSize}
          tone={size === "lg" ? "metric" : size === "md" ? "metric" : "compact"}
        />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{symbol}</span>
      <button
        type="button"
        onClick={handleToggle}
        className="ml-1 grid h-6 w-6 place-items-center rounded-full text-muted-foreground hover:bg-muted"
        aria-label={revealed ? "Hide value" : "Reveal value"}
      >
        {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
      {revealed && secondsLeft > 0 && (
        <HarmonyRevealChip secondsLeft={secondsLeft} onHide={handleToggle} />
      )}
    </div>
  );
}
