import { Clock } from "lucide-react";
import { useWalletSession } from "@/contexts/WalletSessionContext";

/** Non-blocking banner when session is valid but nearing expiry */
export function WalletSessionRenewBanner() {
  const { status, verify } = useWalletSession();
  if (status !== "needs_refresh") return null;

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <span className="inline-flex items-center gap-2">
        <Clock className="h-4 w-4 shrink-0" />
        Your Obscura session expires soon. Renew to avoid interruption.
      </span>
      <button
        type="button"
        onClick={() => void verify()}
        className="rounded-full bg-amber-900 px-3 py-1 text-xs font-medium text-white hover:bg-amber-800"
      >
        Renew session
      </button>
    </div>
  );
}
