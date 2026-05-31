/**
 * PaymentModeBar — premium fintech privacy-mode switch.
 *
 * Public Mode | Private Mode
 *
 * Public Mode uses public USDC + passkeys + sponsored transactions. Private Mode
 * uses encrypted ocUSDC + wallet execution.
 */
import { useCallback } from "react";
import { EyeOff, Fingerprint, Info, Lock, Wallet, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { usePaymentMode } from "@/contexts/PaymentModeContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface PaymentModeBarProps {
  /** Called when user clicks Public Mode but passkey setup is not complete */
  onSetupSmart?: () => void;
  className?: string;
  /** Compact pill toggle for form headers (screenshot-style) */
  variant?: "default" | "pill";
  /** Info icon explaining Private vs Public mode */
  showHelp?: boolean;
}

export function PaymentModeHelpTooltip({
  className,
  onPasskeySetup,
  isSmartAvailable = true,
}: {
  className?: string;
  /** Opens smart-account settings + user notice (passkey not ready). */
  onPasskeySetup?: () => void;
  isSmartAvailable?: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-white text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground data-[state=open]:border-[hsl(var(--dash-forest)/0.35)] data-[state=open]:bg-[hsl(var(--dash-mint)/0.65)] data-[state=open]:text-foreground",
            className,
          )}
          aria-label="About Private Mode and Public Mode"
        >
          <Info className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="bottom"
        align="end"
        className="max-w-[17rem] space-y-2 border-border p-3 text-xs leading-relaxed"
      >
        <p>
          <span className="font-semibold text-foreground">Private Mode</span> uses encrypted ocUSDC.
          Amounts stay sealed until you reveal them, and actions are confirmed with your wallet.
        </p>
        <p>
          <span className="font-semibold text-foreground">Public Mode</span> uses visible USDC through a
          passkey smart account with sponsored gas for everyday public payments.
        </p>
        {!isSmartAvailable && onPasskeySetup ? (
          <button
            type="button"
            onClick={onPasskeySetup}
            className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-md border border-[hsl(var(--dash-forest)/0.2)] bg-[hsl(var(--dash-mint)/0.5)] px-2.5 py-1.5 text-[11px] font-medium text-[hsl(var(--dash-forest))] transition-colors hover:bg-[hsl(var(--dash-mint))]"
          >
            <Fingerprint className="h-3 w-3" />
            Open passkey setup
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  );
}

function PasskeySetupButton({
  onClick,
  className,
  compact,
}: {
  onClick: () => void;
  className?: string;
  compact?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "pay-mode-setup-btn inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[hsl(var(--dash-forest)/0.22)] bg-[hsl(var(--dash-mint)/0.55)] font-medium text-[hsl(var(--dash-forest))] transition-colors hover:bg-[hsl(var(--dash-mint))] hover:border-[hsl(var(--dash-forest)/0.35)]",
        compact ? "h-8 px-2.5 text-[11px]" : "h-9 px-3 text-xs",
        className,
      )}
      aria-label="Set up passkey"
    >
      <Fingerprint className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
      <span className="pay-mode-setup-btn-label">Set up passkey</span>
    </button>
  );
}

