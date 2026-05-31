import { useState } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { useConnect, useDisconnect, useAccount, useBalance, useSwitchChain } from "wagmi";
import { arbitrumSepolia } from "wagmi/chains";
import { formatUnits } from "viem";
import { cn } from "@/lib/utils";
import { ARBITRUM_SEPOLIA_CHAIN_ID, useWalletSessionChainId } from "@/hooks/useWalletSessionChainId";
import { useWalletSessionOptional } from "@/contexts/WalletSessionContext";

type WalletConnectProps = {
  /** Light nav (landing) uses forest greens for contrast on white */
  tone?: "dark" | "light";
};

function WalletSessionAction({
  tone,
}: {
  tone: "dark" | "light";
}) {
  const session = useWalletSessionOptional();
  if (!session || session.status === "disconnected" || session.status === "checking") return null;

  const light = tone === "light";
  const { status, verify, clearError } = session;
  const isVerifying = status === "verifying";

  if (status === "ready") {
    return (
      <span
        className={cn(
          "hidden items-center gap-1 rounded-sm border px-2 py-1 font-mono text-[10px] uppercase tracking-wider sm:inline-flex",
          light
            ? "border-emerald-600/35 bg-emerald-50 text-emerald-800"
            : "border-emerald-500/35 bg-emerald-500/10 text-emerald-400",
        )}
        title="Private data session active"
      >
        <ShieldCheck className="h-3 w-3" />
        7d
      </span>
    );
  }

  const isRenew = status === "needs_refresh";
  const label = isVerifying ? "Signing…" : isRenew ? "Renew" : "Sign";
  const pulse = status === "needs_verify";

  return (
    <button
      type="button"
      disabled={isVerifying}
      title={
        isRenew
          ? "Renew your 7-day session"
          : "Sign once to unlock activity, reputation & participation for 7 days"
      }
      onClick={() => {
        clearError();
        void verify();
      }}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-sm border px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-colors disabled:opacity-60",
        light
          ? "border-amber-600/50 bg-amber-50 text-amber-900 hover:bg-amber-100"
          : "border-amber-500/50 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20",
        pulse && "animate-pulse",
        status === "error" && (light ? "border-red-500/50 bg-red-50 text-red-800" : "border-red-500/50 bg-red-500/10 text-red-300"),
      )}
    >
      {isVerifying ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
      {label}
    </button>
  );
}

export default function WalletConnect({ tone = "dark" }: WalletConnectProps) {
  const [open, setOpen] = useState(false);
  const { address, isConnected } = useAccount();
  const sessionChainId = useWalletSessionChainId();
  const { connectors, connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address,
    chainId: arbitrumSepolia.id,
    query: { enabled: sessionChainId === ARBITRUM_SEPOLIA_CHAIN_ID },
  });
  const { switchChain, isPending: isSwitching } = useSwitchChain();

  const switchToArbSepolia = () => {
    switchChain({ chainId: ARBITRUM_SEPOLIA_CHAIN_ID });
  };

  const light = tone === "light";

  const connectBtn = light
    ? "border-forest/45 text-forest bg-white hover:bg-sage-1"
    : "border-primary/40 text-primary hover:bg-primary/10";

  const networkLabel = light ? "text-forest/75" : "text-muted-foreground";
  const balanceText = light ? "text-forest font-semibold" : "text-primary/80";
  const walletBtn = light
    ? "border-forest/45 bg-white text-forest hover:border-forest/70 hover:bg-sage-1/80"
    : "border-primary/30 text-foreground hover:border-primary/60";
  const addressText = light ? "text-forest font-semibold" : "text-primary";
  const statusDot = light ? "bg-emerald-600" : "bg-primary";

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className={cn(
            "rounded-full px-5 py-2 font-medium text-sm transition-all duration-200 border shadow-sm",
            connectBtn,
          )}
        >
          Connect Wallet
        </button>
        {open && (
          <div
            className={cn(
              "absolute right-0 top-full z-50 mt-1 min-w-[180px] overflow-hidden rounded-sm border shadow-xl backdrop-blur",
              light
                ? "border-forest/20 bg-white"
                : "border-primary/20 bg-background/95",
            )}
            onBlur={() => setOpen(false)}
          >
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                disabled={isPending}
                onClick={() => {
                  connect({ connector });
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-3 text-left font-mono text-xs transition-colors disabled:opacity-50",
                  light ? "text-forest hover:bg-sage-1" : "hover:bg-primary/10",
                )}
              >
                <span className={light ? "text-forest/50" : "text-primary/60"}>◆</span>
                {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (isConnected && address && sessionChainId !== ARBITRUM_SEPOLIA_CHAIN_ID) {
    return (
      <button
        onClick={() => {
          switchToArbSepolia();
        }}
        disabled={isSwitching}
        className="rounded-sm border border-amber-500/40 px-5 py-2 font-mono text-xs uppercase tracking-[0.15em] text-amber-600 transition-colors duration-300 hover:bg-amber-500/10 disabled:opacity-60"
      >
        {isSwitching ? "Switching…" : "Switch to Arb Sepolia"}
      </button>
    );
  }

  const displayName = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "";
  const ethBalance = balance
    ? `${parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)} ETH`
    : "";

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
      <WalletSessionAction tone={tone} />
      <div className="hidden flex-col items-end leading-tight sm:flex">
        <span className={cn("font-mono text-[10px] uppercase tracking-widest", networkLabel)}>
          Arb Sepolia
        </span>
        {ethBalance ? (
          <span className={cn("font-mono text-[10px]", balanceText)}>{ethBalance}</span>
        ) : null}
      </div>
      <div
        aria-label={`Connected wallet ${displayName}`}
        className={cn(
          "group flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-medium transition-all duration-200 shadow-sm",
          walletBtn,
        )}
      >
        <span className={cn("size-2 shrink-0 rounded-full animate-pulse", statusDot)} />
        <span className={cn("max-w-[8rem] truncate", addressText)}>{displayName}</span>
        <button
          type="button"
          onClick={() => {
            disconnect();
          }}
          title="Disconnect"
          aria-label="Disconnect wallet"
          className={cn(
            "ml-0.5 rounded-sm px-1 text-[10px] transition-colors",
            light
              ? "text-forest/45 group-hover:text-red-600"
              : "text-muted-foreground group-hover:text-red-400",
          )}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
