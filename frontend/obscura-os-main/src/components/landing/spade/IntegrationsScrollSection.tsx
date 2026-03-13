import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const INTEGRATIONS = [
  { label: "Harmony · /home", href: "/home" },
  { label: "Fhenix CoFHE", href: "/docs" },
  { label: "Arbitrum Sepolia", href: "/docs" },
  { label: "ocUSDC_Pay", href: "/pay" },
  { label: "Private Mode", href: "/pay" },
  { label: "Public · Passkey", href: "/pay" },
  { label: "@obscura-fhe/sdk", href: "/docs" },
  { label: "Pay", href: "/pay" },
  { label: "Credit", href: "/credit" },
  { label: "Vote", href: "/vote" },
  { label: "Unified Settings", href: "/settings" },
];

/**
 * Spade-style horizontal chip strip — complements vault LogoStrip with Obscura modules.
 */
export default function IntegrationsScrollSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="bg-sage-1 px-4 py-14 sm:px-5 md:py-20 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-8 max-w-xl"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-forest/45">
            [ Integrations ]
          </p>
          <h3 className="mt-3 font-display text-2xl font-medium tracking-tight text-forest md:text-3xl">
            Every module on one chain — one encrypted asset
          </h3>
        </motion.div>

        <div className="marquee-mask -mx-4 overflow-hidden sm:-mx-5">
          <div className="flex w-max animate-marquee gap-3 pr-3">
            {[...INTEGRATIONS, ...INTEGRATIONS].map((item, i) => (
              <Link
                key={`${item.label}-${i}`}
                to={item.href}
                className="shrink-0 rounded-full border border-forest/12 bg-white px-5 py-2.5 font-body text-sm font-medium text-forest/80 transition-colors hover:border-forest/25 hover:text-forest"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
