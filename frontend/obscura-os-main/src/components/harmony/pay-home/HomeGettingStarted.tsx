import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Banknote,
  Check,
  ExternalLink,
  Droplets,
  Send,
  Shield,
  Sparkles,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FAUCET_URL = "https://faucet.circle.com/";

export type HomeStarterStep = {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  done: boolean;
  actionLabel?: string;
  onAction?: () => void;
  externalHref?: string;
};

export function HomeGettingStarted({
  steps,
  doneCount,
  total,
}: {
  steps: HomeStarterStep[];
  doneCount: number;
  total: number;
}) {
  const progress = total ? Math.round((doneCount / total) * 100) : 0;
  const nextIndex = steps.findIndex((s) => !s.done);

  return (
    <section className="home-getting-started dash-card overflow-hidden">
      <header className="home-getting-started__header">
        <div className="flex items-start gap-3">
          <span className="home-getting-started__icon-badge" aria-hidden>
            <Sparkles className="h-4 w-4 text-[hsl(var(--success))]" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="dash-eyebrow">New here? Start here</p>
            <h2 className="font-display text-xl tracking-tight text-foreground">Getting started</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              Obscura runs on <strong className="font-medium text-foreground">Arbitrum Sepolia</strong> (testnet).
              Connect your wallet, fund with test USDC, then seal balances before you send, borrow, or vote privately.
            </p>
          </div>
        </div>
        <div className="home-getting-started__progress-meta">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {doneCount}/{total} complete
          </span>
          <div className="dash-progress w-full min-w-[120px]">
            <span style={{ width: `${progress}%` }} />
          </div>
        </div>
      </header>

      <ol className="home-getting-started__steps">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isNext = !step.done && index === nextIndex;
          return (
            <li
              key={step.id}
              className={cn(
                "home-getting-started__step",
                step.done && "home-getting-started__step--done",
                isNext && "home-getting-started__step--next",
              )}
            >
              <span
                className={cn(
                  "home-getting-started__step-marker",
                  step.done && "home-getting-started__step-marker--done",
                  isNext && !step.done && "home-getting-started__step-marker--next",
                )}
                aria-hidden
              >
                {step.done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : index + 1}
              </span>
              <span className="home-getting-started__step-icon" aria-hidden>
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className={cn("text-sm font-semibold", step.done ? "text-muted-foreground" : "text-foreground")}>
                  {step.title}
                </p>
                <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">{step.description}</p>
                {isNext ? (
                  <p className="mt-1 text-[11px] font-medium text-[hsl(var(--success))]">Recommended next step</p>
                ) : null}
              </div>
              {!step.done && step.externalHref ? (
                <a
                  href={step.externalHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ref-ghost-action shrink-0"
                >
                  {step.actionLabel ?? "Open"}
                  <ExternalLink className="h-3 w-3" />
                </a>
              ) : !step.done && step.onAction && step.actionLabel ? (
                <button type="button" onClick={step.onAction} className="ref-ghost-action shrink-0">
                  {step.actionLabel}
                  <ArrowRight className="h-3 w-3" />
                </button>
              ) : step.done ? (
                <span className="home-getting-started__done-label shrink-0">Done</span>
              ) : null}
            </li>
          );
        })}
      </ol>

      <div className="home-getting-started__faucet">
        <Droplets className="h-4 w-4 shrink-0 text-[hsl(var(--success))]" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">Need testnet USDC?</p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            Circle&apos;s faucet sends free USDC on supported testnets. Choose <strong className="font-medium text-foreground">Arbitrum Sepolia</strong> and paste your wallet address — then return here to make it private.
          </p>
        </div>
        <a
          href={FAUCET_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="dash-btn-outline shrink-0 text-xs"
        >
          Circle faucet
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </section>
  );
}

export { FAUCET_URL };
