import type { LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  Banknote,
  Bell,
  Coins,
  Eye,
  EyeOff,
  Fingerprint,
  Home,
  Landmark,
  PanelLeft,
  PanelLeftClose,
  Search,
  Settings,
} from "lucide-react";
import { useAccount } from "wagmi";
import NavRightSlot from "@/components/elite/NavRightSlot";
import { cn } from "@/lib/utils";
import ObscuraLogo from "@/components/brand/ObscuraLogo";
import { PoweredByFhenix } from "@/components/brand/PoweredByFhenix";
import { useValuesReveal } from "@/contexts/ValuesRevealContext";

export type HarmonySidebarItem = {
  key: string;
  label: string;
  badge?: string;
  icon?: LucideIcon;
  mobileLabel?: string;
  active?: boolean;
  onClick?: () => void;
  href?: string;
};

const SIDEBAR_COLLAPSED_KEY = "obscura-sidebar-collapsed";

const OS_APPS = [
  { to: "/home", label: "Home", icon: Home, match: (p: string) => p === "/home" || p === "/" },
  { to: "/pay", label: "Pay", icon: Banknote, match: (p: string) => p.startsWith("/pay") },
  { to: "/credit", label: "Credit", icon: Coins, match: (p: string) => p.startsWith("/credit") },
  { to: "/vote", label: "Vote", icon: Landmark, match: (p: string) => p.startsWith("/vote") },
  { to: "/identity", label: "Identity", icon: Fingerprint, match: (p: string) => p.startsWith("/identity") },
] as const;

