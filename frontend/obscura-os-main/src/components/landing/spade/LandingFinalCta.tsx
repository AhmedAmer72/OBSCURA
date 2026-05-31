import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Smartphone } from "lucide-react";

export default function LandingFinalCta() {
  return (
    <section className="relative overflow-hidden bg-forest px-4 py-16 sm:px-5 sm:py-20 md:py-28 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(70% 80% at 20% 50%, rgba(178,235,118,0.14), transparent 55%), radial-gradient(50% 50% at 90% 20%, rgba(255,255,255,0.06), transparent 50%)",
        }}
        aria-hidden
      />
      <div className="relative mx-auto max-w-[900px] text-center">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-[10px] uppercase tracking-[0.24em] text-lime-accent/75"
        >
          Private finance OS
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.06 }}
          className="mt-4 font-display text-2xl font-medium leading-[1.1] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-5xl"
        >
          Encrypted balances. Private ballots.
          <br />
          <span className="text-lime-accent">Reveal only when you choose.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.12 }}
          className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-white/55"
        >
          Use Obscura on web, sideload the Android app, or integrate with the SDK and MCP — one
          Fhenix CoFHE stack on Arbitrum Sepolia testnet.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.18 }}
          className="mt-8 flex w-full max-w-md flex-col items-stretch gap-2.5 sm:mx-auto sm:mt-10 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3"
        >
          <Link
            to="/home"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-lime-accent px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-forest transition-opacity hover:opacity-90 sm:min-w-[200px] sm:w-auto"
          >
            Open Obscura
            <ArrowRight className="size-4" />
          </Link>
          <Link
            to="/download"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.06] px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white/35 hover:bg-white/[0.1] sm:min-w-[200px] sm:w-auto"
          >
            <Smartphone className="size-4" />
            Download APK
          </Link>
          <Link
            to="/docs"
            className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 px-8 py-3.5 font-body text-sm font-medium text-white/85 transition-colors hover:text-white sm:min-w-[200px] sm:w-auto"
          >
            <BookOpen className="size-4" />
            Developer docs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
