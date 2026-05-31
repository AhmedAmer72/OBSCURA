/**
 * SupplyForm — two-step FHE supply to a credit market (earn interest).
 */
import { useState } from "react";
import { usePreWarmFHE } from "@/hooks/usePreWarmFHE";
import { ArrowUpToLine, ArrowDownToLine, AlertTriangle } from "lucide-react";
import { useAccount } from "wagmi";
import { useCreditMarket, useMarketPosition } from "@/hooks/useCredit";
import type { CreditMarketMeta } from "@/config/credit";
import { useOcUSDCBalance } from "@/hooks/useOcUSDCBalance";
import EncryptedValue from "@/components/shared/EncryptedValue";
import FHEStepper from "@/components/shared/FHEStepper";
import PercentChips from "@/components/shared/PercentChips";
import { BETA_POOL_LABEL } from "@/hooks/useBetaBorrowLimit";
import {
  CreditFormHint,
  CreditFormInput,
  CreditFormLabel,
  CreditFormSegmentTabs,
  CreditFormSelect,
  CreditFormStatCard,
  CreditFormSubmit,
} from "@/components/harmony/credit/CreditFormChrome";

interface Props {
  market: CreditMarketMeta;
  markets: CreditMarketMeta[];
  onSelect: (m: CreditMarketMeta) => void;
  onRefresh?: () => void;
}

type Tab = "supply" | "withdraw";

const SupplyForm = ({ market, markets, onSelect, onRefresh }: Props) => {
  const preWarm = usePreWarmFHE();
  const { address } = useAccount();
  const { supply, withdraw, fheStatus } = useCreditMarket(market.address);
  const pos = useMarketPosition(market.address);
  const { decrypted: ocUSDCDecrypted } = useOcUSDCBalance();
  const cUSDCBal = market.isCanonical ? (ocUSDCDecrypted ?? 0n) : 0n;

  const [tab, setTab] = useState<Tab>("supply");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const parsedAmt = (): bigint | null => {
    const n = parseFloat(amount);
    if (isNaN(n) || n <= 0) return null;
    return BigInt(Math.round(n * 1e6));
  };

  const amtBig = parsedAmt();

  const submit = async () => {
    if (!amtBig || !address) return;
    setBusy(true);
    setMsg(null);
    try {
      if (tab === "supply") {
        await supply(amtBig);
        setMsg(`Supplied ${amount} ${market.loanSymbol} to market.`);
      } else {
        await withdraw(amtBig);
        setMsg(`Withdrew ${amount} ${market.loanSymbol} from market.`);
      }
      setAmount("");
      pos.resetDecrypted();
      await pos.refresh();
      onRefresh?.();
    } catch (e: any) {
      setMsg(e?.shortMessage ?? e?.message ?? "Transaction failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <EncryptedValue
          label="Your Supply"
          value={pos.mySupply}
          loading={pos.sharesLoading}
          symbol={market.loanSymbol}
          accent="emerald"
          onReveal={pos.decryptShares}
        />
        <CreditFormStatCard label="Risk tier">
          <div className={`text-sm font-semibold ${
            market.riskTier === "Conservative"
              ? "text-[hsl(var(--success))]"
              : market.riskTier === "Aggressive"
                ? "text-destructive"
                : "text-amber-700"
          }`}>
            {market.riskTier}
          </div>
        </CreditFormStatCard>
      </div>

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
            <option key={m.address} value={m.address}>
              {m.label}
            </option>
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
          max={tab === "supply" ? cUSDCBal : (pos.mySupply ?? 0n)}
          decimals={6}
          onPick={(v) => setAmount(v === 0n ? "" : (Number(v) / 1e6).toString())}
        />
      </div>

      {tab === "withdraw" && pos.mySupply !== null && pos.mySupply === 0n && (
        <p className="flex items-center gap-1.5 text-[11px] text-amber-700">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          No supply position in this market.
        </p>
      )}

      {tab === "supply" && (
        <CreditFormHint>
          Private supply adds real {market.loanSymbol} to {market.isCanonical ? BETA_POOL_LABEL : "this market"} in two wallet-confirmed steps.
          Your lender position stays private.
        </CreditFormHint>
      )}

      <CreditFormSubmit
        disabled={!amtBig || busy}
        onClick={submit}
        className="inline-flex w-full items-center justify-center gap-2 sm:w-full"
      >
        {tab === "supply" ? <ArrowUpToLine className="h-4 w-4" /> : <ArrowDownToLine className="h-4 w-4" />}
        {tab === "supply" ? (market.isCanonical ? "Supply to Beta Pool" : "Supply to market") : "Withdraw from market"}
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

export default SupplyForm;