function ModeSegment({
  active,
  dimmed,
  icon: Icon,
  label,
  description,
  badge,
  status,
  onClick,
}: {
  active: boolean;
  dimmed?: boolean;
  icon: typeof Wallet;
  label: string;
  description: string;
  badge?: string;
  status?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex min-w-0 flex-1 flex-col gap-0.5 px-3 py-3 text-left sm:px-5 sm:py-3.5",
        "transition-all duration-200 focus-visible:outline-none",
        active
          ? "bg-[hsl(var(--dash-forest))] text-[hsl(96_18%_97%)]"
          : dimmed
            ? "cursor-pointer opacity-60 hover:opacity-80 hover:bg-muted/30"
            : "hover:bg-muted/40",
      )}
    >
      <div className="flex items-center gap-2">
        <Icon
          className={cn(
            "h-[13px] w-[13px] shrink-0",
            active
              ? "text-[hsl(96_18%_97%/0.75)]"
              : dimmed
                ? "text-muted-foreground/50"
                : "text-foreground/65",
          )}
        />
        <span
          className={cn(
            "text-[13px] font-medium",
            active
              ? "text-[hsl(96_18%_97%)]"
              : dimmed
                ? "text-muted-foreground/60"
                : "text-foreground",
          )}
        >
          {label}
        </span>
        <AnimatePresence mode="wait">
          {active && (
            <motion.span
              key="active-badge"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="ml-auto rounded-full bg-[hsl(96_18%_97%/0.15)] px-2 py-px font-mono text-[9px] uppercase tracking-[0.14em] text-[hsl(96_18%_97%/0.8)]"
            >
              Active
            </motion.span>
          )}
          {!active && badge && (
            <motion.span
              key="setup-badge"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto rounded-full border border-border/50 px-1.5 py-px font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground/40"
            >
              {badge}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <p
        className={cn(
          "text-[11px] leading-tight",
          active
            ? "text-background/50"
            : dimmed
              ? "text-muted-foreground/35"
              : "text-muted-foreground/50",
        )}
      >
        {description}
      </p>
      {status && (
        <span
          className={cn(
            "mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.12em]",
            active
              ? "bg-background/15 text-background/65"
              : "bg-muted text-muted-foreground/55",
          )}
        >
          {status}
        </span>
      )}
    </button>
  );
}

