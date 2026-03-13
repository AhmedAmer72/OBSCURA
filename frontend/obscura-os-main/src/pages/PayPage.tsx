import { useState, useRef, useEffect, useCallback, useMemo, type ReactNode } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount } from "wagmi";
import {
  Send,
  ArrowDownToLine,
  Repeat,
  Shield,
  Lock,
  Network,
  Wallet as WalletIcon,
  ShieldCheck,
  Umbrella,
  Wrench,
  RotateCw,
  Plus,
  Inbox,
  FileText,
  Mail,
  Repeat2,
  CalendarClock,
  Users,
  KeyRound,
  Copy,
  LayoutGrid,
} from "lucide-react";

import SectionDiagram from "@/components/elite/SectionDiagram";
import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { HarmonyDrawer, HarmonyFormCard, HarmonyMetricRow, HarmonySection, HarmonySelect, HarmonySubNav, HarmonyWorkspaceHeader } from "@/components/harmony/harmony-ui";
import { PayOverviewPremium } from "@/components/harmony/pay-home/PayOverviewPremium";
import { PayWorkspaceChrome } from "@/components/harmony/PayWorkspaceChrome";
import {
  PayHarmonyDetails,
  PayHarmonyNotConnected,
  PayHarmonyNotice,
  PayHarmonyPanelCard,
  PayHarmonySendBar,
  PayHarmonyTabShell,
} from "@/components/harmony/PayHarmonyTabShell";

import OcUSDCTransferForm from "@/components/pay-v4/OcUSDCTransferForm";
import OcUSDCEscrowForm from "@/components/pay-v4/OcUSDCEscrowForm";
import OcUSDCEscrowActions from "@/components/pay-v4/OcUSDCEscrowActions";
import MyEscrows from "@/components/pay-v4/MyEscrows";
import BatchEscrowForm from "@/components/pay-v4/BatchEscrowForm";
import ClaimEscrowCard from "@/components/pay-v4/ClaimEscrowCard";
import InvoiceForm from "@/components/pay-v4/InvoiceForm";
import InvoicePayCard from "@/components/pay-v4/InvoicePayCard";
import CreateStreamForm from "@/components/pay-v4/CreateStreamForm";
import CreateStreamFormV2 from "@/components/pay-v4/CreateStreamFormV2";
import StreamList from "@/components/pay-v4/StreamList";
import OcUSDCPanel from "@/components/pay-v4/OcUSDCPanel";
import RegisterMetaAddressForm from "@/components/pay-v4/RegisterMetaAddressForm";
import StealthInbox from "@/components/pay-v4/StealthInbox";
import StealthInboxV2 from "@/components/pay-v4/StealthInboxV2";
import CrossChainFundForm from "@/components/pay-v4/CrossChainFundForm";
import BuyCoverageForm from "@/components/pay-v4/BuyCoverageForm";
import DisputeForm from "@/components/pay-v4/DisputeForm";
import StakePoolForm from "@/components/pay-v4/StakePoolForm";
import MyPolicies from "@/components/pay-v4/MyPolicies";
import ReceivablesHub from "@/components/pay-v4/ReceivablesHub";
import ResolverManager from "@/components/pay-v4/ResolverManager";
import UnifiedSendForm from "@/components/pay-v4/UnifiedSendForm";
import PublicUSDCSendForm from "@/components/pay-v4/PublicUSDCSendForm";
import BulkPayrollImport from "@/components/pay-v4/BulkPayrollImport";
import StreamsDashboard from "@/components/pay-v4/StreamsDashboard";
import SubscriptionForm from "@/components/pay-v4/SubscriptionForm";
import { ReceiptList } from "@/components/pay-v4/PaymentReceipt";
import { ActivityFeed } from "@/components/harmony/ActivityFeed";
import NewPaymentBanner from "@/components/pay-v4/NewPaymentBanner";

