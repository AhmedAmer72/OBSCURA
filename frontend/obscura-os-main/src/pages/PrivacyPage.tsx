import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Key,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  ExternalLink,
  Banknote,
  Vote,
  Landmark,
  Smartphone,
  Monitor,
  Database,
} from "lucide-react";
import { useAccount } from "wagmi";
import SpadeLandingNav from "@/components/landing/spade/SpadeLandingNav";
import SpadeFooter from "@/components/landing/spade/SpadeFooter";
import ObscuraSlogan from "@/components/brand/ObscuraSlogan";
import { DocsPanel } from "@/components/docs/DocsShell";
import { getPermits, removePermit, getFHEClient } from "@/lib/fhe";
import { OBSCURA_PAY_ADDRESS, OBSCURA_VOTE_ADDRESS } from "@/config/contracts";
import { EXPLORER_URL } from "@/lib/constants";
import { toast } from "sonner";

interface PermitInfo {
  contractAddress: string;
  createdAt?: string;
}

const PILLARS = [
  {
    icon: Lock,
    title: "Encrypted by default",
    desc: "Balances, transfer amounts, loan positions, and ballot choices are stored as FHE ciphertext handles on Arbitrum Sepolia — not plaintext on explorers.",
  },
  {
    icon: EyeOff,
    title: "Reveal on demand",
    desc: "Web and mobile apps show masked values until you tap Reveal or submit an action. Nothing sensitive auto-decrypts when a page loads.",
  },
  {
    icon: Shield,
    title: "Computed in the open",
    desc: "Smart contracts run homomorphic add, compare, and select on sealed data. Settlement is verifiable without publishing individual amounts.",
  },
  {
    icon: Key,
    title: "Unlocked by you",
    desc: "You authorize decryption with wallet-signed permits. Obscura cannot read your sealed values without your explicit signature.",
  },
];

const APPS = [
  {
    icon: Monitor,
    title: "Obscura web",
    body: "Harmony workspace in the browser — Pay, Credit, Govern, Settings, and the developer docs portal. Optional browser push via service worker.",
    cta: { label: "Open app", href: "/pay" },
  },
  {
    icon: Smartphone,
    title: "Obscura mobile (Android)",
    body: "Capacitor shell with Pay, Govern, and Credit. Same FHE encryption path and reveal-on-demand UX as web. WalletConnect on device; stealth keys stay on your phone.",
    cta: { label: "Download APK", href: "/download" },
  },
];

const LIFECYCLE = [
  {
    step: "01",
    title: "You encrypt locally",
    body: "Web or mobile runs the CoFHE client before signing. Amounts and vote choices are sealed on your device — plaintext is not sent to RPC nodes.",
  },
  {
    step: "02",
    title: "Chain stores handles",
    body: "Contracts receive encrypted inputs and persist ciphertext references on Arbitrum Sepolia. Explorers see handles, not decoded values.",
  },
  {
    step: "03",
    title: "Coprocessor computes",
    body: "Fhenix CoFHE evaluates homomorphic operations off-chain. Updated ciphertext is written back with ACL rules that gate who may ever decrypt.",
  },
  {
    step: "04",
    title: "You reveal when ready",
    body: "Balances, positions, and tallies stay hidden in the UI until you choose Reveal or finalize a vote. Revoke view permits below at any time.",
  },
];

const VISIBILITY = [
  { item: "Wallet addresses in events", public: "Visible", private: "Participation graph is public" },
  { item: "Transaction existence & timing", public: "Visible", private: "Block time + tx hash" },
  { item: "ocUSDC balances", public: "Hidden", private: "Masked until Reveal" },
  { item: "Transfer & stream amounts", public: "Hidden", private: "Confidential Pay flows" },
  { item: "Credit collateral & debt", public: "Hidden", private: "Position masked until Reveal" },
  { item: "Vote choice", public: "Hidden", private: "Aggregate totals only after finalize" },
  { item: "Delegation target", public: "Visible", private: "Public delegate mapping" },
  { item: "Proposal title & deadline", public: "Visible", private: "Governance metadata" },
  { item: "Shield / unshield USDC", public: "Visible", private: "Bridge in/out amounts" },
  { item: "Market TVL & utilization", public: "Aggregate", private: "No per-user leak" },
];

