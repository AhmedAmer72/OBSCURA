/**
 * RepayForm — encrypted repay using cUSDC operator approval.
 */
import { useState } from "react";
import { usePreWarmFHE } from "@/hooks/usePreWarmFHE";
import { ArrowUpFromLine } from "lucide-react";
import { useCreditMarket, useMarketPosition } from "@/hooks/useCredit";
import type { CreditMarketMeta } from "@/config/credit";
import EncryptedValue from "@/components/shared/EncryptedValue";
import FHEStepper from "@/components/shared/FHEStepper";
import PercentChips from "@/components/shared/PercentChips";
import {
  CreditFormInput,
  CreditFormLabel,
  CreditFormSelect,
  CreditFormSubmit,
} from "@/components/harmony/credit/CreditFormChrome";
import { cn } from "@/lib/utils";

interface Props {
  market: CreditMarketMeta;
  markets: CreditMarketMeta[];
  onSelect: (m: CreditMarketMeta) => void;
  onRefresh?: () => void;
}

const RepayForm = ({ market, markets, onSelect, onRefresh }: Props) => {
  const preWarm = usePreWarmFHE();
  const { repay, accrue, fheStatus } = useCreditMarket(market.address);
  const pos = useMarketPosition(market.address);
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState<"repay" | "accrue" | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!amount) return;
    setBusy("repay");
    setMsg(null);
    try {
      const u = BigInt(Math.round(parseFloat(amount) * 1e6));
      await repay(u);
      setMsg(`Repaid ${amount} ${market.loanSymbol}.`);
      setAmount("");
      pos.resetDecrypted();
      await pos.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Repay failed");
    } finally {
      setBusy(null);
    }
  };

  const tickAccrue = async () => {
    setBusy("accrue");
    setMsg(null);
    try {
      await accrue();
      setMsg("Accrued interest tick complete.");
      onRefresh?.();
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Accrue failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-4">
      <EncryptedValue
        label="Outstanding borrow"
        value={pos.myBorrow}
        loading={pos.sharesLoading}
        symbol={market.loanSymbol}
        accent="violet"
        onReveal={pos.decryptShares}
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
        <CreditFormLabel>Amount ({market.loanSymbol})</CreditFormLabel>
        <CreditFormInput
          inputMode="decimal"
          value={amount}
          onFocus={preWarm.onFocus}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.0"
        />
        <PercentChips
          max={pos.plainBorrow ?? 0n}
          decimals={6}
          onPick={(v) => setAmount(v === 0n ? "" : (Number(v) / 1e6).toString())}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <CreditFormSubmit
          disabled={!amount || !!busy}
          onClick={submit}
          className="inline-flex w-auto items-center gap-2"
        >
          <ArrowUpFromLine className="h-4 w-4" />
          Repay
        </CreditFormSubmit>
        {(pos.plainBorrow ?? 0n) > 0n && (
          <button
            type="button"
            disabled={!!busy}
            onClick={async () => {
              setBusy("accrue");
              setMsg("Accruing interest to compute current debt…");
              try {
                await accrue();
                await pos.refresh();
                const debt = pos.plainBorrow ?? 0n;
                const padded = debt + 1n;
                setAmount((Number(padded) / 1e6).toString());
                setMsg("Filled max repay amount. Click Repay to confirm.");
              } catch (e: any) {
                setMsg(e?.shortMessage ?? e?.message ?? "Accrue failed");
              } finally {
                setBusy(null);
              }
            }}
            className="dash-btn-outline inline-flex h-11 items-center gap-2 px-4 text-sm"
          >
            Repay max
          </button>
        )}
        <button
          type="button"
          disabled={!!busy}
          onClick={tickAccrue}
          className="dash-btn-outline inline-flex h-11 items-center gap-2 px-4 text-sm disabled:opacity-50"
        >
          Accrue interest
        </button>
      </div>
      <FHEStepper status={fheStatus.status} error={fheStatus.error} />
      {msg && <p className={cn("text-xs", msg.toLowerCase().includes("fail") ? "text-destructive" : "text-muted-foreground")}>{msg}</p>}
    </div>
  );
};

export default RepayForm;