import { useOcUSDCBalance } from "@/hooks/useOcUSDCBalance";
import { useUSDCBalance } from "@/hooks/useUSDCBalance";
import { useOnboardingState } from "@/hooks/useOnboardingState";
import UsdcIcon from "@/components/shared/UsdcIcon";
import { useStealthInbox } from "@/hooks/useStealthInbox";
import { PaymentModeProvider, usePaymentMode } from "@/contexts/PaymentModeContext";
import { toast } from "sonner";
import {
  isPayRouteValidForMode,
  resolvePayRouteForPrivacyMode,
  type PayRouteTarget,
} from "@/lib/payPrivacyModeNavigation";
import { mapPaySettingsSubToSection, SETTINGS_RETURN_KEY } from "@/lib/settingsNavigation";
import { ReputationSignalsPanel } from "@/components/harmony/ReputationSignalsPanel";

// W5P1.5 — IA refactor: 9 tabs collapsed to 6 user-intent tabs
type Tab = "home" | "pay" | "getpaid" | "automations" | "activity";

const PAY_MOBILE_NAV: { key: Tab; label: string; icon: typeof Send }[] = [
  { key: "home", label: "Overview", icon: LayoutGrid },
  { key: "pay", label: "Send", icon: Send },
  { key: "getpaid", label: "Receive", icon: ArrowDownToLine },
  { key: "automations", label: "Automate", icon: Repeat },
];

function PayTabNotConnected({ tab, message }: { tab: Parameters<typeof PayHarmonyTabShell>[0]["tab"]; message: string }) {
  return (
    <PayHarmonyTabShell tab={tab} hideIntro>
      <PayHarmonyNotConnected message={message} />
    </PayHarmonyTabShell>
  );
}

function PrivateModeGate({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { privacyMode, setPrivacyMode } = usePaymentMode();
  if (privacyMode === "private") return <>{children}</>;

  return (
    <div className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-4">
      <div className="space-y-4">
        <div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-amber-900/55">Private Mode</div>
          <h3 className="mt-1 text-base font-medium text-foreground">{title}</h3>
        </div>
        <p className="text-[13px] text-muted-foreground leading-relaxed">{description}</p>
        <div className="grid gap-2 sm:grid-cols-3 text-[11px]">
          <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Token: ocUSDC</span>
          <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Execution: wallet</span>
          <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Privacy: encrypted</span>
        </div>
        <button type="button" onClick={() => setPrivacyMode("private")} className="btn-pay btn-pay-primary">
          <Lock className="w-3.5 h-3.5" /> Switch to Private Mode
        </button>
      </div>
    </div>
  );
}

function PublicReceivePanel() {
  const { address } = useAccount();
  const { smartAccountAddress, isSmartAvailable, setPrivacyMode } = usePaymentMode();

  const copy = async (value?: string | null) => {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <HarmonyFormCard title="Receive public USDC" eyebrow="Public Mode">
      <div className="space-y-4">
        <p className="text-[13px] text-muted-foreground leading-relaxed">
          Public Mode receives normal USDC. Share your smart account address for passkey spending, or your wallet address for standard wallet custody.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-xl hairline bg-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
              <KeyRound className="h-3.5 w-3.5" /> Smart account
            </div>
            <p className="mt-2 break-all font-mono text-[12px] text-muted-foreground">
              {smartAccountAddress ?? "Set up passkey first"}
            </p>
            <button type="button" onClick={() => void copy(smartAccountAddress)} disabled={!smartAccountAddress} className="btn-pay btn-pay-ghost btn-pay-sm mt-3">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
          <div className="rounded-xl hairline bg-card p-4">
            <div className="flex items-center gap-2 text-[12px] font-medium text-foreground">
              <WalletIcon className="h-3.5 w-3.5" /> Wallet
            </div>
            <p className="mt-2 break-all font-mono text-[12px] text-muted-foreground">{address ?? "Connect wallet"}</p>
            <button type="button" onClick={() => void copy(address)} disabled={!address} className="btn-pay btn-pay-ghost btn-pay-sm mt-3">
              <Copy className="h-3 w-3" /> Copy
            </button>
          </div>
        </div>
        {!isSmartAvailable && (
          <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.06] p-3 text-[12px] text-amber-900">
            Passkey setup is needed before the smart account can spend public USDC gaslessly.
          </p>
        )}
        <button type="button" onClick={() => setPrivacyMode("private")} className="btn-pay btn-pay-ghost">
          <Shield className="w-3.5 h-3.5" /> Switch to encrypted receiving
        </button>
      </div>
    </HarmonyFormCard>
  );
}

