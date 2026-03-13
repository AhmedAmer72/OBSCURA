import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import {
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { ArrowUpRight, Cpu, Eye, Lock, Network, Sparkles } from "lucide-react";
import { PoweredByFhenix } from "@/components/brand/PoweredByFhenix";
import {
  ObscuraFeatureIcon,
  type ObscuraChipTone,
} from "@/components/landing/ObscuraFeatureIcon";
import { cn } from "@/lib/utils";

const PIPELINE = [
  {
    id: "encrypt",
    step: "01",
    icon: Lock,
    tone: "forest" as ObscuraChipTone,
    title: "Encrypt on your device",
    body: "Before any transaction, the CoFHE client seals amounts and vote choices locally. Plaintext never hits the RPC — only encrypted inputs reach Arbitrum Sepolia.",
    detail: "Pay · Credit · Govern",
  },
  {
    id: "store",
    step: "02",
    icon: Network,
    tone: "moss" as ObscuraChipTone,
    title: "Store as ciphertext handles",
    body: "Smart contracts persist FHE handles on-chain — balances, debt shares, and ballot tallies stay sealed. Explorers see references, not decoded values.",
    detail: "euint64 on Arbitrum",
  },
  {
    id: "compute",
    step: "03",
    icon: Cpu,
    tone: "lime" as ObscuraChipTone,
    title: "Fhenix computes in the open",
    body: "The CoFHE coprocessor runs homomorphic add, compare, and select off-chain. Lending health, stream ticks, and vote totals update without decrypting individual inputs.",
    detail: "Threshold FHE network",
  },
  {
    id: "reveal",
    step: "04",
    icon: Eye,
    tone: "deep" as ObscuraChipTone,
    title: "Reveal on your terms",
    body: "Obscura masks values until you tap Reveal or finalize a vote. No auto-decrypt on page load — each view is a permit you sign and can revoke.",
    detail: "Web + mobile",
  },
] as const;

const STEP_COUNT = PIPELINE.length;

function CipherPulse({ active }: { active: boolean }) {
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <motion.span
        animate={active ? { scale: [1, 1.35, 1], opacity: [0.35, 0.12, 0.35] } : { scale: 1, opacity: 0.2 }}
        transition={{ duration: 2.4, repeat: active ? Infinity : 0, ease: "easeInOut" }}
        className="absolute inset-0 rounded-full bg-brand/25"
      />
      <motion.span
        animate={active ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        className="absolute inset-1 rounded-full border border-dashed border-brand/35"
      />
      <span className="font-mono text-[11px] tracking-widest text-brand">FHE</span>
    </div>
  );
}

function PipelineMiniFlow({ activeIndex }: { activeIndex: number }) {
  return (
    <div className="mt-3 flex items-center gap-0" aria-hidden>
      {PIPELINE.map((step, i) => {
        const Icon = step.icon as LucideIcon;
        const on = i <= activeIndex;
        const current = i === activeIndex;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            <div
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded border transition-all duration-300",
                current
                  ? "border-lime-accent bg-lime-accent/20 text-lime-accent"
                  : on
                    ? "border-white/25 bg-white/10 text-white/70"
                    : "border-white/10 bg-transparent text-white/25",
              )}
            >
              <Icon className="size-2.5" strokeWidth={1.75} />
            </div>
            {i < PIPELINE.length - 1 ? (
              <div
                className={cn(
                  "mx-0.5 h-px flex-1 transition-colors duration-300",
                  i < activeIndex ? "bg-lime-accent/50" : "bg-white/12",
                )}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function PipelineStage({
  item,
  index,
  stepProgress,
}: {
  item: (typeof PIPELINE)[number];
  index: number;
  stepProgress: MotionValue<number>;
}) {
  const Icon = item.icon;
  const focus = useTransform(stepProgress, (p) => {
    const dist = Math.abs(p - (index + 0.5));
    return Math.max(0, Math.min(1, 1 - dist * 0.72));
  });
  const blurPx = useTransform(stepProgress, (p) => {
    const dist = Math.abs(p - (index + 0.5));
    if (dist < 0.25) return 0;
    return Math.min(7, (dist - 0.25) * 4.25);
  });
  const pastDim = useTransform(stepProgress, (p) => {
    const past = p - (index + 0.85);
    if (past <= 0) return 1;
    return Math.max(0.35, 1 - past * 0.32);
  });
  const futureDim = useTransform(stepProgress, (p) => {
    const ahead = index + 0.35 - p;
    if (ahead <= 0) return 1;
    return Math.max(0.5, 1 - ahead * 0.25);
  });
  const cardOpacity = useTransform([pastDim, futureDim], ([past, future]) => past * future);
  const cardFilter = useTransform(blurPx, (b) => `blur(${b.toFixed(2)}px)`);
  const glowOpacity = useTransform(focus, [0, 1], [0, 1]);
  const [isActive, setIsActive] = useState(index === 0);

  useMotionValueEvent(focus, "change", (v) => setIsActive(v > 0.45));

  return (
    <motion.article
      style={{ opacity: cardOpacity, filter: cardFilter }}
      className={cn(
        "relative w-full overflow-hidden rounded-xl border p-3 transition-[border-color,box-shadow,background-color,color] duration-500 md:p-3.5",
        isActive
          ? "border-forest/30 bg-forest text-white shadow-[0_12px_32px_-16px_rgba(24,40,14,0.4)]"
          : "border-border-subtle bg-white text-foreground shadow-sm",
      )}
    >
      {isActive ? (
        <motion.div
          style={{ opacity: glowOpacity }}
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-lime-accent/30"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-2">
        <ObscuraFeatureIcon icon={Icon} tone={item.tone} size="sm" />
        <span
          className={cn(
            "font-mono text-[8px] uppercase tracking-[0.16em]",
            isActive ? "text-lime-accent/85" : "text-brand",
          )}
        >
          {item.step}/{String(STEP_COUNT).padStart(2, "0")}
        </span>
      </div>

      <h3
        className={cn(
          "relative mt-2 font-display text-base tracking-tight md:text-[17px]",
          isActive ? "text-white" : "text-foreground",
        )}
      >
        {item.title}
      </h3>
      <p
        className={cn(
          "relative mt-1 text-[11px] leading-snug md:text-xs",
          isActive ? "text-white/65" : "text-muted-foreground",
          isActive ? "" : "line-clamp-2",
        )}
      >
        {item.body}
      </p>

      <motion.div
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, height: isActive ? "auto" : 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="mt-2.5 rounded-md border border-dashed border-white/20 bg-white/5 px-2.5 py-1.5">
          <p className="font-mono text-[8px] uppercase tracking-wider text-white/40">In the stack</p>
          <p className="mt-0.5 font-mono text-[10px] text-lime-accent/90">{item.detail}</p>
        </div>

        <div className="mt-2.5 flex items-center gap-1 border-t border-white/10 pt-2 font-mono text-[8px] uppercase tracking-[0.12em] text-lime-accent/75">
          <Sparkles className="size-2.5" />
          Powered by Fhenix CoFHE
        </div>

        <PipelineMiniFlow activeIndex={index} />
      </motion.div>
    </motion.article>
  );
}

export function FhenixFheSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pipelineRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { margin: "-20%", once: false });

  const { scrollYProgress } = useScroll({
    target: pipelineRef,
    offset: ["start 0.82", "end 0.22"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 65,
    damping: 28,
    mass: 0.35,
  });

  const stepProgress = useTransform(smoothProgress, [0, 1], [0, STEP_COUNT]);
  const lineProgress = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section
      ref={sectionRef}
      id="how-fhe"
      className="relative scroll-mt-24 overflow-hidden border-y border-border-subtle bg-surface py-28 md:py-40"
    >
      <motion.div
        aria-hidden
        animate={inView ? { opacity: 1 } : { opacity: 0.4 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 55% at 85% 20%, hsl(var(--brand) / 0.08), transparent 60%), radial-gradient(50% 40% at 10% 80%, hsl(var(--brand) / 0.05), transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-[1400px] px-6 md:px-8">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-16 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-28"
          >
            <div className="tag-bracket mb-5">▸ FHE · Fhenix</div>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              Homomorphic encryption,{" "}
              <span className="text-brand">built into every product.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Obscura runs on{" "}
              <strong className="font-medium text-foreground">Fhenix CoFHE</strong> atop Arbitrum
              Sepolia. Pay, Credit, and Govern share one encryption stack — sealed balances, private
              ballots, and encrypted lending positions computed without exposing individual numbers.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="mt-8 flex flex-wrap items-center gap-4"
            >
              <PoweredByFhenix variant="inline" className="rounded-full border border-border-subtle bg-background px-3 py-1.5" />
            </motion.div>

            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                to="/privacy"
                className="inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
              >
                Privacy model
                <ArrowUpRight className="size-4" />
              </Link>
              <Link
                to="/pay"
                className="inline-flex items-center gap-2 rounded-full border border-border-subtle bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-brand/30"
              >
                Try encrypted Pay
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 }}
              className="mt-12 hidden lg:block"
            >
              <CipherPulse active={inView} />
              <p className="mt-4 max-w-xs font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Ciphertext in · compute sealed · plaintext out only when you permit
              </p>
            </motion.div>
          </motion.div>

          <div
            ref={pipelineRef}
            className="relative overflow-hidden rounded-2xl border border-border-subtle bg-sage-2 px-2.5 py-3 md:px-4 md:py-3.5"
          >
            <div className="relative">
              <div className="absolute bottom-3 left-[1.125rem] top-3 hidden w-px bg-border-subtle md:block">
                <motion.div style={{ height: lineProgress }} className="w-px origin-top bg-brand" />
              </div>

              <div className="space-y-2">
                {PIPELINE.map((item, i) => (
                  <PipelineStage key={item.id} item={item} index={i} stepProgress={stepProgress} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="mt-16 grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Pay", value: "ocUSDC streams & stealth sends" },
            { label: "Credit", value: "Encrypted collateral & debt" },
            { label: "Govern", value: "Sealed ballots · public aggregates" },
          ].map((chip, i) => (
            <motion.div
              key={chip.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.12 + i * 0.06 }}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border-subtle bg-background/70 px-4 py-4 backdrop-blur-sm"
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-brand">{chip.label}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{chip.value}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
