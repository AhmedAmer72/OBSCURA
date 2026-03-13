import { Link } from "react-router-dom";
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Banknote, Coins, Landmark, Shield, Smartphone } from "lucide-react";
import MobilePhoneMockup from "./MobilePhoneMockup";
import { MOBILE_APP_FOREST_GRADIENT, MOBILE_APP_FOREST_SECTION } from "./mobileAppScreenshots";

const FEATURES = [
  {
    icon: Shield,
    tone: "text-lime-accent",
    title: "Private Pay treasury",
    body: "Shield USDC to ocUSDC, send encrypted payments, and manage stealth inbox — same reveal-on-demand UX as web.",
  },
  {
    icon: Landmark,
    tone: "text-violet-300",
    title: "Govern on the go",
    body: "Vote privately on proposals, track treasury activity, and earn ballot rewards — full Govern workspace in your pocket.",
  },
  {
    icon: Coins,
    tone: "text-amber-200/90",
    title: "Encrypted Credit",
    body: "Supply collateral, borrow against ocUSDC, and monitor health factor — position size stays encrypted on-chain.",
  },
] as const;

export default function MobileAppSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-10%" });

  return (
    <section
      ref={sectionRef}
      id="mobile-app"
      className={`${MOBILE_APP_FOREST_SECTION} px-4 py-20 sm:px-5 md:py-32 lg:px-8 lg:py-40 min-h-[min(88vh,920px)] flex flex-col justify-center`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{ background: MOBILE_APP_FOREST_GRADIENT.background }}
      />

      <div className="relative mx-auto grid w-full max-w-[1200px] items-center gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-20 xl:gap-24">
        <motion.div
          initial={{ opacity: 0, x: -32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="order-2 lg:order-1"
        >
          <MobilePhoneMockup />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.85, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="order-1 lg:order-2"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-lime-accent/80">
            Mobile suite
          </p>
          <h2 className="mt-4 font-display text-3xl font-medium leading-[1.08] tracking-tight text-white md:text-4xl lg:text-[3.25rem]">
            Privacy in your{" "}
            <span className="text-lime-accent">pocket</span>
          </h2>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55 md:text-[17px]">
            Pay, Govern, and Credit — three encrypted workspaces in one Android app. Balances,
            ballots, and borrowing stay FHE-protected on Arbitrum Sepolia, tuned for thumb-sized
            flows and WalletConnect on real devices.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/download"
              className="inline-flex min-h-[48px] items-center gap-3 rounded-xl border border-white/15 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-white/25 hover:bg-white/[0.08]"
            >
              <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden>
                <path
                  fill="currentColor"
                  d="M3.6 2.4A1.8 1.8 0 0 0 2 4.2v15.6a1.8 1.8 0 0 0 1.6 1.8l9.1-9.9-9.1-9.3Zm11.1 7.5 2.5-2.7a8.6 8.6 0 0 1 2.4 5.9 8.6 8.6 0 0 1-2.4 5.9l-2.5-2.7 3.4-3.7-3.4-3.7ZM12 12.8 4.8 20.6A1.8 1.8 0 0 0 6.4 22h11.2a1.8 1.8 0 0 0 1.6-1.4L12 12.8Zm8.8-1.4L17.4 8.7l2.5-2.7A8.6 8.6 0 0 1 22 12a8.6 8.6 0 0 1-2.1 6l-2.5-2.7 3.4-3.7Z"
                />
              </svg>
              <span>
                <span className="block text-[10px] font-normal uppercase tracking-wider text-white/45">
                  Direct install
                </span>
                Download Android APK
              </span>
            </Link>
            <p className="w-full text-xs text-white/40 sm:w-auto">
              Install from our{" "}
              <Link to="/download" className="text-white/55 underline-offset-2 hover:text-white/75 hover:underline">
                download page
              </Link>
              — no GitHub Releases or app store required.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            <span className="inline-flex items-center gap-2">
              <Smartphone className="size-3.5 text-lime-accent/80" />
              Pay · Govern · Credit
            </span>
            <span className="inline-flex items-center gap-2">
              <Banknote className="size-3.5 text-lime-accent/80" />
              FHE encrypted
            </span>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {FEATURES.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-sm"
                >
                  <div className={`mb-3 flex size-9 items-center justify-center rounded-xl bg-white/[0.06] ${feature.tone}`}>
                    <Icon className="size-4" strokeWidth={1.75} />
                  </div>
                  <h3 className="font-display text-base font-medium text-white">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{feature.body}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
