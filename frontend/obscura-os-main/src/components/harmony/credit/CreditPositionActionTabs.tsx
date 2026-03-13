import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppWorkspaceTabsSlot } from "@/components/harmony/AppWorkspaceTabs";

export function CreditPositionActionTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T | null;
  onChange: (next: T | null) => void;
  items: { key: T; label: string; icon: ReactNode }[];
  className?: string;
}) {
  return (
    <AppWorkspaceTabsSlot className={cn("w-full", className)} ariaLabel="Position actions" variant="sub">
      {items.map((item) => {
        const active = value === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(active ? null : item.key)}
            className={cn(
              "app-workspace-tab min-w-0 justify-center",
              active && "app-workspace-tab-active",
            )}
            aria-current={active ? "page" : undefined}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </AppWorkspaceTabsSlot>
  );
}
