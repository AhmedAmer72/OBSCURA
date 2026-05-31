import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ObscuraFeatureIcon,
  ENCRYPTION_STEP_ICONS,
} from "@/components/landing/ObscuraFeatureIcon";

const STEPS = [
  {
    title: "Encrypt in the browser",
    body: "CoFHE seals amounts client-side before they reach Arbitrum Sepolia. Pay streams, credit shares, and vote choices enter as ciphertext handles — never plaintext on-chain.",
  },
  {
    title: "Compute without decrypting",
    body: "Contracts run FHE.add, FHE.sub, and FHE.gt on sealed balances. Lending health, payroll ticks, and ballot tallies update homomorphically via the Fhenix coprocessor (testnet).",
  },
  {
    title: "Reveal on your terms",
    body: "The Harmony UI masks values until you click Reveal. No auto-decrypt on mount — each view needs an explicit permit you control.",
  },
  {
    title: "Public where it helps",
    body: "TVL, utilization, and finalized vote aggregates can be public by design. Individual payments, positions, and ballots stay encrypted until you choose otherwise.",
  },
  {
    title: "Two rails for Pay",
    body: "Private Mode: ocUSDC with your wallet. Public Mode: visible USDC through a passkey smart account and ERC-4337 relay — same app, different privacy tradeoff.",
  },
];

export function EncryptionStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.9], ["0%", "100%"]);

  return (
    <section id="how" ref={ref} className="relative bg-background py-32 md:py-48">
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="max-w-3xl mb-20">
          <div className="tag-bracket mb-5">▸ How it works</div>
          <h2 className="font-display text-4xl md:text-6xl leading-[1.05] tracking-tight">
            Privacy that <span className="text-brand">computes</span>,<br />
            not just <span className="italic">hides</span>.
          </h2>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Fully Homomorphic Encryption lets Obscura run a composable privacy stack — Pay funds Credit,
            Vote participation feeds reputation, all without broadcasting individual amounts. Five beats
            from seal to settlement.
          </p>
        </div>

        <div className="relative grid md:grid-cols-2 gap-x-16 gap-y-20">
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-border-subtle">
            <motion.div
              style={{ height: lineHeight }}
              className="w-px bg-brand origin-top"
            />
          </div>

          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className={`${i % 2 === 0 ? "md:pr-12" : "md:pl-12 md:translate-y-24"}`}
            >
              <div className="rounded-3xl border border-border-subtle bg-surface-elevated p-8 shadow-[var(--shadow-card)]">
                <div className="flex items-center gap-3 mb-5">
                  <ObscuraFeatureIcon
                    icon={ENCRYPTION_STEP_ICONS[i].icon}
                    tone={ENCRYPTION_STEP_ICONS[i].tone}
                  />
                  <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Step 0{i + 1}
                  </div>
                </div>
                <h3 className="font-display text-2xl md:text-3xl tracking-tight">{s.title}</h3>
                <p className="mt-3 text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