const MODULES = [
  {
    icon: Banknote,
    name: "Pay",
    points: [
      "Private mode: ocUSDC balances and send amounts stay sealed on-chain",
      "Public mode: visible USDC via passkey smart account — separate from FHE flows",
      "Stealth inbox, streams, escrows, and invoices hide amounts by default",
      "Payment receipts and contact labels can stay in browser local storage only",
    ],
  },
  {
    icon: Vote,
    name: "Govern",
    points: [
      "Multi-option ballots encrypted — only you can verify your choice on device",
      "Final results reveal aggregate totals, never individual ballots",
      "Delegation, participation counts, and rewards accrual are public metadata",
      "Advanced Governor track uses plaintext execution votes by design (OZ timelock)",
    ],
  },
  {
    icon: Landmark,
    name: "Credit",
    points: [
      "Borrow, supply, and health computed on encrypted position shares",
      "Liquidation auction bids sealed until settlement",
      "Shared reputation tier is capped aggregate signals — not raw transaction history",
    ],
  },
];

const DATA_HANDLING = [
  {
    icon: Database,
    title: "Indexed activity",
    body: "Our worker sanitizes chain events before Supabase storage. Vote choices and sensitive amounts are stripped; feeds show timing and participants, not decrypted values.",
  },
  {
    icon: Key,
    title: "Device storage",
    body: "Stealth keys, contact labels, and optional payment receipts stay on your device (browser or phone). They are not uploaded as plaintext to Obscura servers.",
  },
  {
    icon: Smartphone,
    title: "Mobile specifics",
    body: "The Android app uses the same contracts and CoFHE path as web inside a secure WebView. Native push is not required for v1; activity is in-app and pull-based on mobile.",
  },
];

const STILL_PUBLIC = [
  "Wallet addresses appearing in events and activity feeds",
  "When you transacted (block timestamps) and transaction hashes",
  "Governance proposal titles, categories, deadlines, and participation counts",
  "Who you delegated voting power to",
  "USDC amounts when shielding into or unshielding out of ocUSDC",
  "Reputation tier buckets and capped weights from the API — not individual amounts",
];

const ACL_ROWS = [
  {
    data: "Employee balance",
    type: "euint64",
    viewers: "Employee, contract",
    ops: "allow, allowThis, add",
  },
  {
    data: "Aggregate payroll",
    type: "euint64",
    viewers: "Auditor (scoped), contract",
    ops: "allow, grantAuditAccess",
  },
  {
    data: "Vote tally",
    type: "euint64",
    viewers: "Public after finalize",
    ops: "allowPublic, add",
  },
  {
    data: "Escrow owner / amount",
    type: "eaddress / euint64",
    viewers: "Owner, resolver",
    ops: "select, gte, allow",
  },
];

const CONTRACTS = [
  {
    name: "ObscuraPay",
    address: OBSCURA_PAY_ADDRESS,
    fields: [
      "encryptedBalances[addr] → euint64",
      "totalPayroll → euint64 (auditor aggregate)",
      "stream hints → InEaddress (Wave 3)",
    ],
  },
  {
    name: "ObscuraVote",
    address: OBSCURA_VOTE_ADDRESS,
    fields: [
      "optionTallies[i] → euint64",
      "vote weights → encrypted, revocable",
    ],
  },
];

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <Icon className="size-4 text-forest" />
      <h2 className="font-display text-lg text-forest">{children}</h2>
    </div>
  );
}

