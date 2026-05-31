import { Coins, Eye, ArrowDownToLine, ArrowUpFromLine, ShieldCheck, Loader2, Timer } from "lucide-react";
import UsdcIcon from "@/components/shared/UsdcIcon";
import { useState, useEffect, useRef } from "react";
import { useOcUSDCBalance } from "@/hooks/useOcUSDCBalance";
import { toast } from "sonner";
import { HarmonyPrivacyBadge } from "@/components/harmony/harmony-ui";
import { SealedCipherBars } from "@/components/harmony/pay-home/PayHomePremiumSections";
import { isRateLimitError } from "@/lib/rateLimit";
import { shieldPhaseLabel } from "@/lib/shieldFlow";

export default function OcUSDCPanel() {
  const {
    handle,
    decrypted,
    usdcBalance,
    trackedCusdc,
    reveal,
    wrap,
    unwrap,
    approveStream,
    busy,
    wrapPhase,
    wrapCooldownSec,
    error,
  } = useOcUSDCBalance();
  const [wrapAmount, setWrapAmount] = useState("");
  const [unwrapAmount, setUnwrapAmount] = useState("");
  const [maxApprove, setMaxApprove] = useState("30");
  const toastRef = useRef<string | number | null>(null);

  useEffect(() => {
    if (wrapPhase === "idle") {
      if (toastRef.current) toast.dismiss(toastRef.current);
      toastRef.current = null;
      return;
    }

    const message = shieldPhaseLabel(wrapPhase, {
      cooldownSec: wrapCooldownSec || undefined,
    });

    if (toastRef.current) {
      toast.loading(message, { id: toastRef.current });
    } else {
      toastRef.current = toast.loading(message);
    }
  }, [wrapPhase, wrapCooldownSec]);

  const isRevealed = decrypted !== null;
  const displayBalance = isRevealed
    ? `${(Number(decrypted) / 1_000_000).toFixed(6)}`
    : null;

  const balanceCaption = isRevealed
    ? "On-chain decrypted"
    : trackedCusdc
      ? "Tracked estimate — reveal for exact"
      : "Sealed on-chain — reveal for exact";

  const wrapBusy = busy && wrapPhase !== "idle";
  const wrapButtonLabel = wrapBusy
    ? wrapCooldownSec > 0
      ? `${wrapCooldownSec}s`
      : shieldPhaseLabel(wrapPhase).replace(/^Step \d\/\d — /, "")
    : "Make private";

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-muted hairline">
          <Coins className="w-4 h-4 text-foreground" />
        </div>
        <div className="min-w-0">
          <div className="font-display text-[15px] text-foreground leading-tight">Private USDC</div>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            Make USDC private · convert back any time
          </p>
        </div>
        <HarmonyPrivacyBadge state="private" label="Private" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-card p-3">
          <div className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground mb-1.5">
            <UsdcIcon className="w-3.5 h-3.5" /> Plain USDC
          </div>
          <div className="font-mono text-lg font-medium tabular-nums">
            {usdcBalance !== null ? usdcBalance : "—"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/40 p-3 min-w-0">
          <p className="mb-2 text-[10.5px] font-medium uppercase tracking-wide text-muted-foreground/70">
            Private USDC
          </p>
          <SealedCipherBars
            size="lg"
            bars={5}
            revealed={isRevealed}
            value={displayBalance}
            caption={balanceCaption}
          />
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground/70 leading-snug max-w-[28ch]">
          Your private balance is hidden on-chain. Only you can decrypt it.
        </p>
        <button
          type="button"
          onClick={async () => {
            try {
              toast.info("Revealing… sign in your wallet");
              await reveal();
              if (!error) toast.success("Balance revealed");
            } catch (e) {
              toast.error((e as Error).message || "Decrypt failed");
            }
          }}
          disabled={busy || !handle}
          className="btn-pay btn-pay-ghost btn-pay-sm shrink-0"
        >
          {busy && wrapPhase === "idle"
            ? <><Loader2 className="w-3 h-3 animate-spin" /> Revealing…</>
            : <><Eye className="w-3 h-3" /> Reveal</>
          }
        </button>
      </div>

      {error && (
        <div className="text-[12px] text-destructive bg-destructive/5 px-3 py-2 rounded-lg border border-destructive/25 leading-relaxed">
          {error}
        </div>
      )}

      <div className="space-y-4 border-t border-border pt-4">
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ArrowDownToLine className="w-3 h-3 text-foreground/55" />
            Make USDC private
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={wrapAmount}
              onChange={(e) => setWrapAmount(e.target.value)}
              className="pay-input flex-1"
              disabled={wrapBusy}
            />
            <button
              type="button"
              onClick={async () => {
                if (!wrapAmount || wrapBusy) return;
                try {
                  await wrap(wrapAmount);
                  if (toastRef.current) toast.dismiss(toastRef.current);
                  toast.success("Done — your USDC is now private.");
                  setWrapAmount("");
                } catch (e) {
                  if (toastRef.current) toast.dismiss(toastRef.current);
                  if (isRateLimitError(e)) {
                    toast.error(
                      "Network still busy after automatic retries. Wait ~30 s and tap Make private again — approval is already saved.",
                      { duration: 10_000 },
                    );
                  } else {
                    toast.error((e as Error).message || "Shield failed");
                  }
                }
              }}
              disabled={wrapBusy || !wrapAmount}
              className="btn-pay btn-pay-primary shrink-0 min-w-[7.5rem]"
            >
              {wrapBusy
                ? <><Timer className="w-3 h-3" /> {wrapButtonLabel}</>
                : "Make private"
              }
            </button>
          </div>
          <p className="text-[10.5px] text-muted-foreground/60 leading-relaxed">
            First time? You&apos;ll sign approve, then we wait ~12 s for the network before shielding
            automatically — no second click needed.
          </p>
          <p className="text-[10.5px] text-muted-foreground/60">
            Need testnet USDC?{" "}
            <a href="https://faucet.circle.com" target="_blank" rel="noopener noreferrer"
               className="text-foreground/80 hover:text-foreground underline underline-offset-2">
              faucet.circle.com
            </a>
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ArrowUpFromLine className="w-3 h-3 text-foreground/55" />
            Convert back to USDC
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Amount"
              value={unwrapAmount}
              onChange={(e) => setUnwrapAmount(e.target.value)}
              className="pay-input flex-1"
            />
            {decrypted !== null && (
              <button
                type="button"
                onClick={() => setUnwrapAmount((Number(decrypted) / 1_000_000).toFixed(6))}
                className="btn-pay btn-pay-ghost btn-pay-sm shrink-0"
                title="Set to full revealed balance"
              >
                Max
              </button>
            )}
            <button
              type="button"
              onClick={async () => {
                try {
                  const toastId = toast.loading("Converting back to USDC…");
                  await unwrap(unwrapAmount);
                  toast.dismiss(toastId);
                  toast.success("Done — USDC is back in your wallet.");
                  setUnwrapAmount("");
                } catch (e) { toast.error((e as Error).message); }
              }}
              className="btn-pay btn-pay-primary shrink-0"
            >
              Convert
            </button>
          </div>
          {decrypted === null && (
            <p className="text-[10.5px] text-muted-foreground/60">
              Reveal your private balance first to see how much you can convert.
            </p>
          )}
        </div>

        <div className="space-y-1.5 pt-3 border-t border-border">
          <label className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="w-3 h-3 text-foreground/55" />
            Authorize PayStream as operator
          </label>
          <div className="flex gap-2">
            <select
              value={maxApprove}
              onChange={(e) => setMaxApprove(e.target.value)}
              className="pay-select flex-1"
            >
              <option value="7">7 days</option>
              <option value="30">30 days</option>
              <option value="90">90 days</option>
              <option value="365">1 year</option>
            </select>
            <button
              type="button"
              onClick={async () => {
                try {
                  const days = Number(maxApprove) || 30;
                  toast.info("Checking operator status…");
                  const result = await approveStream(days);
                  if (result === "already-approved") {
                    toast.success("PayStream already authorized — no tx needed.");
                  } else {
                    toast.success(`PayStream authorized for ${days} days`);
                  }
                } catch (e) { toast.error((e as Error).message); }
              }}
              className="btn-pay btn-pay-primary shrink-0"
            >
              Authorize
            </button>
          </div>
          <p className="text-[10.5px] text-muted-foreground/60">
            Lets PayStream move private USDC on your behalf. Time-bounded, no amount limit.
          </p>
        </div>
      </div>
    </div>
  );
}
