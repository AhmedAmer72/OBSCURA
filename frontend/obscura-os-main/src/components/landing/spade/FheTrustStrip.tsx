import { motion } from "framer-motion";
import { Eye, Lock, Shield, Sparkles } from "lucide-react";

const PILLS = [
  { icon: Lock, label: "Encrypted by default" },
  { icon: Eye, label: "Reveal on tap" },
  { icon: Sparkles, label: "Homomorphic compute" },
  { icon: Shield, label: "Arbitrum Sepolia · CoFHE testnet" },
] as const;

export default function FheTrustStrip() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.62, duration: 0.65 }}
      className="mx-auto mt-5 grid max-w-[920px] grid-cols-2 gap-2 px-3 sm:mt-6 sm:flex sm:flex-wrap sm:items-center sm:justify-center sm:gap-2.5 sm:px-5"
    >
      {PILLS.map(({ icon: Icon, label }, i) => (
        <motion.span
          key={label}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.68 + i * 0.06, duration: 0.45 }}
          className="inline-flex items-center gap-1.5 rounded-full border border-forest/12 bg-white/90 px-2.5 py-1.5 font-mono text-[9px] uppercase tracking-[0.12em] text-forest/70 shadow-[0_1px_0_rgba(24,40,14,0.04)] backdrop-blur-sm sm:gap-2 sm:px-4 sm:py-2 sm:text-[10px] sm:tracking-[0.14em]"
        >
          <Icon className="size-3.5 shrink-0 text-lime-accent" aria-hidden />
          {label}
        </motion.span>
      ))}
    </motion.div>
  );
}