const PrivacyPage = () => {
  const { isConnected } = useAccount();
  const [permits, setPermits] = useState<PermitInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isConnected && getFHEClient()) {
      loadPermits();
    } else {
      setPermits([]);
    }
  }, [isConnected]);

  const loadPermits = async () => {
    setIsLoading(true);
    try {
      const rawPermits = await getPermits();
      setPermits(
        rawPermits.map((p: { contractAddress?: string; createdAt?: string }) => ({
          contractAddress: p?.contractAddress ?? "Unknown",
          createdAt: p?.createdAt ?? new Date().toISOString(),
        })),
      );
    } catch {
      /* FHE client may not be initialized */
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevoke = async (contractAddress: string) => {
    try {
      await removePermit(contractAddress);
      setPermits((prev) => prev.filter((p) => p.contractAddress !== contractAddress));
      toast.success("Permit revoked");
    } catch {
      toast.error("Failed to revoke permit");
    }
  };

  return (
    <div className="landing-spade docs-page min-h-screen bg-sage-1">
      <SpadeLandingNav />

      <div className="mx-auto max-w-[900px] px-4 pb-20 pt-10 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-forest/45">
            ▸ Privacy model
          </p>
          <ObscuraSlogan size="page" className="mt-4" />
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-forest/60">
            Obscura keeps sensitive financial and governance values encrypted on-chain while settling
            on public Ethereum L2s. Web and mobile share the same privacy model: sealed by default,
            revealed only when you choose.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/pay"
              className="inline-flex items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-medium text-sage-1 transition-opacity hover:opacity-90"
            >
              Launch web app
            </Link>
            <Link
              to="/download"
              className="inline-flex items-center gap-2 rounded-full border border-forest/20 bg-white px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-forest/35"
            >
              <Smartphone className="size-4" />
              Mobile app
            </Link>
          </div>
        </motion.header>

        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            {PILLARS.map((p) => (
              <DocsPanel key={p.title} className="p-5">
                <p.icon className="mb-3 size-5 text-forest" />
                <h3 className="font-display text-base text-forest">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-forest/55">{p.desc}</p>
              </DocsPanel>
            ))}
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
          >
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-forest/45">
              ▸ Obscura apps
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {APPS.map((app) => (
                <DocsPanel key={app.title} className="flex flex-col p-5">
                  <app.icon className="mb-3 size-5 text-forest" />
                  <h3 className="font-display text-base text-forest">{app.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-forest/55">{app.body}</p>
                  <Link
                    to={app.cta.href}
                    className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-medium text-forest underline-offset-2 hover:underline"
                  >
                    {app.cta.label}
                  </Link>
                </DocsPanel>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-forest/45">
              Network: Arbitrum Sepolia testnet (chain ID 421614). Fhenix CoFHE coprocessing is
              testnet-only today — mainnet availability follows FHE infrastructure, not app features.
            </p>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <DocsPanel className="p-6 md:p-8">
              <p className="mb-5 font-mono text-[10px] uppercase tracking-[0.22em] text-forest/45">
                ▸ Ciphertext lifecycle
              </p>
              <div className="grid gap-6 sm:grid-cols-2">
                {LIFECYCLE.map((item) => (
                  <div key={item.step} className="flex gap-4">
                    <span className="font-mono text-xs text-lime-accent/90">{item.step}</span>
                    <div>
                      <p className="font-display text-base text-forest">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-forest/55">{item.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </DocsPanel>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <DocsPanel className="overflow-hidden p-0">
              <div className="border-b border-forest/10 px-5 py-4">
                <SectionTitle icon={EyeOff}>Onchain visibility</SectionTitle>
                <p className="text-sm text-forest/55">
                  What explorers and indexers can infer versus what Obscura seals by default.
                </p>
              </div>
              <div className="hidden grid-cols-[1fr_0.9fr_1.1fr] gap-3 border-b border-forest/8 bg-sage-2/80 px-5 py-2.5 text-[10px] font-mono uppercase tracking-wider text-forest/45 sm:grid">
                <span>Surface</span>
                <span>Public chain default</span>
                <span>Obscura</span>
              </div>
              <div className="divide-y divide-forest/8">
                {VISIBILITY.map((row) => (
                  <div
                    key={row.item}
                    className="grid grid-cols-[1fr_1fr_1.2fr] gap-3 px-5 py-3 text-xs sm:text-sm"
                  >
                    <span className="font-medium text-forest">{row.item}</span>
                    <span className="font-mono text-forest/40">{row.public}</span>
                    <span className="font-mono text-forest/70">{row.private}</span>
                  </div>
                ))}
              </div>
            </DocsPanel>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-forest/45">
              ▸ By module
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {MODULES.map((mod) => (
                <DocsPanel key={mod.name} className="p-5">
                  <mod.icon className="mb-3 size-5 text-forest" />
                  <h3 className="font-display text-base text-forest">{mod.name}</h3>
                  <ul className="mt-3 space-y-2">
                    {mod.points.map((pt) => (
                      <li
                        key={pt}
                        className="flex gap-2 text-sm leading-snug text-forest/55"
                      >
                        <span className="text-lime-accent">›</span>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </DocsPanel>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
          >
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-forest/45">
              ▸ Data & off-chain services
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {DATA_HANDLING.map((row) => (
                <DocsPanel key={row.title} className="p-5">
                  <row.icon className="mb-3 size-5 text-forest" />
                  <h3 className="font-display text-base text-forest">{row.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-forest/55">{row.body}</p>
                </DocsPanel>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
          >
            <DocsPanel className="p-6">
              <SectionTitle icon={Eye}>Still public by design</SectionTitle>
              <p className="mb-4 text-sm text-forest/55">
                Even with FHE, some metadata remains visible on testnet. Plan accordingly for
                operational security and compliance reviews.
              </p>
              <ul className="space-y-2">
                {STILL_PUBLIC.map((line) => (
                  <li key={line} className="flex gap-2 text-sm leading-snug text-forest/60">
                    <span className="text-forest/35">•</span>
                    {line}
                  </li>
                ))}
              </ul>
            </DocsPanel>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.26 }}
          >
            <DocsPanel className="p-6">
              <SectionTitle icon={Key}>Your active permits</SectionTitle>
              <p className="mb-4 text-sm text-forest/55">
                View permits let you decrypt sealed values you own. They bind to your wallet on web
                or mobile. The sealing private key never leaves your device.
              </p>

              {!isConnected ? (
                <div className="rounded-lg border border-dashed border-forest/15 bg-sage-2/80 px-4 py-8 text-center">
                  <Eye className="mx-auto mb-2 size-5 text-forest/35" />
                  <p className="text-sm text-forest/50">Connect your wallet to view permits</p>
                </div>
              ) : isLoading ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-14 animate-pulse rounded-lg bg-sage-2" />
                  ))}
                </div>
              ) : permits.length === 0 ? (
                <p className="rounded-lg bg-sage-2 px-4 py-6 text-center font-mono text-xs text-forest/45">
                  No active permits. Tapping Reveal in Pay, Credit, or Govern — or verifying your
                  vote — creates one.
                </p>
              ) : (
                <div className="space-y-2">
                  {permits.map((permit, i) => (
                    <div
                      key={`${permit.contractAddress}-${i}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-forest/10 bg-sage-1 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs text-forest">
                          {permit.contractAddress}
                        </p>
                        <p className="font-mono text-[10px] text-forest/40">
                          EIP-712 self-permit · sealing keypair
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRevoke(permit.contractAddress)}
                        className="inline-flex items-center gap-1.5 rounded-md border border-red-300/60 px-3 py-1.5 font-mono text-[10px] text-red-700 transition-colors hover:bg-red-50"
                      >
                        <Trash2 className="size-3" />
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </DocsPanel>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <DocsPanel className="p-6">
              <SectionTitle icon={Shield}>Contracts & ACL</SectionTitle>

              <div className="space-y-4">
                {CONTRACTS.map((c) => (
                  <div
                    key={c.name}
                    className="rounded-lg border border-forest/10 bg-sage-1 p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-xs font-medium text-forest">
                        {c.name}
                      </span>
                      {c.address && (
                        <a
                          href={`${EXPLORER_URL}/address/${c.address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 font-mono text-[10px] text-forest/55 hover:text-forest"
                        >
                          Arbiscan
                          <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                    <p className="mb-3 break-all font-mono text-[10px] text-forest/40">
                      {c.address ?? "Not configured"}
                    </p>
                    <ul className="space-y-1.5">
                      {c.fields.map((f) => (
                        <li
                          key={f}
                          className="flex gap-2 font-mono text-[10px] text-forest/60"
                        >
                          <span className="text-lime-accent">•</span>
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <div className="mt-6 overflow-x-auto rounded-lg border border-forest/10">
                <table className="w-full min-w-[520px] text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-forest/10 bg-sage-2 font-mono uppercase tracking-wider text-forest/45">
                      <th className="px-4 py-2.5">Data</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Who can decrypt</th>
                      <th className="px-4 py-2.5">FHE ops</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest/8 font-mono text-forest/65">
                    {ACL_ROWS.map((row) => (
                      <tr key={row.data} className="bg-white">
                        <td className="px-4 py-2.5 text-forest">{row.data}</td>
                        <td className="px-4 py-2.5">{row.type}</td>
                        <td className="px-4 py-2.5">{row.viewers}</td>
                        <td className="px-4 py-2.5">{row.ops}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg border border-lime-accent/25 bg-lime-accent/8 px-4 py-3">
                <p className="font-mono text-[11px] leading-relaxed text-forest/70">
                  <span className="font-medium text-forest">Permit flow:</span> your device encrypts
                  with CoFHE; only your signed permit authorizes decryption for your wallet.
                  Obscura operators cannot read sealed balances or ballots without that signature.
                </p>
              </div>
            </DocsPanel>
          </motion.section>

          <p className="text-center text-sm text-forest/45">
            Need implementation detail?{" "}
            <Link to="/docs" className="font-medium text-forest underline-offset-2 hover:underline">
              Read the docs
            </Link>
          </p>
        </div>
      </div>

      <SpadeFooter />
    </div>
  );
};

export default PrivacyPage;
