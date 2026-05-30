import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Shield, Landmark, Vote, Database, Cpu, Layers, Bot, Terminal, Code2, BookOpen, Copy, Check } from "lucide-react";
import type { DocVisualVariant } from "@docs/types";
import { MCP_VERSION, SDK_VERSION } from "@docs/constants";
import { mcpConfigJson } from "@docs/mcp-config";

function FlowBox({
  label,
  sub,
  accent,
}: {
  label: string;
  sub?: string;
  accent?: "pay" | "credit" | "vote" | "shared" | "neutral";
}) {
  return (
    <div className={`docs-flow-box docs-flow-box--${accent ?? "neutral"}`}>
      <span className="docs-flow-box-label">{label}</span>
      {sub ? <span className="docs-flow-box-sub">{sub}</span> : null}
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="docs-flow-arrow" aria-hidden>
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

function EcosystemMap() {
  return (
    <div className="docs-visual docs-visual--map">
      <div className="docs-visual-header">
        <span className="docs-visual-label">Ecosystem</span>
        <span className="docs-visual-title">Pay · Credit · Vote · Shared Services</span>
      </div>
      <div className="docs-ecosystem-grid">
        <Link to="/docs/pay" className="docs-eco-card docs-eco-card--pay">
          <Shield className="h-5 w-5" />
          <span className="docs-eco-card-name">Pay</span>
          <span className="docs-eco-card-desc">Private payments & ocUSDC</span>
        </Link>
        <Link to="/docs/credit" className="docs-eco-card docs-eco-card--credit">
          <Landmark className="h-5 w-5" />
          <span className="docs-eco-card-name">Credit</span>
          <span className="docs-eco-card-desc">Encrypted lending market</span>
        </Link>
        <Link to="/docs/vote" className="docs-eco-card docs-eco-card--vote">
          <Vote className="h-5 w-5" />
          <span className="docs-eco-card-name">Vote</span>
          <span className="docs-eco-card-desc">FHE governance & treasury</span>
        </Link>
        <div className="docs-eco-shared">
          <span className="docs-eco-shared-label">Shared services</span>
          <div className="docs-eco-shared-links">
            <Link to="/docs/reputation">Reputation</Link>
            <Link to="/docs/activity">Activity</Link>
            <Link to="/docs/notifications">Notifications</Link>
          </div>
        </div>
      </div>
      <div className="docs-eco-asset">
        <span className="docs-eco-asset-pill">ocUSDC_Pay</span>
        <span className="docs-eco-asset-note">Canonical encrypted asset · Arbitrum Sepolia 421614</span>
      </div>
    </div>
  );
}

function ProductOverview() {
  const [active, setActive] = useState<"pay" | "credit" | "vote">("pay");
  const data = {
    pay: {
      route: "/pay",
      asset: "ocUSDC_Pay",
      hook: "useOcUSDCBalance",
      sdk: "sdk.pay",
      flows: ["Shield USDC", "Private transfer", "Streams & escrows", "Stealth receive"],
    },
    credit: {
      route: "/credit",
      asset: "CreditCanonicalPayOcUSDCMarket",
      hook: "useCreditPosition",
      sdk: "sdk.credit",
      flows: ["Supply collateral", "Borrow encrypted", "Repay & withdraw", "Sealed liquidation"],
    },
    vote: {
      route: "/vote",
      asset: "ObscuraVote V5",
      hook: "useEncryptedVote",
      sdk: "sdk.vote",
      flows: ["Create proposal", "Cast encrypted vote", "Delegate weight", "Treasury spend"],
    },
  } as const;
  const d = data[active];

  return (
    <div className="docs-visual">
      <div className="docs-product-tabs" role="tablist">
        {(["pay", "credit", "vote"] as const).map((key) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active === key}
            className="docs-product-tab"
            data-active={active === key}
            data-product={key}
            onClick={() => setActive(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>
      <div className="docs-product-panel">
        <div className="docs-product-meta">
          <div><span className="docs-meta-k">Route</span><span className="docs-meta-v">{d.route}</span></div>
          <div><span className="docs-meta-k">Anchor</span><span className="docs-meta-v">{d.asset}</span></div>
          <div><span className="docs-meta-k">Hook</span><span className="docs-meta-v">{d.hook}</span></div>
          <div><span className="docs-meta-k">SDK</span><span className="docs-meta-v">{d.sdk}</span></div>
        </div>
        <ul className="docs-product-flows">
          {d.flows.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
        <Link to={`/docs/${active}`} className="docs-product-cta">
          Read {active} docs <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

function SharedState() {
  return (
    <div className="docs-visual docs-visual--shared">
      <div className="docs-shared-core">
        <Layers className="h-6 w-6" />
        <div>
          <div className="font-semibold text-[#18280e]">Shared encrypted state</div>
          <div className="text-sm text-[rgba(24,40,14,0.55)] mt-1">
            All products read/write euint64 handles on-chain. CoFHE ACL controls who can decrypt.
          </div>
        </div>
      </div>
      <div className="docs-shared-rows">
        <div className="docs-shared-row"><span>Balances</span><code>euint64 ctHash</code></div>
        <div className="docs-shared-row"><span>Credit shares</span><code>encrypted supply/borrow</code></div>
        <div className="docs-shared-row"><span>Vote ballots</span><code>encrypted option index</code></div>
        <div className="docs-shared-row"><span>Reputation</span><code>off-chain capped signals</code></div>
      </div>
    </div>
  );
}

function ReputationFlow() {
  return (
    <div className="docs-visual docs-flow-horizontal">
      <FlowBox label="Chain events" sub="51 types" accent="neutral" />
      <FlowArrow />
      <FlowBox label="Worker" sub="index + derive" accent="shared" />
      <FlowArrow />
      <FlowBox label="Supabase" sub="activity + rep" accent="shared" />
      <FlowArrow />
      <FlowBox label="API" sub="GET /reputation" accent="shared" />
      <FlowArrow />
      <FlowBox label="SDK / UI" sub="tier buckets" accent="neutral" />
    </div>
  );
}

function ScaleGrid() {
  const metrics = [
    { label: "Active contracts", value: "38", detail: "§32 registry" },
    { label: "Indexed events", value: "51", detail: "19 contract instances" },
    { label: "Frontend hooks", value: "62", detail: "React modules" },
    { label: "SDK modules", value: "6", detail: "pay · credit · vote · …" },
    { label: "Reputation signals", value: "28", detail: "capped weights" },
    { label: "API routes", value: "12", detail: "obscura-api" },
    { label: "Supabase tables", value: "4", detail: "activity · rep · prefs" },
    { label: "FHE contract types", value: "21", detail: "ACTIVE deployments" },
  ];
  return (
    <div className="docs-scale-grid">
      {metrics.map((m) => (
        <div key={m.label} className="docs-scale-card">
          <div className="docs-scale-value">{m.value}</div>
          <div className="docs-scale-label">{m.label}</div>
          <div className="docs-scale-detail">{m.detail}</div>
        </div>
      ))}
    </div>
  );
}

function DataFlow() {
  return (
    <div className="docs-visual docs-data-flow">
      <div className="docs-visual-header">
        <span className="docs-visual-label">Data flow</span>
        <span className="docs-visual-title">SDK → API → Worker → Supabase → CoFHE → Contracts</span>
      </div>
      <div className="docs-data-flow-track">
        <FlowBox label="@obscura-fhe/sdk" sub="reads + tx builders" />
        <FlowArrow />
        <FlowBox label="obscura-api" sub="reputation · relay · push" accent="shared" />
        <FlowArrow />
        <FlowBox label="obscura-worker" sub="indexer · derive" accent="shared" />
        <FlowArrow />
        <FlowBox label="Supabase" sub="activity · realtime" accent="shared" />
      </div>
      <div className="docs-data-flow-branch">
        <div className="docs-data-flow-down" aria-hidden>↓</div>
        <div className="docs-data-flow-track">
          <FlowBox label="Arbitrum Sepolia" sub="EVM state" accent="neutral" />
          <FlowArrow />
          <FlowBox label="Fhenix CoFHE" sub="FHE compute" accent="neutral" />
          <FlowArrow />
          <FlowBox label="Contracts" sub="Pay · Credit · Vote" accent="neutral" />
        </div>
      </div>
    </div>
  );
}

function SystemTiers() {
  const tiers = [
    { icon: Cpu, name: "Client", desc: "React + wagmi + CoFHE SDK · reveal-on-demand UX" },
    { icon: Layers, name: "Compute", desc: "Arbitrum Sepolia EVM + Fhenix coprocessor" },
    { icon: Database, name: "Index + API", desc: "Worker indexer · obscura-api REST" },
    { icon: Database, name: "Persistence", desc: "Supabase Postgres + Realtime fan-out" },
  ];
  return (
    <div className="docs-tier-grid">
      {tiers.map((t) => (
        <div key={t.name} className="docs-tier-card">
          <t.icon className="h-5 w-5 text-[#2d8a5e]" />
          <div className="docs-tier-name">{t.name}</div>
          <div className="docs-tier-desc">{t.desc}</div>
        </div>
      ))}
    </div>
  );
}

function PrivacyZones() {
  const zones = [
    { type: "encrypted", label: "Encrypted on-chain", items: ["ocUSDC balances", "Credit position shares", "Vote ballot option", "Pre-finalize tallies"] },
    { type: "public", label: "Public by design", items: ["TVL & utilization", "Proposal metadata", "hasVoted flags", "Shield/unshield bridge amounts"] },
    { type: "reveal-user", label: "User reveal", items: ["Balance / position UI", "Self ballot decrypt", "Explicit permit click"] },
    { type: "reveal-agg", label: "Aggregate reveal", items: ["Post-finalize vote tallies", "Public tier buckets", "Capped reputation summary"] },
  ];
  return (
    <div className="docs-privacy-grid">
      {zones.map((z) => (
        <div key={z.type} className="docs-privacy-zone" data-zone={z.type}>
          <div className="docs-privacy-zone-label">{z.label}</div>
          <ul>{z.items.map((i) => <li key={i}>{i}</li>)}</ul>
        </div>
      ))}
    </div>
  );
}

function CofheLifecycle() {
  const steps = ["Encrypt (SDK)", "Submit tx", "CoFHE compute", "ACL on-chain", "User decrypt"];
  return (
    <div className="docs-visual">
      <div className="docs-lifecycle">
        {steps.map((s, i) => (
          <div key={s} className="docs-lifecycle-step">
            <div className="docs-lifecycle-num">{i + 1}</div>
            <div className="docs-lifecycle-label">{s}</div>
            {i < steps.length - 1 ? <div className="docs-lifecycle-line" /> : null}
          </div>
        ))}
      </div>
      <p className="docs-lifecycle-note">
        InEuint64 inputs bind to the encryption signer (EOA). Smart accounts cannot forward encrypted inputs — InvalidSigner on forward.
      </p>
    </div>
  );
}

function OnboardingPath() {
  const steps = [
    { n: 1, title: "Install SDK", href: "/docs/quick-start", desc: "npm install @obscura-fhe/sdk viem" },
    { n: 2, title: "Connect wallet", href: "/docs/sdk-onboarding", desc: "viem walletClient + publicClient" },
    { n: 3, title: "Read reputation", href: "/docs/reputation", desc: "sdk.reputation.getSummary()" },
    { n: 4, title: "Activity feed", href: "/docs/activity", desc: "sdk.activity.listForWallet()" },
    { n: 5, title: "Pay flows", href: "/docs/pay", desc: "Shield, transfer, streams" },
    { n: 6, title: "Credit flows", href: "/docs/credit", desc: "Supply, borrow, repay" },
    { n: 7, title: "Vote flows", href: "/docs/vote", desc: "Proposals, cast, delegate" },
  ];
  return (
    <div className="docs-onboarding-path">
      {steps.map((s) => (
        <Link key={s.n} to={s.href} className="docs-onboarding-step">
          <span className="docs-onboarding-num">{s.n}</span>
          <span className="docs-onboarding-body">
            <span className="docs-onboarding-title">{s.title}</span>
            <span className="docs-onboarding-desc">{s.desc}</span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 opacity-40" />
        </Link>
      ))}
    </div>
  );
}

function SdkModules() {
  const modules = [
    { name: "pay", methods: "getShieldedBalance · buildShield · buildTransfer" },
    { name: "credit", methods: "getMarketUtilization · buildSupplyCollateral · buildBorrow" },
    { name: "vote", methods: "getProposal · buildCastVote · buildDelegate" },
    { name: "reputation", methods: "getSummary" },
    { name: "activity", methods: "listForWallet · getEventFilters" },
    { name: "notifications", methods: "getPrefs · subscribe · getVapidPublicKey" },
  ];
  return (
    <div className="docs-sdk-modules">
      {modules.map((m) => (
        <div key={m.name} className="docs-sdk-module">
          <code className="docs-sdk-module-name">sdk.{m.name}</code>
          <span className="docs-sdk-module-methods">{m.methods}</span>
        </div>
      ))}
    </div>
  );
}

function McpProfiles() {
  const profiles = [
    { id: "user", name: "User MCP", bin: "obscura-mcp-user", tools: "17 tools", accent: "user", desc: "Wallet-scoped reads + unsigned tx builders" },
    { id: "dev", name: "Developer MCP", bin: "obscura-mcp-dev", tools: "Repo tools", accent: "dev", desc: "Local clone inspection · secret denylist" },
    { id: "docs", name: "Documentation MCP", bin: "obscura-mcp-docs", tools: "11 tools", accent: "docs", desc: "14-page portal · no chain RPC" },
  ];
  return (
    <div className="docs-visual docs-visual--mcp">
      <div className="docs-visual-header">
        <span className="docs-visual-label">MCP v{MCP_VERSION}</span>
        <span className="docs-visual-title">Three isolated profiles · one SDK foundation</span>
      </div>
      <div className="docs-mcp-profile-grid">
        {profiles.map((p, i) => (
          <div
            key={p.id}
            className={`docs-mcp-profile-card docs-mcp-profile-card--${p.accent}`}
            style={{ animationDelay: `${i * 0.12}s` }}
          >
            <div className="docs-mcp-profile-card-head">
              <span className="docs-mcp-profile-card-name">{p.name}</span>
              <span className="docs-mcp-profile-card-tools">{p.tools}</span>
            </div>
            <code className="docs-mcp-profile-card-bin">{p.bin}</code>
            <p className="docs-mcp-profile-card-desc">{p.desc}</p>
          </div>
        ))}
      </div>
      <div className="docs-mcp-version-strip">
        <span>@obscura-fhe/mcp@{MCP_VERSION}</span>
        <span>@obscura-fhe/sdk@{SDK_VERSION}</span>
      </div>
    </div>
  );
}

function McpAgentFlow() {
  const steps = [
    { icon: Bot, label: "AI Agent", sub: "Cursor · Claude · VS Code" },
    { icon: Terminal, label: "MCP stdio", sub: "Privacy guard" },
    { icon: Code2, label: "SDK", sub: "sdk.pay · credit · vote" },
    { icon: Shield, label: "CoFHE + Chain", sub: "421614" },
  ];
  return (
    <div className="docs-visual docs-mcp-flow-visual">
      <div className="docs-visual-header">
        <span className="docs-visual-label">Agent flow</span>
        <span className="docs-visual-title">Encrypt in browser → pre-encrypted InEuint64 → MCP builds tx → user signs</span>
      </div>
      <div className="docs-mcp-flow-steps">
        {steps.map((s, i) => (
          <div key={s.label} className="docs-mcp-flow-step-wrap">
            <div className="docs-mcp-flow-step">
              <s.icon className="h-5 w-5" />
              <span className="docs-mcp-flow-step-label">{s.label}</span>
              <span className="docs-mcp-flow-step-sub">{s.sub}</span>
            </div>
            {i < steps.length - 1 ? (
              <div className="docs-mcp-flow-connector">
                <span className="docs-mcp-flow-packet" style={{ animationDelay: `${i * 0.5}s` }} />
              </div>
            ) : null}
          </div>
        ))}
      </div>
      <p className="docs-mcp-flow-note">
        MCP never decrypts balances. User MCP returns opaque ctHash handles and unsigned ContractCall objects only.
      </p>
    </div>
  );
}

const IDE_TABS = [
  { id: "cursor", label: "Cursor", path: ".cursor/mcp.json", hint: "Project or ~/.cursor/mcp.json (global)" },
  { id: "claude", label: "Claude", path: "claude_desktop_config.json", hint: "macOS: ~/Library/Application Support/Claude/ · Windows: %APPDATA%\\Claude\\" },
  { id: "vscode", label: "VS Code", path: ".vscode/mcp.json", hint: "GitHub Copilot MCP · workspace root" },
  { id: "windsurf", label: "Windsurf", path: "mcp_config.json", hint: "~/.codeium/windsurf/ or .windsurf/" },
  { id: "continue", label: "Continue", path: "~/.continue/config.json", hint: "Merge mcpServers into existing config" },
  { id: "generic", label: "Any agent", path: "stdio", hint: "command + args + env · one profile per process" },
] as const;

function McpIdeSetup() {
  const [tab, setTab] = useState<(typeof IDE_TABS)[number]["id"]>("cursor");
  const [copied, setCopied] = useState(false);
  const active = IDE_TABS.find((t) => t.id === tab)!;
  const configText = tab === "generic"
    ? `# Documentation MCP (zero secrets)
node ./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-docs.js

# User MCP (API only)
OBSCURA_API_URL=https://obscura-api-n62v.onrender.com \\
  node ./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js`
    : mcpConfigJson();

  const copy = async () => {
    await navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="docs-visual docs-mcp-ide-setup">
      <div className="docs-visual-header">
        <span className="docs-visual-label">Setup wizard</span>
        <span className="docs-visual-title">Pick your IDE — same mcpServers JSON everywhere</span>
      </div>
      <div className="docs-mcp-ide-tabs" role="tablist">
        {IDE_TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`docs-mcp-ide-tab${tab === t.id ? " docs-mcp-ide-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="docs-mcp-ide-panel">
        <div className="docs-mcp-ide-meta">
          <BookOpen className="h-4 w-4 shrink-0" />
          <div>
            <strong>{active.path}</strong>
            <span>{active.hint}</span>
          </div>
        </div>
        <div className="docs-mcp-ide-code-wrap">
          <pre className="docs-mcp-ide-code"><code>{configText}</code></pre>
          <button type="button" className="docs-mcp-copy-btn docs-mcp-copy-btn--panel" onClick={copy}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
        <ol className="docs-mcp-ide-steps">
          <li>Run <code>npm install @obscura-fhe/mcp@{MCP_VERSION}</code> in your project</li>
          <li>Paste config into {active.path}</li>
          <li>Restart your IDE / agent — User MCP needs only <code>OBSCURA_API_URL</code></li>
        </ol>
      </div>
    </div>
  );
}

const VISUALS: Record<DocVisualVariant, () => JSX.Element> = {
  "ecosystem-map": EcosystemMap,
  "product-overview": ProductOverview,
  "shared-state": SharedState,
  "reputation-flow": ReputationFlow,
  "scale-grid": ScaleGrid,
  "data-flow": DataFlow,
  "system-tiers": SystemTiers,
  "privacy-zones": PrivacyZones,
  "cofhe-lifecycle": CofheLifecycle,
  "onboarding-path": OnboardingPath,
  "sdk-modules": SdkModules,
  "mcp-profiles": McpProfiles,
  "mcp-agent-flow": McpAgentFlow,
  "mcp-ide-setup": McpIdeSetup,
};

export function DocVisual({ variant }: { variant: DocVisualVariant }) {
  const Component = VISUALS[variant];
  return Component ? <Component /> : null;
}
