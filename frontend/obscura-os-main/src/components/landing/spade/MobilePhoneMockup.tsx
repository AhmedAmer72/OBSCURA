import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MOBILE_APP_SCREENSHOTS } from "./mobileAppScreenshots";

type MobilePhoneMockupProps = {
  autoRotate?: boolean;
  rotateIntervalMs?: number;
  showModuleChip?: boolean;
  className?: string;
};

function pillLabel(label: (typeof MOBILE_APP_SCREENSHOTS)[number]["label"]) {
  return label === "Splash" ? "Obscura" : label;
}

export default function MobilePhoneMockup({
  autoRotate = true,
  rotateIntervalMs = 4500,
  showModuleChip = true,
  className = "",
}: MobilePhoneMockupProps) {
  const [index, setIndex] = useState(0);
  const shot = MOBILE_APP_SCREENSHOTS[index];
  const showChip = showModuleChip && shot.label !== "Splash";

  useEffect(() => {
    if (!autoRotate || MOBILE_APP_SCREENSHOTS.length <= 1) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % MOBILE_APP_SCREENSHOTS.length);
    }, rotateIntervalMs);
    return () => window.clearInterval(id);
  }, [autoRotate, rotateIntervalMs]);

  return (
    <div
      className={`relative mx-auto w-full max-w-[240px] sm:max-w-[260px] lg:max-w-[280px] ${className}`}
    >
      <div
        className="pointer-events-none absolute -inset-6 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 55%, rgba(178,235,118,0.18), transparent 65%)",
        }}
      />
      <div className="relative rotate-[-4deg] transition-transform duration-500 hover:rotate-0 lg:rotate-[-5deg] lg:hover:rotate-[-2deg]">
        <div className="rounded-[2.25rem] border border-white/12 bg-[#141814] p-1.5 shadow-[0_32px_64px_-18px_rgba(0,0,0,0.65)]">
          <div className="relative overflow-hidden rounded-[1.85rem] border border-white/8 bg-[#141814]">
            <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-5 w-[68px] -translate-x-1/2 rounded-full bg-black" />
            {showChip ? (
              <div className="pointer-events-none absolute left-1/2 top-8 z-20 -translate-x-1/2">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={shot.label}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.25 }}
                    className="inline-flex rounded-full border border-white/15 bg-black/55 px-2.5 py-0.5 font-mono text-[8px] uppercase tracking-[0.18em] text-lime-accent backdrop-blur-sm"
                  >
                    {pillLabel(shot.label)}
                  </motion.span>
                </AnimatePresence>
              </div>
            ) : null}
            <div className="relative aspect-[9/19.5] w-full overflow-hidden bg-[#141814]">
              <AnimatePresence mode="sync">
                <motion.img
                  key={shot.src}
                  src={shot.src}
                  alt={shot.alt}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="absolute inset-0 h-full w-full object-cover object-top"
                  draggable={false}
                />
              </AnimatePresence>
            </div>
          </div>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {MOBILE_APP_SCREENSHOTS.map((item, i) => (
            <button
              key={item.src}
              type="button"
              onClick={() => setIndex(i)}
              className={`h-1 rounded-full transition-all ${
                i === index ? "w-5 bg-lime-accent" : "w-1 bg-white/25 hover:bg-white/40"
              }`}
              aria-label={`Show ${pillLabel(item.label)} screenshot`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {MOBILE_APP_SCREENSHOTS.map((item, i) => (
            <button
              key={`${item.label}-pill`}
              type="button"
              onClick={() => setIndex(i)}
              className={`rounded-full px-2 py-0.5 font-mono text-[8px] uppercase tracking-[0.12em] transition-colors ${
                i === index
                  ? "bg-lime-accent/20 text-lime-accent"
                  : "text-white/35 hover:text-white/55"
              }`}
            >
              {pillLabel(item.label)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
