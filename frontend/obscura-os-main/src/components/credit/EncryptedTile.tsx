/**
 * EncryptedTile — privacy-first encrypted value tile (premium light theme).
 */
import { useEffect, useRef, useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { CipherDecryptReveal } from "@/components/harmony/CipherDecryptReveal";
import { cn } from "@/lib/utils";

interface EncryptedTileProps {
  label: string;
  description?: string;
  symbol: string;
  displayValue: string | null;
  revealed: boolean;
  onReveal?: () => void;
  revealDurationSec?: number;
  onExpire?: () => void;
  loading?: boolean;
  accent?: "emerald" | "violet" | "amber" | "blue";
  className?: string;
}

const ACCENT_CLASSES: Record<string, { text: string; ring: string; wash: string }> = {
  emerald: {
    text: "text-[hsl(var(--dash-forest))]",
    ring: "hsl(var(--dash-forest))",
    wash: "bg-[hsl(var(--dash-mint)/0.7)]",
  },
  violet: {
    text: "text-[hsl(var(--dash-forest))]",
    ring: "hsl(var(--dash-forest))",
    wash: "bg-[hsl(var(--dash-mint)/0.55)]",
  },
  amber: {
    text: "text-[hsl(var(--dash-forest))]",
    ring: "hsl(var(--dash-forest))",
    wash: "bg-[hsl(var(--dash-mint)/0.55)]",
  },
  blue: {
    text: "text-[hsl(var(--dash-forest))]",
    ring: "hsl(var(--dash-forest))",
    wash: "bg-[hsl(var(--dash-mint)/0.55)]",
  },
};

export default function EncryptedTile({
  label,
  description,
  symbol,
  displayValue,
  revealed,
  onReveal,
  revealDurationSec = 30,
  onExpire,
  loading = false,
  accent = "violet",
  className = "",
}: EncryptedTileProps) {
  const [secondsLeft, setSecondsLeft] = useState(revealDurationSec);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ac = ACCENT_CLASSES[accent] ?? ACCENT_CLASSES.violet;

  useEffect(() => {
    if (revealed) {
      setSecondsLeft(revealDurationSec);
      timerRef.current = setInterval(() => {
        setSecondsLeft((s) => {
          if (s <= 1) {
            clearInterval(timerRef.current!);
            setTimeout(() => onExpire?.(), 0);
            return 0;
          }
          return s - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setSecondsLeft(revealDurationSec);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [revealed, revealDurationSec]); // eslint-disable-line react-hooks/exhaustive-deps

  const radius = 10;
  const circumference = 2 * Math.PI * radius;
  const dash = revealed ? circumference * (secondsLeft / revealDurationSec) : circumference;

  return (
    <div className={cn("flex min-h-[8.5rem] select-none flex-col gap-3 rounded-2xl border border-[hsl(var(--dash-forest)/0.12)] bg-white/90 p-4 shadow-[0_1px_2px_hsl(var(--dash-forest)/0.08)]", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-start gap-2">
          <span className={cn("mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-[hsl(var(--dash-forest)/0.14)]", ac.wash)}>
            <Shield className={cn("h-3.5 w-3.5", ac.text)} />
          </span>
          <div className="min-w-0">
            <span className="block text-sm font-semibold leading-tight text-foreground">{label}</span>
            {description ? (
              <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">{description}</span>
            ) : null}
          </div>
        </div>

        {revealed && (
          <svg width="26" height="26" viewBox="0 0 26 26" className="shrink-0" aria-hidden>
            <circle cx="13" cy="13" r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle
              cx="13"
              cy="13"
              r={radius}
              fill="none"
              stroke={ac.ring}
              strokeWidth="2"
              strokeDasharray={`${dash} ${circumference}`}
              strokeDashoffset={circumference * 0.25}
              strokeLinecap="round"
              style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dasharray 1s linear" }}
            />
            <text x="13" y="17" textAnchor="middle" fontSize="7" fill="hsl(var(--dash-forest))" fontFamily="Inter, sans-serif">
              {secondsLeft}
            </text>
          </svg>
        )}
      </div>

      {loading ? (
        <div className="cipher-decrypt-stage cipher-decrypt-stage--metric min-h-[2.5rem] flex items-center">
          <span className="text-xs text-muted-foreground animate-pulse">Loading…</span>
        </div>
      ) : (
        <div
          className={cn(!revealed && onReveal ? "cursor-pointer" : undefined)}
          onClick={!revealed && onReveal ? onReveal : undefined}
          role={!revealed && onReveal ? "button" : undefined}
          tabIndex={!revealed && onReveal ? 0 : undefined}
          onKeyDown={
            !revealed && onReveal
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") onReveal();
                }
              : undefined
          }
        >
          <CipherDecryptReveal
            revealed={revealed && displayValue !== null}
            value={displayValue}
            blocks={6}
            size="lg"
            tone="metric"
            suffix={
              revealed && displayValue !== null ? (
                <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground shrink-0">
                  {symbol}
                </span>
              ) : undefined
            }
          />
        </div>
      )}

      {!revealed && !loading && onReveal && (
        <button
          type="button"
          onClick={onReveal}
          className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--dash-forest)/0.75)] transition-colors hover:text-[hsl(var(--dash-forest))]"
        >
          <Eye className="h-3.5 w-3.5" /> Reveal sealed value
        </button>
      )}

      {revealed && !loading && (
        <button
          type="button"
          onClick={onExpire}
          className="mt-auto inline-flex items-center gap-1.5 text-[12px] font-medium text-[hsl(var(--dash-forest)/0.75)] transition-colors hover:text-[hsl(var(--dash-forest))]"
        >
          <EyeOff className="h-3.5 w-3.5" /> Hide value
        </button>
      )}
    </div>
  );
}
