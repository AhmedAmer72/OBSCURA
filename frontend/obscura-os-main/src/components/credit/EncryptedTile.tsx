/**
 * EncryptedTile — privacy-first encrypted value tile (premium light theme).
 */
import { useEffect, useRef, useState } from "react";
import { Shield, Eye, EyeOff } from "lucide-react";
import { CipherDecryptReveal } from "@/components/harmony/CipherDecryptReveal";
import { cn } from "@/lib/utils";

interface EncryptedTileProps {
  label: string;
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

const ACCENT_CLASSES: Record<string, { text: string; ring: string }> = {
  emerald: { text: "text-[hsl(var(--success))]", ring: "#34d399" },
  violet: { text: "text-violet-600", ring: "#7c3aed" },
  amber: { text: "text-amber-600", ring: "#d97706" },
  blue: { text: "text-blue-600", ring: "#2563eb" },
};

export default function EncryptedTile({
  label,
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
    <div className={cn("ref-mini-card flex flex-col gap-2.5 select-none", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Shield className="h-3 w-3 text-[hsl(var(--success))]/70" />
          <span className="dash-eyebrow text-[9px]">{label}</span>
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
            <text x="13" y="17" textAnchor="middle" fontSize="7" fill="hsl(var(--muted-foreground))" fontFamily="Inter, sans-serif">
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
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <Eye className="h-3 w-3" /> Tap to reveal
        </button>
      )}

      {revealed && !loading && (
        <button
          type="button"
          onClick={onExpire}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          <EyeOff className="h-3 w-3" /> Hide
        </button>
      )}
    </div>
  );
}
