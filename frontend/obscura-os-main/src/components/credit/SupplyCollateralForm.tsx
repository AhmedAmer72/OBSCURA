/**
 * SupplyCollateralForm — two-step FHE collateral supply & withdraw.
 */
import { useState } from "react";
import { usePreWarmFHE } from "@/hooks/usePreWarmFHE";
import { ShieldCheck, ShieldAlert, ArrowUpToLine, ArrowDownToLine } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreditMarket, useMarketPosition } from "@/hooks/useCredit";
import { CREDIT_TOKENS } from "@/config/credit";
import type { CreditMarketMeta } from "@/config/credit";
import EncryptedValue from "@/components/shared/EncryptedValue";
import FHEStepper from "@/components/shared/FHEStepper";
import PercentChips from "@/components/shared/PercentChips";
import {
  CreditFormHint,
  CreditFormInput,
  CreditFormLabel,
  CreditFormSegmentTabs,
  CreditFormSelect,
  CreditFormSubmit,
} from "@/components/harmony/credit/CreditFormChrome";

interface Props {
  market: CreditMarketMeta;
  markets: CreditMarketMeta[];
  onSelect: (m: CreditMarketMeta) => void;
  onRefresh?: () => void;
}

type Tab = "supply" | "withdraw";

const SupplyCollateralForm = ({ market, markets, onSelect, onRefresh }: Props) => {
  const preWarm = usePreWarmFHE();
  const { address } = useAccount();
  const { supplyCollateral, withdrawCollateral, fheStatus } = useCreditMarket(market.address);
  const pos = useMarketPosition(market.address);

  const [tab, setTab] = useState<Tab>("supply");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const collToken = CREDIT_TOKENS[market.collateralTokenKey ?? market.collateralSymbol];

  const parsedAmt = (): bigint | null => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return null;
    return BigInt(Math.round(n * 1e6));
  };

  const amtBig = parsedAmt();

  const plainColl = pos.plainCollateral ?? 0n;
  const plainBorrow = pos.plainBorrow ?? 0n;
  const maxB = pos.maxBorrowableAmt ?? 0n;

  const withdrawWouldBreachLLTV = (): boolean => {
    if (tab !== "withdraw" || !amtBig) return false;
    if (amtBig > plainColl) return true;
    const remainColl = plainColl - amtBig;
    const maxBorrowAfter = BigInt(Math.floor(Number(remainColl) * market.lltvBps / 10000));
    return plainBorrow > maxBorrowAfter;
  };

  const lltvBreach = withdrawWouldBreachLLTV();

  const submit = async () => {
    if (!amtBig || !address) return;
    setBusy(true);
    setMsg(null);
    try {
      if (tab === "supply") {
        const collAddr = market.collateralAssetAddress ?? collToken?.address;
        if (!collAddr) throw new Error("Collateral token address not configured");
        await supplyCollateral(amtBig, collAddr);
        setMsg(`Supplied ${amount} ${market.collateralSymbol} as collateral.`);
      } else {
        if (lltvBreach) throw new Error("Withdrawal would breach LLTV — repay some debt first");
        if (amtBig > plainColl) throw new Error("Insufficient collateral deposited");
        await withdrawCollateral(amtBig);
        setMsg(`Withdrew ${amount} ${market.collateralSymbol} collateral.`);
      }
      setAmount("");
      pos.resetDecrypted();
      await pos.refresh();
      onRefresh?.();
    } catch (e: any) {
      const raw: string = e?.shortMessage ?? e?.message ?? "Transaction failed";
      const isRateLimit = raw.toLowerCase().includes("rate limit") || raw.includes("429") || raw.toLowerCase().includes("too many requests");
      setMsg(isRateLimit
        ? "RPC rate limited — wait 15–30 s and try again."
        : raw);
    } finally {
      setBusy(false);
    }
  };

  const fmt6 = (v: bigint) =>
    (Number(v) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EncryptedValue
          label="Collateral"
          value={pos.myCollateral}
          loading={pos.sharesLoading}
          symbol={market.collateralSymbol}
          accent="emerald"
          onReveal={pos.decryptShares}
        />
        <EncryptedValue
          label="Debt"
          value={pos.myBorrow}
          loading={pos.sharesLoading}
          symbol="ocUSDC"
          accent="violet"
          onReveal={pos.decryptShares}
        />
      </div>

      {maxB > 0n && (
        <div className="ref-mini-card flex items-center gap-2">
          <span className="dash-eyebrow text-[9px]">Max borrow</span>
          <span className="text-[9px] text-muted-foreground">(public)</span>
          <span className="ml-auto font-display text-sm tabular-nums text-foreground">{fmt6(maxB)} ocUSDC</span>
        </div>
      )}

      <CreditFormSegmentTabs
        value={tab}
        onChange={(next) => { setTab(next); setMsg(null); }}
        items={[
          { key: "supply", label: "supply" },
          { key: "withdraw", label: "withdraw" },
        ]}
      />

      <div className="space-y-2">
        <CreditFormLabel>Market</CreditFormLabel>
        <CreditFormSelect
          value={market.address ?? ""}
          onChange={(value) => {
            const next = markets.find((m) => m.address === (value as `0x${string}`));
            if (next) onSelect(next);
          }}
        >
          {markets.map((m) => (
            <option key={m.address} value={m.address}>{m.label}</option>
          ))}
        </CreditFormSelect>
      </div>

      <div className="space-y-2">
        <CreditFormLabel>Amount ({market.collateralSymbol})</CreditFormLabel>
        <CreditFormInput
          inputMode="decimal"
          value={amount}
          onFocus={preWarm.onFocus}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
        <PercentChips
          max={tab === "supply" ? 0n : plainColl}
          decimals={6}
          onPick={(v) => setAmount(v === 0n ? "" : (Number(v) / 1e6).toString())}
        />
      </div>

      {tab === "supply" && plainColl === 0n && (
        <p className="flex items-center gap-1.5 text-[11px] text-amber-700">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          You have no collateral yet. Supply collateral before borrowing.
        </p>
      )}
      {tab === "supply" && plainColl > 0n && (
        <p className="flex flex-wrap items-center gap-1.5 text-[11px] text-[hsl(var(--success))]">
          <ShieldCheck className="h-3 w-3 shrink-0" />
          Collateral deposited: {fmt6(plainColl)} {market.collateralSymbol}.
          Max borrowable: {fmt6(maxB)} ocUSDC.
          <span className="text-[9px] text-muted-foreground">(shadow values — encrypted amount is private)</span>
        </p>
      )}
      {tab === "withdraw" && lltvBreach && (
        <p className="flex items-center gap-1.5 text-[11px] text-destructive">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          This withdrawal would breach LLTV. Repay debt first.
        </p>
      )}
      {tab === "withdraw" && amtBig !== null && amtBig > plainColl && (
        <p className="flex items-center gap-1.5 text-[11px] text-destructive">
          <ShieldAlert className="h-3 w-3 shrink-0" />
          Amount exceeds your deposited collateral ({fmt6(plainColl)} {market.collateralSymbol}).
        </p>
      )}

      {tab === "supply" && (
        <CreditFormHint>
          Collateral settles privately, then your borrowing power updates.
          Your amount stays private.
        </CreditFormHint>
      )}

      <CreditFormSubmit
        disabled={!amtBig || busy || (tab === "withdraw" && (lltvBreach || amtBig > plainColl))}
        onClick={submit}
        className="inline-flex w-full items-center justify-center gap-2 sm:w-full"
      >
        {tab === "supply" ? <ArrowUpToLine className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />}
        {tab === "supply" ? "Supply collateral" : "Withdraw collateral"}
      </CreditFormSubmit>

      <FHEStepper status={fheStatus.status} error={fheStatus.error} />

      {msg && (
        <p className={`text-xs ${msg.toLowerCase().includes("fail") || msg.toLowerCase().includes("error") ? "text-destructive" : "text-[hsl(var(--success))]"}`}>
          {msg}
        </p>
      )}
    </div>
  );
};

export default SupplyCollateralForm;