export function PaymentModeBar({
  onSetupSmart,
  className,
  variant = "default",
  showHelp = false,
}: PaymentModeBarProps) {
  const {
    privacyMode,
    setPrivacyMode,
    isSmartAvailable,
    isSmartDeployed,
    isSmartEnrolled,
    smartAccountAddress,
  } = usePaymentMode();

  const promptPasskeySetup = useCallback(() => {
    toast.info("Passkey required for Public Mode", {
      description:
        "Set up your passkey smart account before sending visible USDC. We opened Smart Account settings — enroll your device passkey there.",
      duration: 7000,
    });
    onSetupSmart?.();
  }, [onSetupSmart]);

  const selectPrivate = () => {
    if (privacyMode === "private") return;
    setPrivacyMode("private");
  };

  const selectPublic = () => {
    if (!isSmartAvailable) {
      if (privacyMode !== "public") {
        setPrivacyMode("public");
      }
      promptPasskeySetup();
      return;
    }
    if (privacyMode === "public") return;
    setPrivacyMode("public");
  };

  const pillActions = (
    <>
      {showHelp ? (
        <PaymentModeHelpTooltip
          onPasskeySetup={!isSmartAvailable && onSetupSmart ? promptPasskeySetup : undefined}
          isSmartAvailable={isSmartAvailable}
        />
      ) : null}
      {!isSmartAvailable && onSetupSmart ? (
        <PasskeySetupButton onClick={promptPasskeySetup} compact />
      ) : null}
    </>
  );

  if (variant === "pill") {
    return (
      <div className={cn("pay-mode-bar-pill flex w-full flex-col items-stretch gap-1.5 sm:w-auto sm:items-end", className)}>
        <div className="flex w-full min-w-0 flex-wrap items-center gap-1.5 sm:w-auto sm:flex-nowrap">
        <div
          className="pay-mode-pill flex min-w-0 flex-1 rounded-full border border-border bg-white p-1 shadow-sm sm:inline-flex sm:flex-none"
          role="group"
          aria-label="Payment privacy mode"
        >
          <button
            type="button"
            aria-pressed={privacyMode === "private"}
            onClick={selectPrivate}
            className={cn(
              "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-2 text-xs font-medium transition-colors sm:flex-none sm:gap-1.5 sm:px-3.5",
              privacyMode === "private"
                ? "bg-[hsl(var(--dash-forest))] text-[hsl(96,18%,97%)] shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Lock className="h-3.5 w-3.5 shrink-0" />
            <span className="pay-mode-pill-label pay-mode-pill-label--short truncate">Private</span>
            <span className="pay-mode-pill-label pay-mode-pill-label--full truncate">Private Mode</span>
          </button>
          <button
            type="button"
            aria-pressed={privacyMode === "public"}
            onClick={selectPublic}
            className={cn(
              "inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-full px-2.5 py-2 text-xs font-medium transition-colors sm:flex-none sm:gap-1.5 sm:px-3.5",
              privacyMode === "public"
                ? "bg-[hsl(var(--dash-forest))] text-[hsl(96,18%,97%)] shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Wallet className="h-3.5 w-3.5 shrink-0" />
            <span className="pay-mode-pill-label pay-mode-pill-label--short truncate">Public</span>
            <span className="pay-mode-pill-label pay-mode-pill-label--full truncate">Public Mode</span>
          </button>
        </div>
        {pillActions}
        </div>
        <AnimatePresence>
          {privacyMode === "public" && !isSmartAvailable && (
            <motion.p
              key="passkey-hint"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="max-w-full text-left text-[11px] leading-snug text-amber-900/90 sm:max-w-[min(100%,22rem)] sm:text-right"
            >
              Public Mode is on, but your passkey is not set up yet. Use{" "}
              <button
                type="button"
                onClick={promptPasskeySetup}
                className="font-medium underline underline-offset-2 hover:text-amber-950"
              >
                Set up passkey
              </button>{" "}
              to send visible USDC.
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl hairline bg-card", className)}>
      <div className="flex flex-col divide-y divide-border/50 sm:flex-row sm:divide-x sm:divide-y-0">
        <ModeSegment
          active={privacyMode === "private"}
          icon={EyeOff}
          label="Private Mode"
          description="Encrypted ocUSDC, hidden amounts, wallet-secured"
          badge="Default"
          status="Wallet execution"
          onClick={selectPrivate}
        />
        <ModeSegment
          active={privacyMode === "public"}
          icon={Zap}
          label="Public Mode"
          description="Visible USDC with passkey signing and sponsored gas"
          badge={isSmartAvailable ? "USDC" : "Setup →"}
          status={isSmartAvailable ? "Smart account" : "Passkey needed"}
          onClick={selectPublic}
        />
      </div>

      <AnimatePresence>
        {privacyMode === "public" && (
          <motion.div
            key="public-footer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/40 bg-muted/20 px-3 py-2 sm:px-5"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45">
              <span className="inline-flex items-center gap-1">
                <Fingerprint className="h-3 w-3" /> Passkey signing
              </span>
              <span className="inline-flex items-center gap-1">
                <Zap className="h-3 w-3" /> Sponsored gas
              </span>
              <span className="inline-flex items-center gap-1">
                <Wallet className="h-3 w-3" /> Public USDC
              </span>
              {!isSmartAvailable && onSetupSmart && (
                <button
                  type="button"
                  onClick={promptPasskeySetup}
                  className="text-foreground/70 hover:text-foreground"
                >
                  Set up passkey →
                </button>
              )}
            </div>
          </motion.div>
        )}
        {privacyMode === "private" && (
          <motion.div
            key="private-footer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border/40 bg-muted/20 px-3 py-2 sm:px-5"
          >
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] uppercase tracking-[0.14em] text-muted-foreground/45">
              <span className="inline-flex items-center gap-1"><Lock className="h-3 w-3" /> Encrypted amounts</span>
              <span className="inline-flex items-center gap-1"><EyeOff className="h-3 w-3" /> Stealth receiving</span>
              <span className="inline-flex items-center gap-1"><Wallet className="h-3 w-3" /> Wallet confirmation</span>
              {isSmartDeployed && isSmartEnrolled && smartAccountAddress && (
                <span>Public smart account ready when you switch</span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
