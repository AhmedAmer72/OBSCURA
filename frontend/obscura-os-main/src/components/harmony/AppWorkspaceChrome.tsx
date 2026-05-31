import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppWorkspaceTabs, type WorkspaceTabItem } from "@/components/harmony/AppWorkspaceTabs";

export type WorkspaceTab<T extends string = string> = WorkspaceTabItem<T>;

export function AppWorkspaceChrome<T extends string>({
  eyebrow,
  title,
  description,
  tabs,
  tab,
  onSelectTab,
  actions,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  tabs?: WorkspaceTab<T>[];
  tab?: T;
  onSelectTab?: (tab: T) => void;
  actions?: ReactNode;
  className?: string;
}) {
  const mainTab = tabs?.some((t) => t.key === tab) ? tab : null;

  return (
    <header className={cn("app-workspace-chrome mb-6 md:mb-8", className)}>
      <p className="dash-eyebrow text-[10px] tracking-[0.24em]">{eyebrow}</p>
      <div className="mt-2 flex flex-col gap-3 sm:mt-3 sm:gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl min-w-0">
          <h1 className="dash-hero-title text-[1.625rem] text-foreground sm:text-3xl sm:text-[2.125rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="app-workspace-chrome__actions shrink-0">{actions}</div> : null}
      </div>

      {tabs && tabs.length > 0 && onSelectTab ? (
        <AppWorkspaceTabs
          className="mt-6"
          ariaLabel={`${eyebrow} sections`}
          value={mainTab}
          onChange={onSelectTab}
          items={tabs}
        />
      ) : null}
    </header>
  );
}
