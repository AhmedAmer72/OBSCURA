/**
 * SettingsPage — unified app settings with workspace toolbar navigation.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAccount } from "wagmi";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  BookUser,
  Database,
  KeyRound,
  Shield,
  Wrench,
} from "lucide-react";
import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";
import {
  SettingsContactsSection,
  SettingsDataCard,
  SettingsLegacyPanel,
  SettingsNotificationsCard,
  SettingsPrivacyCard,
  SettingsPublicWalletNotice,
  SettingsWalletSection,
} from "@/components/settings/SettingsPanels";
import { PaymentModeProvider, usePaymentMode } from "@/contexts/PaymentModeContext";
import {
  normalizeSettingsSectionForMode,
  parseSettingsSectionParam,
  PUBLIC_SETTINGS_SECTIONS,
  SETTINGS_RETURN_KEY,
  type SettingsSection,
} from "@/lib/settingsNavigation";

const PRIVATE_SECTIONS: { key: SettingsSection; label: string; icon: typeof Bell }[] = [
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "privacy", label: "Privacy", icon: Shield },
  { key: "wallet", label: "Passkey", icon: KeyRound },
  { key: "contacts", label: "Contacts", icon: BookUser },
  { key: "data", label: "Data", icon: Database },
  { key: "legacy", label: "Advanced", icon: Wrench },
];

const PUBLIC_SECTIONS = PRIVATE_SECTIONS.filter((s) =>
  PUBLIC_SETTINGS_SECTIONS.includes(s.key),
);

function SettingsPageContent() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isConnected } = useAccount();
  const { privacyMode } = usePaymentMode();
  const isPublicMode = privacyMode === "public";

  const tabItems = isPublicMode ? PUBLIC_SECTIONS : PRIVATE_SECTIONS;

  const initialSection = useMemo(() => {
    const parsed = parseSettingsSectionParam(
      searchParams.get("section"),
      searchParams.get("sub"),
    );
    return normalizeSettingsSectionForMode(parsed ?? "notifications", privacyMode);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- seed once from URL

  const [section, setSection] = useState<SettingsSection>(initialSection);
  const [returnPath, setReturnPath] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SETTINGS_RETURN_KEY);
      if (stored && stored.startsWith("/pay")) setReturnPath(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const syncSection = useCallback(
    (next: SettingsSection) => {
      const effective = normalizeSettingsSectionForMode(next, privacyMode);
      setSection(effective);
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          params.set("section", effective);
          params.delete("sub");
          return params;
        },
        { replace: true },
      );
    },
    [privacyMode, setSearchParams],
  );

  useEffect(() => {
    const parsed = parseSettingsSectionParam(
      searchParams.get("section"),
      searchParams.get("sub"),
    );
    if (!parsed) return;
    const effective = normalizeSettingsSectionForMode(parsed, privacyMode);
    if (effective !== section) setSection(effective);
  }, [searchParams, privacyMode, section]);

  useEffect(() => {
    const effective = normalizeSettingsSectionForMode(section, privacyMode);
    if (effective !== section) syncSection(effective);
  }, [privacyMode, section, syncSection]);

  const openSmartAccountFromBar = useCallback(() => {
    syncSection("wallet");
  }, [syncSection]);

  const backToPay = useCallback(() => {
    const target = returnPath ?? "/pay?tab=home";
    try {
      sessionStorage.removeItem(SETTINGS_RETURN_KEY);
    } catch {
      /* ignore */
    }
    navigate(target);
  }, [navigate, returnPath]);

  const backLabel = returnPath?.includes("tab=pay")
    ? "Back to Send"
    : returnPath?.includes("tab=getpaid")
      ? "Back to Receive"
      : returnPath?.includes("tab=automations")
        ? "Back to Automate"
        : returnPath?.includes("tab=activity")
          ? "Back to Activity"
          : "Back to Pay";

  return (
    <HarmonyAppShell searchPlaceholder="Search payments, proposals, positions…">
      <AppWorkspaceChrome
        eyebrow="Obscura · Settings"
        title="Settings & security."
        description="Notifications, privacy, passkey, contacts, and local data — unified across Pay and the app."
        tabs={tabItems}
        tab={section}
        onSelectTab={syncSection}
        actions={
          returnPath ? (
            <button
              type="button"
              onClick={backToPay}
              className="dash-btn-outline inline-flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {backLabel}
            </button>
          ) : null
        }
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 space-y-5"
        >
          {isPublicMode && section === "wallet" && <SettingsPublicWalletNotice />}
          {section === "notifications" && <SettingsNotificationsCard />}
          {section === "privacy" && <SettingsPrivacyCard />}
          {section === "wallet" && (
            <SettingsWalletSection onSetupSmart={openSmartAccountFromBar} />
          )}
          {section === "contacts" && <SettingsContactsSection />}
          {section === "data" && <SettingsDataCard />}
          {section === "legacy" && (
            <SettingsLegacyPanel isConnected={isConnected} onRefreshStreams={() => {}} />
          )}
        </motion.div>
      </AnimatePresence>

      <p className="mt-10 border-t border-border pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Obscura · Arbitrum Sepolia (Testnet) · Sealed by Fhenix FHE
      </p>
    </HarmonyAppShell>
  );
}

export default function SettingsPage() {
  return (
    <PaymentModeProvider>
      <SettingsPageContent />
    </PaymentModeProvider>
  );
}
