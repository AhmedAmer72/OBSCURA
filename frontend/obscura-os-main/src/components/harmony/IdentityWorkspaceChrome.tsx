import { Activity, BookUser, Sparkles } from "lucide-react";
import { AppWorkspaceChrome } from "@/components/harmony/AppWorkspaceChrome";

export type IdentityWorkspaceTab = "reputation" | "activity" | "contacts";

const IDENTITY_TABS = [
  { key: "reputation" as const, label: "Reputation", icon: Sparkles },
  { key: "activity" as const, label: "Activity", icon: Activity },
  { key: "contacts" as const, label: "Contacts", icon: BookUser },
];

export function IdentityWorkspaceChrome({
  tab,
  onSelectTab,
}: {
  tab: IdentityWorkspaceTab;
  onSelectTab: (tab: IdentityWorkspaceTab) => void;
}) {
  return (
    <AppWorkspaceChrome
      eyebrow="Obscura · Identity"
      title="Your sealed identity."
      description="One profile across Pay, Credit, and Govern. Reputation, history, and private contacts."
      tabs={IDENTITY_TABS}
      tab={tab}
      onSelectTab={onSelectTab}
    />
  );
}

export { IDENTITY_TABS };
