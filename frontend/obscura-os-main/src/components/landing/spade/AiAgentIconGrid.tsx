import { motion } from "framer-motion";

export const AGENTS = [
  {
    name: "Cursor",
    subtitle: "IDE · MCP",
    icon: "/images/ai/cursor.png",
  },
  {
    name: "Codex",
    subtitle: "OpenAI · MCP",
    icon: "/images/ai/codex.png",
  },
  {
    name: "Claude Code",
    subtitle: "Anthropic · MCP",
    icon: "/images/ai/claude-code.png",
  },
  {
    name: "ChatGPT",
    subtitle: "Desktop · MCP",
    icon: "/images/ai/chatgpt.png",
  },
  {
    name: "Antigravity",
    subtitle: "Google · MCP",
    icon: "/images/ai/antigravity.png",
  },
  {
    name: "OpenClaw",
    subtitle: "Agent · MCP",
    icon: "/images/ai/openclaw.png",
  },
] as const;

export default function AiAgentIconGrid({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3"
          : "grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-4"
      }
    >
      {AGENTS.map((agent, i) => (
        <motion.div
          key={agent.name}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ y: -3 }}
          className="group flex flex-col items-center gap-2.5 text-center"
        >
          <span
            className={`relative grid place-items-center overflow-hidden rounded-[22%] bg-white shadow-[0_8px_24px_-8px_rgba(24,40,14,0.18)] ring-1 ring-forest/8 transition-shadow duration-300 group-hover:shadow-[0_14px_32px_-10px_rgba(24,40,14,0.22)] ${
              compact ? "size-12 sm:size-14" : "size-16 sm:size-[4.5rem] md:size-20"
            }`}
          >
            <img
              src={agent.icon}
              alt=""
              className={`object-contain ${compact ? "size-9 sm:size-10" : "size-11 sm:size-14 md:size-16"}`}
              loading="lazy"
              decoding="async"
            />
          </span>
          <div className="min-w-0">
            <p
              className={`truncate font-display font-medium text-forest ${
                compact ? "text-[11px]" : "text-xs sm:text-sm"
              }`}
            >
              {agent.name}
            </p>
            {!compact && (
              <p className="mt-0.5 hidden font-mono text-[9px] uppercase tracking-[0.14em] text-forest/45 sm:block">
                {agent.subtitle}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
