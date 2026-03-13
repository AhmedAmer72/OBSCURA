import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  CreditCard,
  Home,
  LayoutGrid,
  Lock,
  Settings,
  Shield,
  Vote,
  Wallet,
} from "lucide-react";

const MODULES = [
  {
    to: "/home",
    icon: Home,
    name: "Command Center",
    body: "One glance at Pay, Credit, and Vote — encrypted balances, borrowing power, and reputation signals with reveal-on-demand.",
  },
  {
    to: "/pay",
    icon: Wallet,
    name: "Pay",
    body: "Private Mode for ocUSDC streams, stealth inbox, and escrows. Public Mode for passkey USDC with sponsored gas.",
  },
  {
    to: "/credit",
    icon: CreditCard,
    name: "Credit",
    body: "Encrypted supply and borrow against the same ocUSDC you shield in Pay. Public solvency, private balance sheet.",
  },
  {
    to: "/vote",
    icon: Vote,
    name: "Vote",
    body: "FHE ballots and treasury flows. Coercion-resistant choices; aggregates revealed only after finalization.",
  },
];

const PILLARS = [
  { icon: LayoutGrid, label: "Harmony shell", detail: "Shared sidebar, workspace chrome, and FHE stepper across products." },
  { icon: Lock, label: "Reveal on demand", detail: "No auto-decrypt on page load — you grant each view with a permit." },
  { icon: Settings, label: "Unified settings", detail: "Notifications, wallet, privacy, and contacts in one toolbar — not scattered tiles." },
  { icon: Shield, label: "Dual payment rails", detail: "Private ocUSDC via wallet · Public USDC via ERC-4337 passkey account." },
];

export function HarmonyWorkspaceSection() {
  return (
    <section className="relative border-y border-border-subtle bg-surface py-32 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="max-w-3xl">
          <div className="tag-bracket mb-5">▸ Harmony workspace</div>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
            Three products.{" "}
            <span className="text-brand">One encrypted operating system.</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Obscura ships as a single Harmony workspace on Arbitrum Sepolia — Pay, Credit, and Vote share
            ocUSDC, reputation, activity feeds, and the Fhenix CoFHE stack. Start from the command center,
            then dive into the module you need.
          </p>
          <Link
            to="/home"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
          >
            Open command center
            <ArrowUpRight className="size-4" />
          </Link>
        </div>

        <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MODULES.map((m, i) => {
            const Icon = m.icon;
            return (
              <motion.div
                key={m.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.55, delay: i * 0.06 }}
              >
                <Link
                  to={m.to}
                  className="group flex h-full flex-col rounded-2xl border border-border-subtle bg-surface-elevated p-6 shadow-[var(--shadow-card)] transition-shadow hover:shadow-[var(--shadow-float)]"
                >
                  <Icon className="size-5 text-brand" strokeWidth={1.75} />
                  <h3 className="mt-4 font-display text-xl tracking-tight">{m.name}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-brand">
                    Launch
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.label}
                className="rounded-xl border border-border-subtle bg-background/60 px-4 py-4"
              >
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="size-4 text-brand" strokeWidth={1.75} />
                  {p.label}
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{p.detail}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
