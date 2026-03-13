import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, Eye, EyeOff, Lock, Shield, Sparkles, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { CipherDecryptReveal, type CipherValueTone } from "@/components/harmony/CipherDecryptReveal";
import type { CipherMaskSize } from "@/components/harmony/CipherMask";

function CipherRevealButton({
  revealed,
  onClick,
  busy,
  className,
}: {
  revealed: boolean;
  onClick: () => void;
  busy?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className={cn("ref-ghost-action mt-2 text-xs disabled:opacity-50", className)}
    >
      {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      {revealed ? "Hide value" : "Reveal value"}
    </button>
  );
}

/** Vertical cipher tiles — frosted mask for sealed balances (reference-style). */
export function SealedCipherBars({
  bars = 6,
  size = "md",
  reference,
  caption,
  className,
  revealed = false,
  value,
  suffix,
  onToggleReveal,
  revealBusy,
  valueTone = "metric",
}: {
  bars?: number;
  size?: CipherMaskSize;
  reference?: string;
  caption?: string;
  className?: string;
  revealed?: boolean;
  value?: string | null;
  suffix?: string;
  onToggleReveal?: () => void;
  revealBusy?: boolean;
  valueTone?: CipherValueTone;
}) {
  const showValue = revealed && value;

  return (
    <div className={cn("cipher-mask-stack min-w-0 max-w-full", className)}>
      <CipherDecryptReveal
        revealed={!!showValue}
        value={value}
        blocks={bars}
        size={size}
        tone={valueTone}
        suffix={
          suffix ? <span className="pb-1 text-xs text-muted-foreground shrink-0">{suffix}</span> : undefined
        }
      />
      {!showValue && reference ? (
        <p className="cipher-caption">
          <Shield className="h-3 w-3 shrink-0 text-[hsl(var(--success))]/80" aria-hidden />
          <span className="truncate">{reference}</span>
        </p>
      ) : !showValue && caption ? (
        <p className="cipher-caption">
          <Lock className="h-3 w-3 shrink-0 opacity-50" aria-hidden />
          <span className="truncate">{caption}</span>
        </p>
      ) : null}
      {onToggleReveal ? (
        <CipherRevealButton revealed={!!showValue} onClick={onToggleReveal} busy={revealBusy} />
      ) : null}
    </div>
  );
}

export function PayHomeSealedBanner({
  connected,
  onConnect,
  onDecryptAll,
}: {
  connected: boolean;
  onConnect?: () => void;
  onDecryptAll?: () => void;
}) {
  if (connected) {
    return (
      <div className="pay-home-banner dash-banner">
        <Lock className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
        <span className="flex-1">
          Your balances and positions are sealed. Reveal only when you need them.
        </span>
        {onDecryptAll ? (
          <button type="button" onClick={onDecryptAll} className="dash-btn-outline h-8 px-3 text-xs">
            Decrypt all
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="pay-home-banner dash-banner">
      <Lock className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" />
      <span className="flex-1">Encrypted values are sealed — connect wallet to reveal.</span>
      {onConnect ? (
        <button type="button" onClick={onConnect} className="dash-btn-outline h-8 px-3 text-xs">
          Connect
        </button>
      ) : null}
    </div>
  );
}

export function PayHomeWelcome({
  title,
  subtitle,
  badges,
  eyebrow,
}: {
  title: string;
  subtitle: string;
  badges: { label: string; tone?: "success" | "warn" | "neutral" }[];
  eyebrow?: string;
}) {
  return (
    <section className="pay-home-welcome flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="dash-eyebrow flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
            {eyebrow}
          </p>
        ) : null}
        <h1 className={cn("dash-hero-title text-3xl text-foreground sm:text-4xl", eyebrow && "mt-2")}>{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      </div>
      {badges.length > 0 ? (
        <div className="flex flex-wrap gap-2 lg:justify-end lg:pt-1">
          {badges.map((badge) => (
            <span
              key={badge.label}
              className={cn(
                "dash-badge",
                badge.tone === "success" && "dash-badge-success",
                badge.tone === "warn" && "dash-badge-warn",
              )}
            >
              {badge.tone === "success" ? (
                <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--success))]" />
              ) : null}
              {badge.label}
            </span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

export function PayHomeMetricCard({
  label,
  badge,
  badgeTone = "neutral",
  children,
  footer,
  progress,
  progressLabel,
}: {
  label: string;
  badge?: string;
  badgeTone?: "success" | "warn" | "neutral";
  children: ReactNode;
  footer?: ReactNode;
  progress?: number;
  progressLabel?: string;
}) {
  return (
    <article className="pay-home-metric group flex flex-col">
      <div className="pay-home-metric__ambient" aria-hidden />
      <header className="pay-home-metric__header">
        <p className="pay-home-metric__label">{label}</p>
        {badge ? (
          <span
            className={cn(
              "pay-home-metric__badge dash-badge shrink-0",
              badgeTone === "success" && "dash-badge-success",
              badgeTone === "warn" && "dash-badge-warn",
            )}
          >
            {badge}
          </span>
        ) : null}
      </header>

      <div className="pay-home-metric__body">{children}</div>

      {progress != null ? (
        <div className="pay-home-metric__progress">
          {progressLabel ? (
            <p className="pay-home-metric__progress-label">{progressLabel}</p>
          ) : null}
          <div className="dash-progress">
            <span style={{ width: `${Math.min(100, Math.max(0, progress))}%` }} />
          </div>
        </div>
      ) : null}

      {footer ? <footer className="pay-home-metric__footer">{footer}</footer> : null}
    </article>
  );
}

export function PayHomeMetricEmpty({
  message,
  hint,
}: {
  message: string;
  hint?: string;
}) {
  return (
    <div className="pay-home-metric-empty">
      <div className="pay-home-metric-empty__icon" aria-hidden>
        <Wallet className="h-4 w-4" />
      </div>
      <p className="pay-home-metric-empty__message">{message}</p>
      {hint ? <p className="pay-home-metric-empty__hint">{hint}</p> : null}
    </div>
  );
}

export function PayHomeSealedValue({
  revealed,
  value,
  suffix = "ocUSDC",
  reference,
  size = "lg",
  onToggleReveal,
  revealBusy,
}: {
  revealed: boolean;
  value: string | null;
  suffix?: string;
  reference?: string;
  size?: CipherMaskSize;
  onToggleReveal?: () => void;
  revealBusy?: boolean;
}) {
  const showValue = revealed && value;

  return (
    <div className="cipher-mask-stack pay-metric-sealed min-w-0 max-w-full">
      <CipherDecryptReveal
        revealed={!!showValue}
        value={value}
        blocks={6}
        size={size}
        tone="metric"
        suffix={
          suffix ? (
            <span className="pay-metric-sealed__unit normal-case tracking-normal shrink-0">{suffix}</span>
          ) : undefined
        }
      />
      {!showValue && suffix ? <p className="pay-metric-sealed__unit">{suffix}</p> : null}
      {!showValue && reference ? (
        <p className="cipher-caption">
          <Shield className="h-3 w-3 shrink-0 text-[hsl(var(--success))]/80" aria-hidden />
          <span className="truncate">{reference}</span>
        </p>
      ) : null}
      {onToggleReveal ? (
        <CipherRevealButton revealed={!!showValue} onClick={onToggleReveal} busy={revealBusy} />
      ) : null}
    </div>
  );
}

export function PayHomeMetricAction({
  label,
  onClick,
  primary,
  icon: Icon,
}: {
  label: string;
  onClick: () => void;
  primary?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(primary ? "dash-btn-primary h-9 px-3.5 text-xs" : "dash-btn-outline h-9 px-3.5 text-xs")}
    >
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
      {!primary ? <ChevronRight className="h-3 w-3 opacity-50" /> : null}
    </button>
  );
}

export type PayHomeRecommendedItem = {
  id: string;
  icon: LucideIcon;
  iconTone?: "green" | "amber" | "neutral";
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  urgent?: boolean;
};

export function PayHomeRecommended({ items }: { items: PayHomeRecommendedItem[] }) {
  if (items.length === 0) return null;

  return (
    <section className="pay-home-recommended dash-card overflow-hidden">
      <header className="flex items-center gap-2 border-b border-border/70 px-5 py-4">
        <Sparkles className="h-4 w-4 text-[hsl(var(--success))]" />
        <div>
          <h2 className="font-display text-lg tracking-tight text-foreground">What should you do next?</h2>
          <p className="text-xs text-muted-foreground">Quick actions based on your wallet right now</p>
        </div>
      </header>
      <ul className="divide-y divide-border/60">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/30">
              <span
                className={cn(
                  "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                  item.iconTone === "amber" && "bg-amber-100 text-amber-800",
                  item.iconTone === "green" && "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]",
                  (!item.iconTone || item.iconTone === "neutral") && "bg-muted text-foreground/70",
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">{item.title}</p>
                  {item.urgent ? (
                    <span className="dash-badge dash-badge-warn">Urgent</span>
                  ) : null}
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
              <button
                type="button"
                onClick={item.onAction}
                className="ref-ghost-action"
              >
                {item.actionLabel}
                <ArrowRight className="h-3 w-3" />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function PayHomeChecklistPanel({
  title,
  subtitle,
  progress,
  doneCount,
  total,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  progress: number;
  doneCount: number;
  total: number;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <section className="pay-home-checklist dash-card overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border/70 px-5 py-4">
        <div>
          <p className="dash-eyebrow">{title}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{subtitle}</p>
        </div>
        <div className="flex min-w-[140px] flex-col items-end gap-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {Math.round(progress)}% · {doneCount}/{total}
          </span>
          <div className="dash-progress w-full">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>
      <div className="divide-y divide-border/50">{children}</div>
      {footer ? <div className="border-t border-border/50 bg-muted/20 px-5 py-4">{footer}</div> : null}
    </section>
  );
}
