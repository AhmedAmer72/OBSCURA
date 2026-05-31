import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ObscuraFeatureIcon,
  ENCRYPTION_STEP_ICONS,
} from "@/components/landing/ObscuraFeatureIcon";

const STEPS = [
  {
    title: "Seal before submit",
    body: "Fhenix CoFHE encrypts amounts and vote choices in your browser. Pay, Credit, and Vote send InEuint64 handles to Arbitrum Sepolia — never plaintext on-chain.",
  },
  {
    title: "Compute on ciphertext",
    body: "Contracts run FHE.add, FHE.sub, and FHE.gt on sealed balances. Lending health, payroll ticks, and ballot tallies update homomorphically via the coprocessor.",
  },
  {
    title: "Reveal on your terms",
    body: "Obscura masks balances and positions until you tap Reveal. No auto-decrypt on page load — each view needs an explicit permit you control.",
  },
  {
    title: "Public only where it helps",
    body: "TVL, pool utilization, and finalized vote aggregates can be public by design. Individual payments, positions, and ballots stay encrypted until you choose.",
  },
] as const;

export function EncryptionStory() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const lineHeight = useTransform(scrollYProgress, [0.1, 0.85], ["0%", "100%"]);

  return (
    <section id="how-fhe" ref={ref} className="relative bg-background py-16 md:py-24 lg:py-36">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border-subtle to-transparent"
        aria-hidden
      />
      <div className="mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:items-end lg:gap-16">
          <div className="max-w-xl">
            <div className="tag-bracket mb-5">▸ How FHE works</div>
            <h2 className="font-display text-3xl leading-[1.05] tracking-tight md:text-5xl lg:text-6xl">
              Privacy that <span className="text-brand">computes</span>,
              <br />
              not just <span className="italic text-foreground/85">hides</span>.
            </h2>
          </div>
          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg lg:pb-2">
            Obscura is a private finance OS — one encrypted asset (ocUSDC), three modules (Pay · Credit ·
            Vote), and reveal-on-demand everywhere. Four beats from seal to settlement on Arbitrum Sepolia
            testnet.
          </p>
        </div>

        <div className="relative mt-16 md:mt-20">
          <div className="hidden lg:block absolute left-[calc(50%-1px)] top-4 bottom-4 w-px bg-border-subtle">
            <motion.div style={{ height: lineHeight }} className="w-px bg-brand origin-top" />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:gap-x-12 lg:gap-y-8">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.65, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={i % 2 === 1 ? "lg:translate-y-10" : undefined}
              >
                <article className="group relative h-full overflow-hidden rounded-3xl border border-border-subtle bg-surface-elevated p-7 shadow-[var(--shadow-card)] transition-shadow duration-300 hover:shadow-[var(--shadow-float)] md:p-8">
                  <div
                    className="pointer-events-none absolute -right-8 -top-8 size-32 rounded-full bg-[radial-gradient(circle,hsl(var(--success)/0.08),transparent_70%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden
                  />
                  <div className="relative flex items-start gap-4">
                    <ObscuraFeatureIcon
                      icon={ENCRYPTION_STEP_ICONS[i].icon}
                      tone={ENCRYPTION_STEP_ICONS[i].tone}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Step 0{i + 1}
                      </div>
                      <h3 className="mt-2 font-display text-xl tracking-tight md:text-2xl">{s.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-[15px]">
                        {s.body}
                      </p>
                    </div>
                  </div>
                </article>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4"
        >
          <Link
            to="/home"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-forest px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-accent transition-opacity hover:opacity-90"
          >
            Open Obscura →
          </Link>
          <Link
            to="/docs/privacy"
            className="inline-flex min-w-[200px] items-center justify-center rounded-full border border-border bg-surface px-8 py-3.5 font-body text-sm font-medium text-foreground transition-colors hover:border-forest/25"
          >
            Privacy model
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
