import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { HarmonyAppShell } from "@/components/harmony/HarmonyAppShell";
import {
  IdentityWorkspaceChrome,
  IDENTITY_TABS,
  type IdentityWorkspaceTab,
} from "@/components/harmony/IdentityWorkspaceChrome";
import { ActivityFeed } from "@/components/harmony/ActivityFeed";
import { CreditReputationPanel } from "@/components/credit/CreditReputationPanel";
import { HarmonyFormCard } from "@/components/harmony/harmony-ui";

const IDENTITY_TAB_KEYS: IdentityWorkspaceTab[] = ["reputation", "activity", "contacts"];

function parseIdentityTab(raw: string | null): IdentityWorkspaceTab {
  if (raw && IDENTITY_TAB_KEYS.includes(raw as IdentityWorkspaceTab)) {
    return raw as IdentityWorkspaceTab;
  }
  return "reputation";
}

const IdentityPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = parseIdentityTab(searchParams.get("tab"));

  const setTab = useCallback(
    (next: IdentityWorkspaceTab) => {
      setSearchParams(
        (prev) => {
          const params = new URLSearchParams(prev);
          if (next === "reputation") params.delete("tab");
          else params.set("tab", next);
          return params;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const harmonySidebar = IDENTITY_TABS.map((item) => ({
    key: item.key,
    label: item.label,
    mobileLabel: item.label,
    icon: item.icon,
    active: tab === item.key,
    onClick: () => setTab(item.key),
  }));

  return (
    <HarmonyAppShell
      sidebar={harmonySidebar}
      searchPlaceholder="Search payments, proposals, positions…"
    >
      <IdentityWorkspaceChrome tab={tab} onSelectTab={setTab} />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          {tab === "reputation" && (
            <div className="space-y-6">
              <CreditReputationPanel />
              <p className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
                Steady unlocks +4% effective LLTV across every Credit borrow. Governance participation and Pay reliability raise your tier without exposing raw activity.
              </p>
            </div>
          )}

          {tab === "activity" && (
            <ActivityFeed
              defaultFilter="all"
              filters={["all", "pay", "credit", "vote"]}
              title="Cross-product activity"
              eyebrow="Indexed from chain · amounts sealed"
              emptyMessage="No indexed activity for this wallet yet. Pay, Credit, and Govern events will appear here without exposing encrypted amounts."
            />
          )}

          {tab === "contacts" && (
            <HarmonyFormCard title="Private contacts" eyebrow="Address book">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Manage labeled addresses for encrypted sends. Contacts stay local to this browser and never publish your payment graph on-chain.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/settings?section=contacts" className="dash-btn-primary h-9 px-3 text-xs">
                  Open contacts
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
                <Link to="/pay/contacts" className="dash-btn-outline h-9 px-3 text-xs">
                  Full address book
                </Link>
              </div>
            </HarmonyFormCard>
          )}
        </motion.div>
      </AnimatePresence>
    </HarmonyAppShell>
  );
};

export default IdentityPage;
