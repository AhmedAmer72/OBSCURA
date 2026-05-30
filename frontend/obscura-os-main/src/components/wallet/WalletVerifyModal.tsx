import { ShieldCheck, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WalletSessionStatus } from "@/contexts/WalletSessionContext";

interface WalletVerifyModalProps {
  open: boolean;
  status: WalletSessionStatus;
  error: string | null;
  onVerify: () => void;
  onDismiss?: () => void;
  dismissible?: boolean;
}

export function WalletVerifyModal({
  open,
  status,
  error,
  onVerify,
  onDismiss,
  dismissible = false,
}: WalletVerifyModalProps) {
  const isRenewal = status === "needs_refresh";
  const verifying = status === "verifying";

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && dismissible && onDismiss) onDismiss();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#2D6A4F]/10">
            <ShieldCheck className="h-6 w-6 text-[#2D6A4F]" />
          </div>
          <DialogTitle className="text-center">
            {isRenewal ? "Renew your Obscura session" : "Verify your wallet"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {isRenewal
              ? "Your session is expiring soon. Sign once to keep private activity, reputation, and participation data loading instantly."
              : "Verify your wallet to enable private activity, reputation, and participation data. One signature — valid for 7 days."}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-center text-sm text-destructive">
            {error}
          </p>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <button
            type="button"
            disabled={verifying}
            onClick={onVerify}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#2D6A4F] px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {verifying ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Waiting for signature…
              </>
            ) : (
              "Sign to verify"
            )}
          </button>
          {onDismiss && (
            <button
              type="button"
              disabled={verifying}
              onClick={onDismiss}
              className="text-sm text-muted-foreground underline-offset-2 hover:underline"
            >
              Remind me later
            </button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
