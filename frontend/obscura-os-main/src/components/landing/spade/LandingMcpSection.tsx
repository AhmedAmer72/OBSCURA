import { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Bot, Lock, Server, Shield, Sparkles, Terminal } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import McpConnectionHub from "./McpConnectionHub";

const FLOW = [
  {
    step: "01",
    title: "Pick your agent",
    body: "Cursor, Codex, Claude Code, ChatGPT, Antigravity, or any stdio MCP client.",
  },
  {
    step: "02",
    title: "Connect a profile",
    body: "User, Dev, or Docs — three stdio servers from @obscura-fhe/mcp.",
  },
  {
    step: "03",
    title: "Build & sign",
    body: "Agents return unsigned txs. FHE encrypt and reveal stay in the Obscura UI.",
  },
] as const;

const PROFILES = [
  {
    id: "user",
    title: "User MCP",
    tag: "Wallet-scoped",
    body: "Activity, reputation, and encrypted tx builders via bearer agent token — never decrypts sealed balances.",
    tools: ["activity_list_for_wallet", "reputation_get_summary", "pay_build_transfer"],
    cardClass: "border-lime-accent/25 bg-gradient-to-b from-lime-accent/15 to-lime-accent/[0.03]",
    badgeClass: "border-lime-accent/30 bg-lime-accent/10 text-forest",
    icon: Bot,
  },
  {
    id: "dev",
    title: "Dev MCP",
    tag: "Repo context",
    body: "Contract maps, ABIs, and local Obscura clone context for shipping Pay, Credit, and Vote flows.",
    tools: ["dev_list_repo_map", "dev_get_api_routes", "dev_get_sanitize_rules"],
    cardClass: "border-forest/15 bg-gradient-to-b from-white to-sage-1",
    badgeClass: "border-forest/15 bg-white/80 text-forest/70",
    icon: Terminal,
  },
  {
    id: "docs",
    title: "Docs MCP",
    tag: "No secrets",
    body: "Full developer portal in your IDE — SDK reference, privacy model, mobile APK, and agent setup.",
    tools: ["docs_search", "docs_get_page", "docs_list_pages"],
    cardClass: "border-violet-400/25 bg-gradient-to-b from-violet-500/[0.08] to-violet-500/[0.02]",
    badgeClass: "border-violet-400/30 bg-violet-500/10 text-forest/80",
    icon: Server,
  },
] as const;

const BOUNDARY = [
  "User MCP never talks to Supabase — reads go through Obscura API with agent tokens",
  "obscura-worker strips vote choices and sensitive Governor args before indexing",
  "Balance reveal only in Obscura UI — never via MCP",
] as const;

const MCP_CONFIG = `{
  "mcpServers": {
    "obscura-user": {
      "command": "node",
      "args": ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js"],
      "env": {
        "OBSCURA_AGENT_TOKEN": "obsc_at_…"
      }
    }
  }
}`;

