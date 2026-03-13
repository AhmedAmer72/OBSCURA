import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Matrix-style glyph pool — katakana, digits, currency, symbols. */
const GLYPHS =
  "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿ0123456789ABCDEF$#%&⊕◇◆▓░";

function randomGlyph(): string {
  return GLYPHS[Math.floor(Math.random() * GLYPHS.length)] ?? "0";
}

function scrambleTo(text: string, lockedCount: number): string {
  return [...text]
    .map((ch, i) => {
      if (i < lockedCount) return ch;
      if (ch === " ") return " ";
      return randomGlyph();
    })
    .join("");
}

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3;
}

export type MatrixDecryptTone = "metric" | "glance" | "compact";

const toneDurationMs: Record<MatrixDecryptTone, number> = {
  metric: 1400,
  glance: 1000,
  compact: 780,
};

export function MatrixDecryptText({
  text,
  active,
  tone = "metric",
  className,
}: {
  text: string;
  active: boolean;
  tone?: MatrixDecryptTone;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  const durationMs = toneDurationMs[tone];
  const runIdRef = useRef(0);
  const [lockedCount, setLockedCount] = useState(0);
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      setLockedCount(text.length);
      return;
    }

    if (reduceMotion) {
      setDisplay(text);
      setLockedCount(text.length);
      return;
    }

    const runId = ++runIdRef.current;
    const len = text.length;
    setLockedCount(0);
    setDisplay(scrambleTo(text, 0));

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      if (runId !== runIdRef.current) return;

      const raw = Math.min(1, (now - start) / durationMs);
      const eased = easeOutCubic(raw);
      const locked = Math.min(len, Math.floor(eased * len));
      setLockedCount(locked);
      setDisplay(raw >= 1 ? text : scrambleTo(text, locked));

      if (raw < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(text);
        setLockedCount(len);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => {
      runIdRef.current += 1;
      cancelAnimationFrame(raf);
    };
  }, [text, active, durationMs, reduceMotion]);

  return (
    <span className={cn("cipher-matrix-text", className)} aria-label={text}>
      {[...display].map((ch, i) => (
        <span
          key={`${i}-${text.length}`}
          className={cn(
            "cipher-matrix-char",
            i < lockedCount ? "cipher-matrix-char--locked" : "cipher-matrix-char--scramble",
          )}
          aria-hidden={i >= lockedCount}
        >
          {ch}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </span>
  );
}
