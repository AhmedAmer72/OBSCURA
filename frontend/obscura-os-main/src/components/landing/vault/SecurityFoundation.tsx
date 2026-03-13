import { motion } from "framer-motion";
import { FileCheck2, ScrollText, FileBadge } from "lucide-react";
import {
  ObscuraFeatureIcon,
  SECURITY_PILLAR_ICONS,
} from "@/components/landing/ObscuraFeatureIcon";

const PILLARS = [
  {
    title: "FHE at the protocol layer",
    body: "21 FHE-enabled contracts on Arbitrum Sepolia store euint64 handles — not plaintext amounts. The Fhenix CoFHE coprocessor runs homomorphic math; your wallet stays the signer for private writes.",
  },
  {
    title: "Reveal on demand",
    body: "Product philosophy is explicit: no decrypt in useEffect. Balances, credit shares, and vote choices stay masked until you click Reveal and approve a CoFHE permit.",
  },
  {
    title: "Live testnet, real wiring",
    body: "38 registered contracts, 51 indexed event types, and shared API/worker infrastructure — production-grade architecture on Sepolia while CoFHE mainnet unlocks.",
  },
];

const PROOFS = [
  { icon: FileCheck2, label: "Arbitrum Sepolia · 421614" },
  { icon: FileCheck2, label: "Fhenix CoFHE · testnet" },
  { icon: ScrollText, label: "Architecture ref · v1.2" },
  { icon: FileBadge, label: "@obscura-fhe/sdk" },
];

export function SecurityFoundation() {
  return (
    <section id="security" className="relative bg-surface border-y border-border-subtle py-32 md:py-44">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="max-w-3xl mb-16">
          <div className="tag-bracket mb-5">▸ Foundations</div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Privacy is a <span className="text-brand">proof</span>,<br />
            not a promise.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Three pillars under every Obscura transaction. Each one verifiable,
            each one independent of us.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <motion.div
              key={p.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-3xl border border-border-subtle bg-surface-elevated p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-float)] transition-shadow"
            >
              <ObscuraFeatureIcon
                icon={SECURITY_PILLAR_ICONS[i].icon}
                tone={SECURITY_PILLAR_ICONS[i].tone}
                size="lg"
              />
              <h3 className="mt-6 font-display text-2xl md:text-3xl tracking-tight">{p.title}</h3>
              <p className="mt-3 text-muted-foreground leading-relaxed">{p.body}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mr-1">
            ▸ Verified by
          </span>
          {PROOFS.map((p) => (
            <span
              key={p.label}
              className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-surface-elevated px-3 py-1.5 text-xs text-foreground"
            >
              <p.icon className="size-3.5 text-brand" strokeWidth={1.75} />
              {p.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
