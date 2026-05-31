import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppWorkspaceTabsSlot } from "@/components/harmony/AppWorkspaceTabs";

/** Pill tabs for credit form modes (supply/withdraw, add/withdraw collateral, etc.) */
export function CreditFormSegmentTabs<T extends string>({
  value,
  onChange,
  items,
  className,
}: {
  value: T;
  onChange: (next: T) => void;
  items: { key: T; label: string }[];
  className?: string;
}) {
  return (
    <AppWorkspaceTabsSlot className={cn("w-full", className)} ariaLabel="Form mode" variant="sub">
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onChange(item.key)}
            className={cn("app-workspace-tab min-w-0 capitalize", active && "app-workspace-tab-active")}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </button>
        );
      })}
    </AppWorkspaceTabsSlot>
  );
}

export function CreditFormLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("dash-eyebrow text-[10px]", className)}>{children}</p>;
}

export function CreditFormSelect({
  value,
  onChange,
  children,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-11 w-full cursor-pointer appearance-none rounded-[var(--dash-radius-btn)] border border-border bg-card px-3 text-sm text-foreground transition-colors",
        "focus:border-[hsl(var(--dash-forest))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--dash-forest)/0.2)]",
        className,
      )}
    >
      {children}
    </select>
  );
}

export function CreditFormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "h-11 w-full rounded-[var(--dash-radius-btn)] border border-border bg-card px-3 text-sm text-foreground transition-colors",
        "placeholder:text-muted-foreground/50 focus:border-[hsl(var(--dash-forest))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--dash-forest)/0.2)]",
        className,
      )}
    />
  );
}

export function CreditFormSubmit({
  children,
  className,
  type = "button",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      {...props}
      className={cn("dash-btn-primary mt-1 w-full sm:w-auto", className)}
    >
      {children}
    </button>
  );
}

export function CreditFormHint({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[11px] leading-relaxed text-muted-foreground", className)}>{children}</p>;
}

export function CreditFormStatCard({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("ref-mini-card space-y-1", className)}>
      <p className="dash-eyebrow text-[9px]">{label}</p>
      {children}
    </div>
  );
}