function ModeAwareSendForm() {
  const { privacyMode } = usePaymentMode();
  return privacyMode === "public" ? <PublicUSDCSendForm /> : <UnifiedSendForm />;
}

type PaySub = "send" | "convert" | "bridge";

/** Pay · Send workspace — sub-nav respects privacy mode (Make private → Private + convert). */
function PaySendWorkspace({
  paySub,
  onPaySub,
}: {
  paySub: PaySub;
  onPaySub: (next: PaySub) => void;
}) {
  const { privacyMode, setPrivacyMode } = usePaymentMode();

  const sendSubItems = useMemo(
    () =>
      [
        { key: "send" as const, label: "Send", icon: Send },
        { key: "convert" as const, label: "Make private", icon: Shield },
        { key: "bridge" as const, label: "Bridge", icon: Network, badge: "CCTP" as const },
      ].filter((item) => privacyMode !== "public" || item.key !== "convert"),
    [privacyMode],
  );

  const handlePaySub = useCallback(
    (next: PaySub) => {
      if (privacyMode === "public" && next === "convert") {
        setPrivacyMode("private");
        onPaySub("convert");
        toast.info("Switched to Private Mode", {
          description: "You can shield and unshield USDC into encrypted ocUSDC here.",
          duration: 5000,
        });
        return;
      }
      onPaySub(next);
    },
    [privacyMode, setPrivacyMode, onPaySub],
  );

  return (
    <PayHarmonyTabShell tab="pay" hideIntro>
      <HarmonySubNav<PaySub>
        value={paySub}
        onChange={handlePaySub}
        items={sendSubItems}
      />
      {paySub === "send" && (
        <>
          <PayHarmonySendBar onShield={() => handlePaySub("convert")} />
          <PayHarmonyPanelCard title="Send privately" eyebrow="Encrypted transfer">
            <ModeAwareSendForm />
          </PayHarmonyPanelCard>
        </>
      )}
      {paySub === "convert" && (
        <PayHarmonyPanelCard title="Make USDC private" eyebrow="Shield · Unshield">
          <OcUSDCPanel />
        </PayHarmonyPanelCard>
      )}
      {paySub === "bridge" && (
        <>
          <PayHarmonyPanelCard title="Bridge USDC from another chain" eyebrow="Cross-chain · CCTP">
            <CrossChainFundForm />
          </PayHarmonyPanelCard>
          <HarmonySection title="How it works" hint="Payment flow on-chain">
            <div className="rounded-2xl hairline bg-card p-6">
              <SectionDiagram flow="send" />
            </div>
          </HarmonySection>
        </>
      )}
    </PayHarmonyTabShell>
  );
}

function ModeAwareGetPaid({ children }: { children: ReactNode }) {
  const { privacyMode } = usePaymentMode();
  if (privacyMode === "public") {
    return (
      <div className="space-y-5">
        <PublicReceivePanel />
        <PayHarmonyPanelCard title="Request private payment" eyebrow="Switch required">
          <PrivateModeGate
            title="Encrypted invoices and stealth inbox"
            description="Private requests, stealth inbox claims, and inbound encrypted streams use ocUSDC and wallet-secured FHE transactions."
          >
            <div />
          </PrivateModeGate>
        </PayHarmonyPanelCard>
      </div>
    );
  }
  return <>{children}</>;
}

