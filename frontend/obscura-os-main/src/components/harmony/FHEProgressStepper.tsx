import { AnimatePresence, motion } from "framer-motion";
import { Shield, Cpu, Send, CheckCircle, Loader2 } from "lucide-react";
import { FHEStepStatus } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STEPS = [
  { key: FHEStepStatus.ENCRYPTING, icon: Shield, label: "Sealing", sub: "Encrypting locally..." },
  { key: FHEStepStatus.COMPUTING, icon: Cpu, label: "Encrypting", sub: "FHE on-chain..." },
  { key: FHEStepStatus.SENDING, icon: Send, label: "Broadcasting", sub: "Submitting tx..." },
  { key: FHEStepStatus.SETTLING, icon: Loader2, label: "Confirming", sub: "Waiting for block..." },
  { key: FHEStepStatus.READY, icon: CheckCircle, label: "Sealed ✓", sub: "Complete" },
] as const;

interface FHEProgressStepperProps {
  status: FHEStepStatus;
  onClose?: () => void;
  className?: string;
}

/** Floating toast stepper — plain-language FHE phases. Presentation only. */
export function FHEProgressStepper({ status, onClose, className = "" }: FHEProgressStepperProps) {
  if (status === FHEStepStatus.IDLE) return null;

  const activeIdx = STEPS.findIndex((s) => s.key === status);
  const isComplete = status === FHEStepStatus.READY;
  const isError = status === FHEStepStatus.ERROR;

  return (
    <AnimatePresence>
      <motion.div
        className={cn(
          "harmony-fhe-stepper harmony-fhe-stepper--toast fixed bottom-6 right-6 z-50 max-sm:inset-x-4 max-sm:bottom-4 max-sm:right-auto",
          className,
        )}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <div className="w-72 max-w-full rounded-2xl border border-border bg-card p-4 shadow-[var(--dash-shadow-modal)]">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                className={cn(
                  "flex h-7 w-7 items-center justify-center rounded-full",
                  isComplete
                    ? "bg-[hsl(var(--success))]"
                    : isError
                      ? "bg-destructive"
                      : "bg-[hsl(var(--dash-forest))]",
                )}
                animate={isComplete ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 0.4 }}
              >
                <Shield size={14} className="text-white" />
              </motion.div>
              <span className="text-sm font-semibold text-foreground">
                {isComplete ? "Transaction Sealed" : isError ? "Failed" : "Sealing Transaction"}
              </span>
            </div>
            {(isComplete || isError) && onClose ? (
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            ) : null}
          </div>

          <div className="space-y-2">
            {STEPS.map((step, idx) => {
              const isDone = activeIdx > idx || isComplete;
              const isActive = activeIdx === idx && !isComplete && !isError;
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.key}
                  className="flex items-center gap-2.5"
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.06 }}
                >
                  <div className="relative h-5 w-5 shrink-0">
                    {isDone ? (
                      <motion.div
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-[hsl(var(--success))]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      >
                        <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                          <path
                            d="M1 4L3.5 6.5L9 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                          />
                        </svg>
                      </motion.div>
                    ) : isActive ? (
                      <div className="relative h-5 w-5">
                        <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--dash-forest))]" />
                        <motion.div
                          className="absolute inset-0 rounded-full border-2 border-[hsl(var(--dash-forest))]"
                          animate={{ scale: [1, 1.6], opacity: [0.6, 0] }}
                          transition={{ duration: 1.2, repeat: Infinity }}
                        />
                        <motion.div
                          className="absolute inset-1 rounded-full bg-[hsl(var(--dash-forest))]"
                          animate={{ scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-border" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        isDone
                          ? "text-[hsl(var(--success))]"
                          : isActive
                            ? "text-[hsl(var(--dash-forest))]"
                            : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                    {isActive ? (
                      <motion.p
                        className="mt-0.5 text-xs text-muted-foreground"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {step.sub}
                      </motion.p>
                    ) : null}
                  </div>

                  {isActive ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Loader2 size={14} className="text-[hsl(var(--dash-forest))]" />
                    </motion.div>
                  ) : null}
                </motion.div>
              );
            })}
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-[hsl(var(--dash-forest))]"
              initial={{ width: "0%" }}
              animate={{
                width: isComplete
                  ? "100%"
                  : `${Math.max(5, (Math.max(0, activeIdx) / (STEPS.length - 1)) * 100)}%`,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {isComplete ? (
            <motion.p
              className="mt-2 text-center text-xs font-medium text-[hsl(var(--success))]"
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✓ Sealed on-chain with FHE encryption
            </motion.p>
          ) : null}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