export default function LandingMcpSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isMobile = useIsMobile();
  const inView = useInView(sectionRef, { once: true, margin: "-10%" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const glow = useTransform(scrollYProgress, [0.15, 0.55], [0.25, 1]);
  const hubY = useTransform(scrollYProgress, [0.2, 0.6], [24, -12]);

  return (
    <section
      ref={sectionRef}
      id="agents"
      className="relative overflow-hidden border-y border-forest/8 bg-gradient-to-b from-sage-1 via-white to-sage-1 px-4 py-16 sm:px-5 sm:py-20 md:py-28 lg:px-8"
    >
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute -left-24 top-10 size-[480px] rounded-full bg-[radial-gradient(circle,hsl(145_45%_88%/0.4),transparent_68%)]"
        aria-hidden
      />
      <motion.div
        style={{ opacity: glow }}
        className="pointer-events-none absolute -right-16 bottom-0 size-[360px] rounded-full bg-[radial-gradient(circle,hsl(260_60%_88%/0.25),transparent_68%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-[1200px]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mx-auto max-w-3xl text-center"
        >
          <Badge variant="outline" className="border-forest/15 bg-white/70 font-mono text-[10px] uppercase tracking-[0.22em] text-forest/50">
            MCP · AI agents
          </Badge>
          <h2 className="mt-4 font-display text-2xl font-medium leading-[1.08] tracking-tight text-forest sm:text-3xl md:text-4xl lg:text-[2.75rem]">
            Your IDE agent, wired to{" "}
            <span className="text-forest/70">private finance</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-forest/60 md:text-[17px]">
            Three stdio MCP servers wrap <span className="text-foreground/80">@obscura-fhe/sdk</span> — the
            same stack as Obscura. Agents read sanitized activity, build encrypted transactions, and never
            see your balances.
          </p>
        </motion.div>

        <div className="mt-8 flex flex-col gap-3 sm:mt-10 sm:grid sm:grid-cols-3">
          {FLOW.map((item, i) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: 0.08 + i * 0.07 }}
            >
              <Card className="h-full rounded-2xl border-forest/10 bg-white/85 shadow-sm backdrop-blur-sm">
                <CardHeader className="flex flex-col gap-1.5 p-4 sm:p-5">
                  <Badge variant="outline" className="w-fit border-lime-accent/30 bg-lime-accent/10 font-mono text-[10px] uppercase tracking-[0.18em] text-forest/70">
                    {item.step}
                  </Badge>
                  <CardTitle className="font-display text-base font-medium text-forest">{item.title}</CardTitle>
                  <CardDescription className="text-xs leading-relaxed text-forest/55">{item.body}</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div style={isMobile ? undefined : { y: hubY }} className="relative mt-8 sm:mt-10">
          <Card className="overflow-hidden rounded-2xl border-forest/12 bg-white shadow-[0_20px_60px_-24px_rgba(24,40,14,0.18)] sm:rounded-[1.75rem]">
            <CardContent className="p-4 sm:p-8 md:p-10">
              <McpConnectionHub />
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {PROFILES.map((profile, i) => {
            const Icon = profile.icon;
            return (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.2 + i * 0.08 }}
                whileHover={{ y: -4 }}
              >
                <Card className={`flex h-full flex-col rounded-2xl shadow-sm transition-shadow duration-300 hover:shadow-md ${profile.cardClass}`}>
                  <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-5 pb-3">
                    <div className="flex flex-col gap-2">
                      <Badge variant="outline" className={`w-fit font-mono text-[9px] uppercase tracking-wider ${profile.badgeClass}`}>
                        {profile.tag}
                      </Badge>
                      <CardTitle className="font-display text-lg font-medium text-forest">{profile.title}</CardTitle>
                    </div>
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-forest/10 bg-white/80">
                      <Icon className="size-4 text-forest/60" aria-hidden />
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4 p-5 pt-0">
                    <CardDescription className="text-sm leading-relaxed text-forest/65">{profile.body}</CardDescription>
                    <Separator className="bg-forest/8" />
                    <ul className="flex flex-col gap-1.5 font-mono text-[10px] text-forest/55">
                      {profile.tools.map((tool, ti) => (
                        <motion.li
                          key={tool}
                          initial={{ opacity: 0, x: -6 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + ti * 0.05 }}
                          className="flex items-center gap-2"
                        >
                          <span className="size-1 rounded-full bg-lime-accent/70" aria-hidden />
                          {tool}
                        </motion.li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.28 }}
          >
            <Alert className="rounded-2xl border-forest/12 bg-white/90 shadow-[0_8px_30px_-12px_rgba(24,40,14,0.12)]">
              <Lock className="size-4 text-lime-accent" />
              <AlertTitle className="font-mono text-[10px] uppercase tracking-[0.16em] text-forest/45">
                Privacy boundary
              </AlertTitle>
              <AlertDescription>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {BOUNDARY.map((line) => (
                    <li key={line} className="flex gap-2.5 text-sm leading-relaxed text-forest/65">
                      <Shield className="mt-0.5 size-3.5 shrink-0 text-lime-accent/80" aria-hidden />
                      {line}
                    </li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button asChild className="h-11 w-full rounded-full bg-forest font-mono text-[11px] uppercase tracking-[0.14em] text-lime-accent hover:bg-forest/90 sm:w-auto">
                <Link to="/docs/mcp">
                  <Sparkles data-icon="inline-start" />
                  MCP setup guide
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full rounded-full border-forest/18 text-forest hover:border-forest/35 sm:w-auto">
                <Link to="/docs/agents">
                  Create agent token
                  <ArrowRight data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 12 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.65, delay: 0.32 }}
          >
            <Card className="overflow-hidden rounded-2xl border-forest/15 bg-[#0c1208] shadow-[0_20px_50px_-16px_rgba(24,40,14,0.35)]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-white/8 px-4 py-2.5">
                <CardTitle className="font-mono text-[10px] font-normal uppercase tracking-wider text-lime-accent/70">
                  npm install @obscura-fhe/mcp
                </CardTitle>
                <Badge variant="outline" className="border-white/10 bg-transparent font-mono text-[9px] text-white/35">
                  stdio transport
                </Badge>
              </CardHeader>
              <CardContent className="p-0">
                <motion.pre
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="overflow-x-auto p-4 font-mono text-[11px] leading-relaxed text-lime-accent/85 md:text-xs"
                >
                  <code>{MCP_CONFIG}</code>
                </motion.pre>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