function ModeAwareAutomations({ children }: { children: ReactNode }) {
  const { privacyMode, setPrivacyMode, isSmartAvailable } = usePaymentMode();
  if (privacyMode === "public") {
    return (
      <div className="space-y-5">
        <HarmonyWorkspaceHeader
          eyebrow="Public Mode"
          title="Public automations are not enabled yet"
          description="Public Mode is currently focused on one-time USDC sends from the passkey smart account. Encrypted recurring agreements remain in Private Mode."
        />
        <PayHarmonyPanelCard title="Switch required" eyebrow="Private Mode · ocUSDC">
          <div className="space-y-4">
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              Streams, escrows, payroll batches, subscriptions, and insurance move private ocUSDC through wallet-secured FHE transactions. They are not routed through the smart account.
            </p>
            <div className="grid gap-2 sm:grid-cols-3 text-[11px]">
              <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Token: ocUSDC</span>
              <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Execution: wallet</span>
              <span className="rounded-xl hairline bg-muted/40 px-3 py-2">Amounts: encrypted</span>
            </div>
            <button type="button" onClick={() => setPrivacyMode("private")} className="btn-pay btn-pay-primary">
              <Lock className="w-3.5 h-3.5" /> Switch to Private Mode
            </button>
          </div>
        </PayHarmonyPanelCard>
        <PayHarmonyNotice title="Public payment tooling">
          {isSmartAvailable
            ? "Use the Pay tab for gasless visible USDC sends. Public recurring automation will get its own surface once it exists."
            : "Set up the passkey smart account from Settings before using public gasless USDC sends."}
        </PayHarmonyNotice>
      </div>
    );
  }
  return <>{children}</>;
}

function ModeAwareActivity() {
  const { privacyMode } = usePaymentMode();
  return (
    <PayHarmonyTabShell tab="activity" hideIntro>
      <PayHarmonyNotice title={privacyMode === "public" ? "Public Mode visibility" : "Private Mode visibility"}>
        {privacyMode === "public"
          ? "This view is limited to normal USDC, smart-account, paymaster, and bridge events. Private ocUSDC receipts stay out of this workspace."
          : "This view is limited to encrypted ocUSDC flows. Public USDC smart-account receipts stay out of this workspace."}
      </PayHarmonyNotice>
      {privacyMode === "private" && <ReputationSignalsPanel />}
      <ActivityFeed mode={privacyMode} />
      <HarmonyFormCard title="Local receipts" eyebrow="Browser only · Not synced">
        <ReceiptList mode={privacyMode} />
      </HarmonyFormCard>
    </PayHarmonyTabShell>
  );
}

function ModeAwarePayShell({
  tab,
  unreadCount,
  isConnected,
  onSelectTab,
  onGoToSettings,
  onSetupSmart,
  children,
}: {
  tab: Tab;
  unreadCount: number;
  isConnected: boolean;
  onSelectTab: (tab: Tab) => void;
  onGoToSettings: () => void;
  onSetupSmart?: () => void;
  children: ReactNode;
}) {
  const { privacyMode } = usePaymentMode();
  const mobileNavItems =
    privacyMode === "public"
      ? PAY_MOBILE_NAV.filter((item) => item.key !== "automations")
      : PAY_MOBILE_NAV;
  const harmonySidebar = mobileNavItems.map((item) => ({
    key: item.key,
    label: item.label,
    icon: item.icon,
    active: tab === item.key,
    badge:
      privacyMode === "private" && item.key === "getpaid" && unreadCount > 0
        ? String(unreadCount)
        : undefined,
    onClick: () => onSelectTab(item.key),
  }));

  const showPayWorkspaceChrome =
    tab === "home" || tab === "pay" || tab === "getpaid" || tab === "automations" || tab === "activity";

  return (
    <HarmonyAppShell
      sidebar={harmonySidebar}
      searchPlaceholder="Search payments, proposals, positions…"
      onSettingsClick={onGoToSettings}
    >
      {privacyMode === "private" && isConnected && tab !== "getpaid" && tab !== "home" && (
        <NewPaymentBanner onOpenInbox={() => onSelectTab("getpaid")} />
      )}
      {showPayWorkspaceChrome ? (
        <PayWorkspaceChrome
          tab={tab}
          onSelectTab={(next) => onSelectTab(next)}
          unreadCount={unreadCount}
          onSetupSmart={onSetupSmart}
        />
      ) : null}
      {children}
    </HarmonyAppShell>
  );
}

const VALID_PAY_TABS: Tab[] = ["home", "pay", "getpaid", "automations", "activity"];

const PayPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const legacyParams = new URLSearchParams(location.search);
  const legacyTab = legacyParams.get("tab");
  if (legacyTab === "settings") {
    const section = mapPaySettingsSubToSection(legacyParams.get("sub"));
    return <Navigate to={`/settings?section=${section}`} replace />;
  }
  if (legacyTab === "contacts") {
    return <Navigate to="/settings?section=contacts" replace />;
  }
  if (legacyTab === "advanced") {
    return <Navigate to="/settings?section=legacy" replace />;
  }

  const { isConnected } = useAccount();
  const inbox = useStealthInbox();
  const onboarding = useOnboardingState();

  // Initial URL parse → top tab + sub tab
  const initial = (() => {
    if (typeof window === "undefined") return { tab: "home" as Tab, sub: null as string | null };
    try {
      const params = new URLSearchParams(window.location.search);
      const t = params.get("tab");
      const s = params.get("sub");
      // Deep-link short-circuits
      if (params.get("claim") || params.get("invoice")) return { tab: "getpaid" as Tab, sub: "inbox" };
      // Map legacy tab names to new IA tabs
      if (t === "send") return { tab: "pay" as Tab, sub: s ?? "send" };
      if (t === "receive") return { tab: "getpaid" as Tab, sub: s ?? "inbox" };
      if (t === "escrow") return { tab: "automations" as Tab, sub: s ?? "escrows" };
      if (t === "streams") return { tab: "automations" as Tab, sub: s ?? "streams" };
      if (t === "receivables") return { tab: "automations" as Tab, sub: s ?? "subscriptions" };
      if (t === "insurance") return { tab: "automations" as Tab, sub: s ?? "subscriptions" };
      if (t && VALID_PAY_TABS.includes(t as Tab)) return { tab: t as Tab, sub: s };
    } catch { /* ignore */ }
    return { tab: "home" as Tab, sub: null };
  })();

  const [tab, setTabState] = useState<Tab>(initial.tab);

  // Per-tab sub-navigation state (workspace inside the tab)
  type PaySub = "send" | "convert" | "bridge";
  type GetPaidSub = "inbox" | "setup" | "request" | "inbound";
  type AutoSub = "streams" | "escrows" | "subscriptions" | "payroll";

  const [paySub, setPaySub] = useState<PaySub>(
    initial.tab === "pay" && (initial.sub === "send" || initial.sub === "convert" || initial.sub === "bridge")
      ? (initial.sub as PaySub)
      : "send",
  );
  const [getPaidSub, setGetPaidSub] = useState<GetPaidSub>(() => {
    if (initial.tab === "getpaid" && (initial.sub === "inbox" || initial.sub === "setup" || initial.sub === "request" || initial.sub === "inbound")) {
      return initial.sub as GetPaidSub;
    }
    // Smart default: stealth-registered users land on inbox, others on setup
    return onboarding.isStealthRegistered ? "inbox" : "setup";
  });
  const [autoSub, setAutoSub] = useState<AutoSub>(
    initial.tab === "automations" && (initial.sub === "streams" || initial.sub === "escrows" || initial.sub === "subscriptions" || initial.sub === "payroll")
      ? (initial.sub as AutoSub)
      : "streams",
  );
  // Sync URL when tab/sub changes (preserves deep links)
  const writeUrl = (nextTab: Tab, nextSub?: string | null) => {
    if (typeof window === "undefined") return;
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("tab", nextTab);
      if (nextSub) params.set("sub", nextSub); else params.delete("sub");
      const newUrl = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
      window.history.replaceState({}, "", newUrl);
    } catch { /* ignore */ }
  };

  const setTab = (next: Tab) => {
    setTabState(next);
    const sub =
      next === "pay" ? paySub :
      next === "getpaid" ? getPaidSub :
      next === "automations" ? autoSub : null;
    writeUrl(next, sub);
  };

  const [streamRefreshKey, setStreamRefreshKey] = useState(0);
  const refreshStreams = () => setStreamRefreshKey((k) => k + 1);

  // Sub-nav change handlers (with URL sync)
  const onPaySub = (next: PaySub) => { setPaySub(next); writeUrl("pay", next); };
  const onGetPaidSub = (next: GetPaidSub) => { setGetPaidSub(next); writeUrl("getpaid", next); };

  // Auto-switch to inbox the first time stealth registration is confirmed
  const prevStealthRegisteredRef = useRef(onboarding.isStealthRegistered);
  useEffect(() => {
    const was = prevStealthRegisteredRef.current;
    prevStealthRegisteredRef.current = onboarding.isStealthRegistered;
    if (!was && onboarding.isStealthRegistered && !onboarding.stealthLoading) {
      setGetPaidSub("inbox");
    }
  }, [onboarding.isStealthRegistered, onboarding.stealthLoading]);
  const onAutoSub = (next: AutoSub) => { setAutoSub(next); writeUrl("automations", next); };

  // W5P1.9: automations create-flow drawer state (right-side slide-in)
  const [autoDrawer, setAutoDrawer] = useState<AutoSub | null>(null);
  const closeAutoDrawer = () => setAutoDrawer(null);
  const closeAndRefreshStreams = () => { setAutoDrawer(null); refreshStreams(); };

  const routeRef = useRef({ tab, paySub, getPaidSub, autoSub });
  routeRef.current = { tab, paySub, getPaidSub, autoSub };

  const buildPayReturnPath = useCallback(() => {
    const { tab: t, paySub: ps, getPaidSub: gps, autoSub: aus } = routeRef.current;
    const params = new URLSearchParams();
    params.set("tab", t);
    if (t === "pay") params.set("sub", ps);
    else if (t === "getpaid") params.set("sub", gps);
    else if (t === "automations") params.set("sub", aus);
    return `/pay?${params.toString()}`;
  }, []);

  const rememberSettingsReturn = useCallback(() => {
    try {
      sessionStorage.setItem(SETTINGS_RETURN_KEY, buildPayReturnPath());
    } catch {
      /* ignore */
    }
  }, [buildPayReturnPath]);

  const goToSettings = useCallback(() => {
    rememberSettingsReturn();
    navigate("/settings");
  }, [navigate, rememberSettingsReturn]);

  const openSmartAccountSettings = useCallback(() => {
    rememberSettingsReturn();
    navigate("/settings?section=wallet");
  }, [navigate, rememberSettingsReturn]);

  const applyRouteTarget = useCallback(
    (target: PayRouteTarget) => {
      if (target.openGlobalSettingsWallet) {
        rememberSettingsReturn();
        navigate("/settings?section=wallet");
        return;
      }
      setTabState(target.tab);
      if (target.tab === "pay" && target.sub) {
        setPaySub(target.sub as PaySub);
      } else if (target.tab === "getpaid" && target.sub) {
        setGetPaidSub(target.sub as GetPaidSub);
      } else if (target.tab === "automations" && target.sub) {
        setAutoSub(target.sub as AutoSub);
      }
      writeUrl(target.tab, target.sub);
    },
    [rememberSettingsReturn, navigate],
  );

  function PayPrivacyModeNavigationBridge() {
    const { privacyMode, setPrivacyMode, registerPrivacyModeNavigation, isSmartAvailable } =
      usePaymentMode();

    useEffect(() => {
      registerPrivacyModeNavigation((mode) => {
        const target = resolvePayRouteForPrivacyMode(mode, routeRef.current, { isSmartAvailable });
        applyRouteTarget(target);
      });
      return () => registerPrivacyModeNavigation(null);
    }, [registerPrivacyModeNavigation, isSmartAvailable, applyRouteTarget]);

    useEffect(() => {
      const route = routeRef.current;
      if (privacyMode === "public" && route.tab === "pay" && route.paySub === "convert") {
        setPrivacyMode("private");
        return;
      }
      if (isPayRouteValidForMode(privacyMode, route)) return;
      const target = resolvePayRouteForPrivacyMode(privacyMode, route, { isSmartAvailable });
      applyRouteTarget(target);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps -- align deep link once on mount

    return null;
  }

  const renderActiveSection = () => {
    switch (tab) {
      case "home":
        return (
          <PayOverviewPremium
            onNavigate={(t) => {
              if (t === "settings") {
                goToSettings();
                return;
              }
              setTab(t as Tab);
            }}
          />
        );

      case "pay": {
        if (!isConnected) {
          return <PayTabNotConnected tab="pay" message="Connect your wallet to send private payments." />;
        }
        return <PaySendWorkspace paySub={paySub} onPaySub={onPaySub} />;
      }

      case "getpaid": {
        if (!isConnected) {
          return <PayTabNotConnected tab="getpaid" message="Connect your wallet to set up private receiving and claim payments." />;
        }
        let claimId: string | null = null;
        let invoiceId: string | null = null;
        let contractParam: string | null = null;
        if (typeof window !== "undefined") {
          try {
            const params = new URLSearchParams(window.location.search);
            const c = params.get("claim");
            if (c && /^\d+$/.test(c)) claimId = c;
            const inv = params.get("invoice");
            if (inv && /^\d+$/.test(inv)) invoiceId = inv;
            contractParam = params.get("contract");
          } catch { /* ignore */ }
        }
        return (
          <PayHarmonyTabShell tab="getpaid" hideIntro>
            <ModeAwareGetPaid>
              <HarmonySubNav<GetPaidSub>
                value={getPaidSub}
                onChange={onGetPaidSub}
                items={[
                  { key: "inbox", label: "Inbox", icon: Inbox, badge: inbox.unreadCount > 0 ? inbox.unreadCount : undefined },
                  { key: "setup", label: "Setup", icon: KeyRound },
                  { key: "request", label: "Request", icon: FileText },
                  { key: "inbound", label: "Inbound streams", icon: Mail },
                ]}
              />
              {getPaidSub === "inbox" && (
                <>
                  {invoiceId && <InvoicePayCard invoiceId={invoiceId} contractParam={contractParam} />}
                  {claimId && <ClaimEscrowCard claimId={claimId} contractParam={contractParam} />}
                  <HarmonyFormCard title="Private inbox" eyebrow="Incoming · Claim" noPadding>
                    <StealthInboxV2 />
                  </HarmonyFormCard>
                  {!claimId && (
                    <PayHarmonyPanelCard title="Claim a protected payment" eyebrow="By escrow ID">
                      <OcUSDCEscrowActions />
                    </PayHarmonyPanelCard>
                  )}
                </>
              )}
              {getPaidSub === "setup" && (
                <>
                  <PayHarmonyPanelCard title="Set up private receiving" eyebrow="Private receive address">
                    <RegisterMetaAddressForm />
                  </PayHarmonyPanelCard>
                  <HarmonySection title="How receiving works" hint="End-to-end flow">
                    <div className="rounded-2xl hairline bg-card p-6">
                      <SectionDiagram flow="receive" />
                    </div>
                  </HarmonySection>
                </>
              )}
              {getPaidSub === "request" && (
                <PayHarmonyPanelCard title="Request a payment" eyebrow="Invoice">
                  <InvoiceForm />
                </PayHarmonyPanelCard>
              )}
              {getPaidSub === "inbound" && (
                <PayHarmonyPanelCard title="Payments streaming to you" eyebrow="Inbound streams">
                  <StreamList mode="recipient" />
                </PayHarmonyPanelCard>
              )}
            </ModeAwareGetPaid>
          </PayHarmonyTabShell>
        );
      }

      case "automations": {
        if (!isConnected) {
          return <PayTabNotConnected tab="automations" message="Connect your wallet to create streams, escrows, and subscriptions." />;
        }
        return (
          <PayHarmonyTabShell tab="automations" hideIntro>
            <ModeAwareAutomations>
            <HarmonySubNav<AutoSub>
              value={autoSub}
              onChange={onAutoSub}
              items={[
                { key: "streams", label: "Streams", icon: Repeat2 },
                { key: "escrows", label: "Escrows", icon: ShieldCheck },
                { key: "subscriptions", label: "Subscriptions", icon: CalendarClock },
                { key: "payroll", label: "Payroll", icon: Users },
              ]}
            />

            {/* Streams workspace — summary + list; "+ New" opens drawer */}
            {autoSub === "streams" && (
              <div className="space-y-5">
                <HarmonyWorkspaceHeader
                  eyebrow="Automations"
                  title="Continuous streams"
                  description="Pay salaries, retainers, and grants per-second. Amounts stay encrypted on-chain."
                  cta={{ label: "New stream", icon: Plus, onClick: () => setAutoDrawer("streams") }}
                />
                <div className="harmony-form-inner rounded-2xl hairline bg-card p-6">
                  <StreamsDashboard
                    onNavigate={(t) => setTab(t as Tab)}
                    refreshKey={streamRefreshKey}
                    onRefresh={refreshStreams}
                  />
                </div>
              </div>
            )}

            {/* Escrows workspace — list-first; "+ New" opens drawer */}
            {autoSub === "escrows" && (
              <div className="space-y-5">
                <HarmonyWorkspaceHeader
                  eyebrow="Automations"
                  title="Protected escrows"
                  description="Lock funds until a condition is met. Refund window keeps funds recoverable."
                  cta={{ label: "New escrow", icon: Plus, onClick: () => setAutoDrawer("escrows") }}
                />
                <div className="rounded-2xl hairline bg-card p-6">
                  <MyEscrows />
                </div>
              </div>
            )}

            {/* Subscriptions workspace */}
            {autoSub === "subscriptions" && (
              <div className="space-y-5">
                <HarmonyWorkspaceHeader
                  eyebrow="Automations"
                  title="Recurring subscriptions"
                  description="Bill or pay on a regular cadence. Amount and recipients are encrypted."
                  cta={{ label: "New subscription", icon: Plus, onClick: () => setAutoDrawer("subscriptions") }}
                />
                <ReceivablesHub onNavigate={(t) => setTab(t as Tab)} />
              </div>
            )}

            {/* Payroll workspace */}
            {autoSub === "payroll" && (
              <div className="space-y-5">
                <HarmonyWorkspaceHeader
                  eyebrow="Automations · Advanced"
                  title="Batch payroll"
                  description="Send to many recipients in a single resolver-gated batch. Amounts encrypted per row."
                  cta={{ label: "New batch", icon: Plus, onClick: () => setAutoDrawer("payroll") }}
                />
                <HarmonyMetricRow
                  items={[
                    { label: "Active resolvers", value: "—" },
                    { label: "Last batch", value: "—" },
                  ]}
                />
                <details className="rounded-2xl hairline bg-card">
                  <summary className="cursor-pointer list-none px-6 py-4 text-sm font-medium text-foreground">
                    Manage resolvers
                    <span className="ml-2 text-xs text-muted-foreground">
                      (configure payroll authorizers)
                    </span>
                  </summary>
                  <div className="border-t border-border px-6 py-5">
                    <ResolverManager />
                  </div>
                </details>
              </div>
            )}

            {/* Drawer: stream creation */}
            <HarmonyDrawer
              open={autoDrawer === "streams"}
              onClose={closeAutoDrawer}
              eyebrow="New automation"
              title="Create a continuous stream"
              width="md"
            >
              <CreateStreamFormV2 onCreated={closeAndRefreshStreams} />
            </HarmonyDrawer>

            {/* Drawer: escrow creation */}
            <HarmonyDrawer
              open={autoDrawer === "escrows"}
              onClose={closeAutoDrawer}
              eyebrow="New automation"
              title="Create a protected escrow"
              width="md"
            >
              <OcUSDCEscrowForm />
            </HarmonyDrawer>

            {/* Drawer: subscription creation */}
            <HarmonyDrawer
              open={autoDrawer === "subscriptions"}
              onClose={closeAutoDrawer}
              eyebrow="New automation"
              title="Create a recurring subscription"
              width="md"
            >
              <SubscriptionForm onCreated={closeAndRefreshStreams} />
            </HarmonyDrawer>

            {/* Drawer: payroll batch */}
            <HarmonyDrawer
              open={autoDrawer === "payroll"}
              onClose={closeAutoDrawer}
              eyebrow="New automation · Advanced"
              title="Create a batch payroll"
              width="lg"
            >
              <BatchEscrowForm />
            </HarmonyDrawer>
            </ModeAwareAutomations>
          </PayHarmonyTabShell>
        );
      }

      case "activity":
        return <ModeAwareActivity />;
    }
  };

  return (
    <PaymentModeProvider>
      <PayPrivacyModeNavigationBridge />
      <ModeAwarePayShell
        tab={tab}
        unreadCount={inbox.unreadCount ?? 0}
        isConnected={isConnected}
        onSelectTab={setTab}
        onGoToSettings={goToSettings}
        onSetupSmart={openSmartAccountSettings}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderActiveSection()}
          </motion.div>
        </AnimatePresence>
      </ModeAwarePayShell>
    </PaymentModeProvider>
  );
};

export default PayPage;
