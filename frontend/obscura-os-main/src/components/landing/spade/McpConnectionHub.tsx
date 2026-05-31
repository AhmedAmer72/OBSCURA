import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { AGENTS } from "./AiAgentIconGrid";

const STAGGER = 0.06;

function AgentTile({ index }: { index: number }) {
  const agent = AGENTS[index];
  if (!agent) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 10 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: 0.25 + index * STAGGER, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4, scale: 1.04 }}
      className="group flex flex-col items-center gap-2 text-center"
    >
      <span className="relative grid size-14 place-items-center overflow-hidden rounded-[22%] bg-white shadow-[0_8px_24px_-10px_rgba(24,40,14,0.2)] ring-1 ring-forest/10 transition-shadow duration-300 group-hover:shadow-[0_16px_36px_-12px_rgba(24,40,14,0.28)] sm:size-16">
        <motion.span
          className="pointer-events-none absolute inset-0 rounded-[22%] bg-lime-accent/0 transition-colors duration-300 group-hover:bg-lime-accent/10"
          aria-hidden
        />
        <img
          src={agent.icon}
          alt=""
          className="relative size-10 object-contain sm:size-11"
          loading="lazy"
          decoding="async"
        />
      </span>
      <div className="min-w-0 px-0.5">
        <p className="truncate font-display text-xs font-medium text-forest sm:text-sm">{agent.name}</p>
        <p className="mt-0.5 hidden font-mono text-[8px] uppercase tracking-[0.14em] text-forest/45 sm:block">
          {agent.subtitle}
        </p>
      </div>
    </motion.div>
  );
}

export default function McpConnectionHub() {
  return (
    <div className="relative flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65 }}
        className="max-w-sm text-center lg:text-left"
      >
        <Badge variant="outline" className="border-forest/15 bg-white/80 font-mono text-[9px] uppercase tracking-[0.18em] text-forest/55">
          Compatible agents
        </Badge>
        <p className="mt-3 font-display text-lg font-medium text-forest sm:text-xl md:text-2xl">
          Plug any MCP client into Obscura
        </p>
        <p className="mt-2 text-sm leading-relaxed text-forest/55">
          Same JSON config for Cursor, Windsurf, VS Code, Claude Desktop, and Cline — one npm install.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="relative flex shrink-0 flex-col items-center"
      >
        <motion.div
          animate={{ scale: [1, 1.04, 1], opacity: [0.35, 0.65, 0.35] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="pointer-events-none absolute -inset-6 rounded-full bg-[radial-gradient(circle,hsl(88_72%_72%/0.45),transparent_70%)]"
          aria-hidden
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -inset-3 rounded-full border border-dashed border-forest/12"
          aria-hidden
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 32, repeat: Infinity, ease: "linear" }}
          className="pointer-events-none absolute -inset-5 rounded-full border border-forest/[0.06]"
          aria-hidden
        />
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="relative grid size-24 place-items-center sm:size-28 md:size-32"
        >
          <img
            src="/brand/obscura-logo-mcp.png"
            alt="Obscura"
            className="size-full object-contain drop-shadow-[0_8px_24px_rgba(24,40,14,0.15)]"
            loading="lazy"
          />
        </motion.div>
        <Badge className="mt-3 border-lime-accent/30 bg-lime-accent/15 font-mono text-[9px] uppercase tracking-wider text-forest hover:bg-lime-accent/20">
          @obscura-fhe/mcp
        </Badge>

        <div className="pointer-events-none absolute left-full top-1/2 hidden -translate-y-1/2 lg:flex lg:items-center" aria-hidden>
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              animate={{ opacity: [0.2, 1, 0.2], x: [0, 12, 24] }}
              transition={{ duration: 1.8, repeat: Infinity, delay: dot * 0.35, ease: "easeInOut" }}
              className="absolute size-1.5 rounded-full bg-lime-accent/80"
            />
          ))}
          <span className="ml-2 h-px w-16 bg-gradient-to-r from-forest/20 to-transparent" />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 16 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.65, delay: 0.15 }}
        className="w-full rounded-2xl border border-forest/10 bg-sage-1/70 p-3 sm:p-5 lg:max-w-none lg:flex-1"
      >
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-4">
          {AGENTS.map((_, i) => (
            <AgentTile key={AGENTS[i].name} index={i} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