function SidebarNavItem({
  active,
  children,
  className,
  to,
  onClick,
  collapsed,
  title,
  ...rest
}: {
  active?: boolean;
  children: React.ReactNode;
  className?: string;
  to?: string;
  onClick?: () => void;
  collapsed?: boolean;
  title?: string;
}) {
  const cls = cn("dash-nav-item w-full text-left", collapsed && "dash-nav-item--collapsed", className);

  if (to) {
    return (
      <Link
        to={to}
        className={cls}
        data-active={active || undefined}
        title={collapsed ? title : undefined}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      data-active={active || undefined}
      onClick={onClick}
      title={collapsed ? title : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}

export function HarmonyAppShell({
  sidebar,
  children,
  searchPlaceholder,
  onSettingsClick,
}: {
  sidebar?: HarmonySidebarItem[];
  children: React.ReactNode;
  searchPlaceholder?: string;
  onSettingsClick?: () => void;
}) {
  const { pathname } = useLocation();
  const { revealed: valuesRevealed, toggle: toggleValuesReveal } = useValuesReveal();
  const search = searchPlaceholder ?? "Search payments, proposals, positions…";
  const settingsActive = pathname.startsWith("/settings") || pathname.startsWith("/pay/settings");
  const { address, isConnected } = useAccount();
  const shortAddress = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const mobileNav = sidebar ?? [];
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((current) => {
      const next = !current;
      window.localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--dash-sidebar-current-w",
      sidebarCollapsed ? "var(--dash-sidebar-w-collapsed)" : "var(--dash-sidebar-w)",
    );
  }, [sidebarCollapsed]);

  return (
    <div
      className={cn(
        "obscura-app dash-premium isolate flex min-h-screen dash-shell-bg text-foreground",
        mobileNav.length > 0 && "dash-has-mobile-nav",
      )}
    >
      <aside
        className={cn(
          "dash-sidebar hidden shrink-0 flex-col lg:flex",
          sidebarCollapsed && "is-collapsed",
        )}
        aria-label="Main navigation"
        aria-expanded={!sidebarCollapsed}
      >
        <div className="dash-sidebar-brand">
          <Link to="/" className="dash-sidebar-brand-link" aria-label="Obscura landing page">
            <ObscuraLogo size="sm" tone="light" showWordmark={!sidebarCollapsed} />
          </Link>
          {!sidebarCollapsed ? (
            <span className="dash-sidebar-tagline">Private finance OS</span>
          ) : null}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden py-3">
          {!sidebarCollapsed ? (
            <p className="dash-sidebar-section-label">Operating system</p>
          ) : null}
          <nav className="dash-sidebar-nav" aria-label="Apps">
            {OS_APPS.map(({ to, label, icon: Icon, match }) => {
              const active = match(pathname);
              return (
                <SidebarNavItem
                  key={to}
                  to={to}
                  active={active}
                  collapsed={sidebarCollapsed}
                  title={label}
                >
                  <span className="dash-nav-icon-wrap" aria-hidden>
                    <Icon className="h-4 w-4" />
                  </span>
                  {!sidebarCollapsed ? <span className="dash-nav-label">{label}</span> : null}
                  {!sidebarCollapsed && active ? (
                    <span className="dash-nav-active-pip ml-auto" aria-hidden />
                  ) : null}
                </SidebarNavItem>
              );
            })}
          </nav>

          {!sidebarCollapsed ? <p className="dash-sidebar-section-label">Utility</p> : null}
          <nav className="dash-sidebar-nav dash-sidebar-nav--utility" aria-label="Utility">
            {onSettingsClick ? (
              <SidebarNavItem
                active={settingsActive}
                onClick={onSettingsClick}
                collapsed={sidebarCollapsed}
                title="Settings"
              >
                <span className="dash-nav-icon-wrap" aria-hidden>
                  <Settings className="h-4 w-4" />
                </span>
                {!sidebarCollapsed ? <span className="dash-nav-label">Settings</span> : null}
                {!sidebarCollapsed && settingsActive ? (
                  <span className="dash-nav-active-pip ml-auto" aria-hidden />
                ) : null}
              </SidebarNavItem>
            ) : (
              <SidebarNavItem
                to="/settings"
                active={settingsActive}
                collapsed={sidebarCollapsed}
                title="Settings"
              >
                <span className="dash-nav-icon-wrap" aria-hidden>
                  <Settings className="h-4 w-4" />
                </span>
                {!sidebarCollapsed ? <span className="dash-nav-label">Settings</span> : null}
                {!sidebarCollapsed && settingsActive ? (
                  <span className="dash-nav-active-pip ml-auto" aria-hidden />
                ) : null}
              </SidebarNavItem>
            )}
          </nav>
        </div>

        <div className="dash-sidebar-footer">
          <PoweredByFhenix variant="app" compact={sidebarCollapsed} className={sidebarCollapsed ? "mx-auto" : undefined} />
          {!sidebarCollapsed && isConnected && address ? (
            <div className="dash-wallet-card">
              <div className="flex items-center gap-2">
                <span className="dash-wallet-pulse" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Connected
                </span>
              </div>
              <p className="mt-1.5 font-mono text-sm text-foreground">{shortAddress}</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Arb Sepolia · Testnet</p>
            </div>
          ) : null}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="dash-topbar relative z-30 flex shrink-0 items-center gap-3 px-4 md:gap-4 md:px-6 lg:px-8">
          <button
            type="button"
            onClick={toggleSidebar}
            className="dash-sidebar-toggle hidden h-9 w-9 shrink-0 place-items-center lg:grid"
            aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-pressed={!sidebarCollapsed}
          >
            {sidebarCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>

          <Link to="/" className="shrink-0 lg:hidden" aria-label="Obscura landing page">
            <ObscuraLogo showWordmark={false} size="sm" tone="light" />
          </Link>

          <label className="dash-search hidden min-w-0 flex-1 min-[420px]:flex">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden />
            <input readOnly placeholder={search} aria-label={search} />
            <kbd className="dash-kbd hidden sm:inline">⌘K</kbd>
          </label>

          <div className="dash-topbar-actions ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleValuesReveal}
              className={cn(
                "inline-flex h-9 shrink-0 items-center justify-center gap-1.5",
                "w-9 px-0 sm:w-auto sm:px-3",
                valuesRevealed ? "dash-btn-primary" : "dash-btn-outline",
              )}
              aria-label={valuesRevealed ? "Encrypt all values" : "Decrypt all values"}
              aria-pressed={valuesRevealed}
            >
              {valuesRevealed ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {valuesRevealed ? "Encrypt values" : "Decrypt values"}
              </span>
            </button>
            <button
              type="button"
              className="relative hidden h-9 w-9 place-items-center rounded-full border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground sm:grid"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <div className="app-wallet-slot">
              <NavRightSlot tone="light" />
            </div>
          </div>
        </header>

        <div className="dash-mobile-os-nav flex border-b border-border px-3 py-2 lg:hidden">
          <div className="flex w-full gap-1 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {OS_APPS.map(({ to, label, match }) => {
              const active = match(pathname);
              return (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    "dash-subnav-chip inline-flex shrink-0 items-center rounded-full px-3 py-1.5 text-xs font-medium",
                    active && "is-active",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>

        <main
          className={cn(
            "relative z-10 mx-auto w-full max-w-[1320px] flex-1 px-4 py-5 md:px-8 md:py-10",
            mobileNav.length > 0
              ? "pb-[calc(7rem+env(safe-area-inset-bottom,0px))] md:pb-16"
              : "pb-6 md:pb-10",
            "lg:pb-14",
          )}
        >
          {children}
        </main>

        {mobileNav.length > 0 ? (
          <nav
            className="dash-mobile-nav fixed bottom-0 left-0 right-0 z-40 flex items-stretch md:hidden"
            aria-label="Section navigation"
          >
            {mobileNav.map((item) => {
              const Icon = item.icon;
              const mobileLabel = item.mobileLabel ?? item.label;
              const inner = (
                <div className="flex min-w-0 flex-col items-center gap-0.5">
                  <span className="dash-mobile-icon flex h-7 w-7 items-center justify-center rounded-full transition-colors">
                    {Icon ? (
                      <Icon
                        className={cn(
                          "h-3.5 w-3.5",
                          item.active ? "text-foreground" : "text-muted-foreground/60",
                        )}
                      />
                    ) : (
                      <span
                        className={cn(
                          "text-[10px] font-medium",
                          item.active ? "text-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        {item.label.slice(0, 2)}
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      "max-w-full truncate px-0.5 text-[9px] font-medium uppercase tracking-[0.12em] sm:text-[10px]",
                      item.active ? "text-foreground" : "text-muted-foreground/60",
                    )}
                  >
                    {mobileLabel}
                  </span>
                </div>
              );
              const btnClass =
                "relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 py-2 text-center transition-colors";
              if (item.href) {
                return (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={btnClass}
                    data-active={item.active || undefined}
                    aria-label={item.label}
                    aria-current={item.active ? "page" : undefined}
                  >
                    {inner}
                  </Link>
                );
              }
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  className={btnClass}
                  data-active={item.active || undefined}
                  aria-label={item.label}
                  aria-current={item.active ? "page" : undefined}
                >
                  {inner}
                </button>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
