import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type WorkspaceTabItem<T extends string = string> = {
  key: T;
  label: string;
  icon?: LucideIcon;
  badge?: string | number;
};

/** Reference-style sub-navigation: rounded-lg surface bar, mint active pill. */
export function AppWorkspaceTabs<T extends string>({
  value,
  onChange,
  items,
  className,
  ariaLabel = "Sections",
  fullWidth = true,
  variant = "primary",
}: {
  value: T | null | undefined;
  onChange: (key: T) => void;
  items: WorkspaceTabItem<T>[];
  className?: string;
  ariaLabel?: string;
  fullWidth?: boolean;
  variant?: "primary" | "sub";
}) {
  return (
    <nav
      className={cn(
        "app-workspace-tabs",
        variant === "sub" && "app-workspace-tabs--sub",
        fullWidth && "w-full",
        className,
      )}
      aria-label={ariaLabel}
    >
      {items.map(({ key, label, icon: Icon, badge }) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn("app-workspace-tab min-w-0", active && "app-workspace-tab-active")}
            aria-current={active ? "page" : undefined}
          >
            {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
            {label}
            {badge !== undefined && Number(badge) > 0 ? (
              <span className="ml-1 rounded-full bg-[hsl(var(--dash-forest))] px-1.5 py-px text-[9px] font-medium text-[hsl(96_18%_97%)]">
                {badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function AppWorkspaceTabsSlot({
  children,
  className,
  fullWidth = true,
  ariaLabel,
  variant = "primary",
}: {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
  variant?: "primary" | "sub";
}) {
  return (
    <nav
      className={cn(
        "app-workspace-tabs",
        variant === "sub" && "app-workspace-tabs--sub",
        fullWidth && "w-full",
        className,
      )}
      aria-label={ariaLabel}
    >
      {children}
    </nav>
  );
}
