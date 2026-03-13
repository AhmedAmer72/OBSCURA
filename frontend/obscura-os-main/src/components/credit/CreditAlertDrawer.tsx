/**
 * CreditAlertDrawer — bell icon + slide-over panel listing alerts.
 *
 * Uses HarmonyDrawer + dash-premium styling so alerts match the Credit workspace.
 */
import {
  Bell,
  BellOff,
  CheckCheck,
  Droplet,
  Gavel,
  Info,
  ShieldAlert,
  Trash2,
  TrendingUp,
} from "lucide-react";
import { useState, type ElementType } from "react";
import { HarmonyDrawer } from "@/components/harmony/harmony-ui";
import { useCreditAlerts, type AlertCategory, type CreditAlert } from "@/hooks/useCreditAlerts";
import { cn } from "@/lib/utils";

type AlertPresentation = {
  icon: ElementType;
  iconWrap: string;
  badge: string;
  border: string;
};

function getAlertPresentation(alert: CreditAlert): AlertPresentation {
  if (alert.category === "liquidation") {
    if (alert.severity === "critical") {
      return {
        icon: ShieldAlert,
        iconWrap: "border-red-500/20 bg-red-500/8 text-red-600",
        badge: "border-red-500/20 bg-red-500/8 text-red-700",
        border: "border-red-500/15",
      };
    }
    return {
      icon: ShieldAlert,
      iconWrap: "border-amber-500/25 bg-amber-500/10 text-amber-700",
      badge: "border-amber-500/25 bg-amber-500/10 text-amber-800",
      border: "border-amber-500/20",
    };
  }

  const byCategory: Record<AlertCategory, AlertPresentation> = {
    liquidation: {
      icon: ShieldAlert,
      iconWrap: "border-amber-500/25 bg-amber-500/10 text-amber-700",
      badge: "border-amber-500/25 bg-amber-500/10 text-amber-800",
      border: "border-amber-500/20",
    },
    auction: {
      icon: Gavel,
      iconWrap: "border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.75)] text-[hsl(var(--dash-forest))]",
      badge: "border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.8)] text-[hsl(var(--dash-forest))]",
      border: "border-[hsl(var(--dash-forest)/0.12)]",
    },
    faucet: {
      icon: Droplet,
      iconWrap: "border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.75)] text-[hsl(var(--dash-forest))]",
      badge: "border-[hsl(var(--dash-forest)/0.18)] bg-[hsl(var(--dash-mint)/0.8)] text-[hsl(var(--dash-forest))]",
      border: "border-[hsl(var(--dash-forest)/0.12)]",
    },
    interest: {
      icon: TrendingUp,
      iconWrap: "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]",
      badge: "border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] text-[hsl(var(--success))]",
      border: "border-[hsl(var(--success)/0.18)]",
    },
    info: {
      icon: Info,
      iconWrap: "border-border bg-muted/50 text-muted-foreground",
      badge: "border-border bg-muted/50 text-muted-foreground",
      border: "border-border/70",
    },
  };

  return byCategory[alert.category];
}

function ago(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function CreditAlertDrawer() {
  const [open, setOpen] = useState(false);
  const { alerts, unreadCount, markAllRead, clear, permission, requestPermission } = useCreditAlerts();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="relative grid h-9 w-9 place-items-center rounded-[var(--dash-radius-btn)] border border-border bg-card text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label={`${unreadCount} unread alerts`}
      >
        <Bell className="h-3.5 w-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[hsl(var(--dash-forest))] px-1 text-[9px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <HarmonyDrawer
        open={open}
        onClose={() => setOpen(false)}
        eyebrow="Credit · Risk"
        title={unreadCount > 0 ? `Alerts (${unreadCount} new)` : "Alerts"}
        width="sm"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 border-b border-border/70 pb-4">
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="ref-ghost-action disabled:opacity-40"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark read
            </button>
            <button
              type="button"
              onClick={clear}
              disabled={alerts.length === 0}
              className="ref-ghost-action disabled:opacity-40"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Clear
            </button>
            <div className="ml-auto">
              {permission === "granted" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[hsl(var(--success)/0.25)] bg-[hsl(var(--success)/0.08)] px-2.5 py-1 text-[11px] font-medium text-[hsl(var(--success))]">
                  <Bell className="h-3 w-3" />
                  Browser notifications on
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => void requestPermission()}
                  className="ref-ghost-action"
                >
                  <BellOff className="h-3.5 w-3.5" />
                  Enable notifications
                </button>
              )}
            </div>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-2xl border border-[hsl(var(--dash-forest)/0.12)] bg-[hsl(var(--dash-mint)/0.45)] px-5 py-8 text-center">
              <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-[hsl(var(--dash-forest)/0.12)] bg-white/80 text-[hsl(var(--dash-forest))]">
                <BellOff className="h-4 w-4" />
              </span>
              <p className="mt-4 text-sm font-medium text-foreground">No alerts yet</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                You will be notified when your health factor or liquidation auctions need attention.
              </p>
            </div>
          ) : (
            <ul className="grid gap-3">
              {alerts.map((alert) => {
                const presentation = getAlertPresentation(alert);
                const Icon = presentation.icon;

                return (
                  <li
                    key={alert.id}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border bg-white/95 p-4 shadow-[0_1px_2px_hsl(var(--dash-forest)/0.08)]",
                      presentation.border,
                      alert.read ? "opacity-70" : "border-[hsl(var(--dash-forest)/0.18)]",
                    )}
                  >
                    {!alert.read ? (
                      <span
                        className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-[hsl(var(--dash-forest))]"
                        aria-hidden
                      />
                    ) : null}

                    <div className="flex items-start gap-3 pl-1">
                      <span
                        className={cn(
                          "grid h-9 w-9 shrink-0 place-items-center rounded-xl border",
                          presentation.iconWrap,
                        )}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <span
                              className={cn(
                                "inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em]",
                                presentation.badge,
                              )}
                            >
                              {alert.title}
                            </span>
                          </div>
                          <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                            {ago(alert.createdAt)}
                          </span>
                        </div>
                        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                          {alert.body}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Alerts stay generic and never include position amounts. Review details from Position or Risk.
          </p>
        </div>
      </HarmonyDrawer>
    </>
  );
}
