/**
 * SealedAuctionCard — replaces AuctionCard with:
 *   - Countdown ring (SVG circle stroke-dashoffset)
 *   - Encrypted bid display (HIDDEN until settle)
 *   - Sealed bid form (encrypted submit via useCreditAuctions.submitBid)
 *   - Settle button after expiry
 *   - Bidder count tag
 *
 * Privacy invariant: best bid is "▓▓▓▓" until `settled === true`, after which
 * the contract emits the plaintext via publishDecryptResult.
 */
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Gavel, Clock, Loader2, Award, Lock, Users, Send, Eye } from "lucide-react";
import type { AuctionView } from "@/hooks/useCredit";
import { CipherMask } from "@/components/harmony/CipherMask";

interface Props {
  auction: AuctionView;
  /** Total window duration in seconds — used for ring fill calc. Default 1h. */
  windowSec?: number;
  onBid: (id: bigint, bidAmount: bigint) => Promise<unknown>;
  onSettle: (id: bigint) => Promise<unknown>;
}

export default function SealedAuctionCard({ auction, windowSec = 3600, onBid, onSettle }: Props) {
  const [bid, setBid] = useState("");
  const [busy, setBusy] = useState<"bid" | "settle" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = useMemo(() => Math.max(0, Number(auction.endsAt) - now), [auction.endsAt, now]);
  const expired = remaining === 0;
  const startedAt = Number(auction.endsAt) - windowSec;
  const elapsedFrac = Math.min(1, Math.max(0, (now - startedAt) / windowSec));

  // Ring
  const R = 22, C = 2 * Math.PI * R;
  const offset = C * elapsedFrac;
  const ringColor = auction.settled
    ? "hsl(var(--muted-foreground))"
    : expired
      ? "hsl(var(--destructive))"
      : remaining < 300
        ? "rgb(217,119,6)"
        : "hsl(var(--dash-forest))";

  const submit = async () => {
    if (!bid) return;
    setBusy("bid"); setMsg(null);
    try {
      const u = BigInt(Math.round(parseFloat(bid) * 1e6));
      await onBid(auction.id, u);
      setMsg("Bid submitted (encrypted).");
      setBid("");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Bid failed");
    } finally { setBusy(null); }
  };

  const settle = async () => {
    setBusy("settle"); setMsg(null);
    try {
      await onSettle(auction.id);
      setMsg("Auction settled — bid revealed.");
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Settle failed");
    } finally { setBusy(null); }
  };

  const mm = Math.floor(remaining / 60).toString().padStart(2, "0");
  const ss = (remaining % 60).toString().padStart(2, "0");

  return (
    <div className="rounded-2xl hairline bg-card p-4 border-amber-200 dash-card">
      <div className="flex items-start gap-4">
        {/* Countdown ring */}
        <div className="relative w-[60px] h-[60px] flex-shrink-0">
          <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
            <circle cx="30" cy="30" r={R} fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
            <motion.circle
              cx="30" cy="30" r={R}
              fill="none" stroke={ringColor} strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={offset}
              initial={false}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 0.6, ease: "linear" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Clock className="w-4 h-4" style={{ color: ringColor }} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Gavel className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[13px] font-medium text-foreground">Sealed Auction #{auction.id.toString()}</span>
            <span className="dash-badge dash-badge-warn text-[8px] tracking-widest uppercase font-mono">
              <Lock className="w-2 h-2 inline mr-0.5" /> No MEV
            </span>
            <span className="dash-badge text-[9px] font-mono">
              <Users className="w-2.5 h-2.5 inline mr-0.5" /> {auction.bids} bids
            </span>
          </div>
          <p className="text-[10.5px] font-mono text-muted-foreground mt-1 truncate">borrower {auction.borrower.slice(0, 12)}…</p>
          <p className="text-[10px] mt-0.5 font-medium" style={{ color: ringColor }}>
            {auction.settled ? "Settled" : expired ? "Expired — awaiting settle" : `${mm}:${ss} remaining`}
          </p>
        </div>
      </div>

      {/* Bid tiles */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
          <div className="text-[9.5px] uppercase tracking-[0.15em] text-muted-foreground font-mono flex items-center gap-1">
            <Eye className="w-2.5 h-2.5" /> Best bid
          </div>
          {auction.settled && auction.bestBid > 0n ? (
            <div className="mt-0.5 text-[hsl(var(--success))] tabular-nums font-mono">
              ${(Number(auction.bestBid) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          ) : (
            <div className="mt-1 flex items-center gap-1.5">
              <Lock className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
              <CipherMask blocks={4} size="sm" />
            </div>
          )}
        </div>
        <div className="rounded-lg bg-muted/40 border border-border/60 px-3 py-2">
          <div className="text-[9.5px] uppercase tracking-[0.15em] text-muted-foreground font-mono flex items-center gap-1">
            <Award className="w-2.5 h-2.5" /> Winner
          </div>
          {auction.settled && auction.bestBidder !== "0x0000000000000000000000000000000000000000" ? (
            <div className="mt-0.5 text-[hsl(var(--dash-forest))] font-mono truncate">{auction.bestBidder.slice(0, 10)}…</div>
          ) : (
            <div className="mt-1">
              <CipherMask blocks={3} size="sm" />
            </div>
          )}
        </div>
      </div>

      {/* Action */}
      {!auction.settled && !expired && (
        <div className="mt-3 flex items-center gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={bid}
            onChange={(e) => setBid(e.target.value)}
            placeholder="0.00"
            className="flex-1 rounded-lg border border-border bg-background px-2.5 py-1.5 text-[12px] text-foreground font-mono tabular-nums outline-none focus:border-[hsl(var(--dash-forest))]"
          />
          <button
            type="button"
            onClick={submit}
            disabled={busy !== null || !bid}
            className="dash-btn-primary h-8 px-3 text-[11px] disabled:opacity-40"
          >
            {busy === "bid" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
            Sealed bid
          </button>
        </div>
      )}

      {!auction.settled && expired && (
        <button
          type="button"
          onClick={settle}
          disabled={busy !== null}
          className="mt-3 w-full inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[12px] border border-[hsl(var(--dash-forest))] bg-[hsl(var(--dash-mint))] text-[hsl(var(--dash-forest))] hover:bg-[hsl(var(--dash-forest))] hover:text-white transition-colors disabled:opacity-40"
        >
          {busy === "settle" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Gavel className="w-3 h-3" />}
          Settle & reveal winning bid
        </button>
      )}

      {msg && <p className="mt-2 text-[10.5px] text-muted-foreground">{msg}</p>}
    </div>
  );
}
