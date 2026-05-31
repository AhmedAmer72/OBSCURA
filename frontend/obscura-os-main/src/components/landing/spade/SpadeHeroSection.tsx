import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Smartphone } from "lucide-react";
import ObscuraSlogan from "@/components/brand/ObscuraSlogan";
import { PoweredByFhenix } from "@/components/brand/PoweredByFhenix";
import FheTrustStrip from "./FheTrustStrip";
import SideRulers from "./SideRulers";
import MoneyGlyph from "./MoneyGlyph";
import FloatingDataCards from "./FloatingDataCards";

/** Sage inset from ruler ticks — tight like spade.com */
const SAGE_INSET = "px-5 sm:px-6 md:px-7 lg:px-8";

export default function SpadeHeroSection() {
  return (
    <section className="relative overflow-x-clip bg-white pb-8 pt-0 sm:pb-10 lg:pb-12">
      <div className="relative mx-auto w-full max-w-[1400px]">
        <SideRulers />

        <div className={`relative z-10 ${SAGE_INSET}`}>
          <div className="overflow-hidden rounded-[1.25rem] bg-sage-1 shadow-[0_1px_0_rgba(24,40,14,0.05)] ring-1 ring-forest/[0.05] sm:rounded-[1.5rem] md:rounded-[1.75rem] lg:rounded-[2rem]">
            <div className="flex min-h-[min(68vh,640px)] flex-col px-2 pt-6 pb-6 sm:min-h-[min(78vh,760px)] sm:px-4 sm:pt-9 sm:pb-9 md:min-h-[min(90vh,920px)] md:px-5 md:pt-10 md:pb-10 lg:pt-11 lg:pb-11">
              <div className="flex flex-col items-center gap-3 overflow-visible px-1 sm:gap-4 sm:px-3">
                <ObscuraSlogan centered size="hero" className="shrink-0" />
                <PoweredByFhenix variant="hero" />
              </div>

              <div className="relative mt-4 flex flex-1 flex-col justify-center sm:mt-5 md:mt-6">
                <div className="relative mx-auto w-full max-w-[960px] flex-1">
                  <div className="relative min-h-[clamp(240px,42vh,580px)] w-full sm:min-h-[clamp(300px,50vh,580px)]">
                    <FloatingDataCards variant="wide" />

                    <div className="absolute inset-0 z-10 flex items-center justify-center pb-2">
                      <MoneyGlyph className="h-[min(100%,clamp(220px,44vw,520px))] w-full max-w-[min(100%,620px)] sm:h-[min(100%,clamp(280px,48vw,520px))]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.75 }}
            className="mx-auto mt-6 max-w-2xl px-1 text-center font-body text-sm leading-relaxed text-forest/65 sm:mt-8 sm:text-base md:mt-10 md:text-lg"
          >
            The encrypted finance OS on Arbitrum Sepolia — Pay, Credit, and Vote powered by Fhenix
            CoFHE. Balances, ballots, and borrowing stay ciphertext on-chain until you tap Reveal.
          </motion.p>

          <FheTrustStrip />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.75 }}
            className="mt-6 flex w-full max-w-md flex-col items-stretch gap-2.5 px-1 sm:mx-auto sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-3"
          >
            <Link
              to="/home"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full bg-forest px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-accent transition-opacity hover:opacity-90 sm:min-w-[200px] sm:w-auto"
            >
              Open Obscura →
            </Link>
            <Link
              to="/download"
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-forest/18 bg-white px-8 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-forest transition-colors hover:border-forest/35 sm:min-w-[200px] sm:w-auto"
            >
              <Smartphone className="size-4" />
              Download APK
            </Link>
            <a
              href="#how-fhe"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-forest/18 bg-white px-8 py-3.5 font-body text-sm font-medium text-forest transition-colors hover:border-forest/35 sm:min-w-[200px] sm:w-auto"
            >
              How FHE works
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
