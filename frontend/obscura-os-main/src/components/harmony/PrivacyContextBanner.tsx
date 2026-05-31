import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, X } from "lucide-react";

const STORAGE_KEY = "obscura:banner-dismissed";

export function PrivacyContextBanner({ onDecryptAll }: { onDecryptAll?: () => void }) {
  const [dismissed, setDismissed] = useState(
    () => typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "true",
  );

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="dash-banner flex flex-wrap items-center gap-3 border-[hsl(var(--dash-mint-border))] bg-[hsl(var(--dash-mint))]"
        >
          <ShieldCheck className="h-4 w-4 shrink-0 text-[hsl(var(--dash-forest))]" aria-hidden />
          <p className="min-w-0 flex-1 text-sm text-foreground">
            <span className="font-semibold">Your financial data is sealed.</span>{" "}
            Values are encrypted on-chain. Decrypt anytime — it&apos;s mathematical, not policy.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            {onDecryptAll ? (
              <button
                type="button"
                onClick={onDecryptAll}
                className="dash-btn-primary h-8 px-3 text-xs"
              >
                Decrypt all
              </button>
            ) : null}
            <button
              type="button"
              onClick={dismiss}
              className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Dismiss banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
