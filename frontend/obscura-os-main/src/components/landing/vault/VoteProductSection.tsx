import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ProductHowItWorksScroll } from "./ProductHowItWorksScroll";
import { VOTE_HOW_IT_WORKS } from "./productHowItWorksConfigs";

const ease = [0.16, 1, 0.3, 1] as const;

export function VoteProductSection() {
  return (
    <section id="vote" className="relative scroll-mt-24">
      <div className="border-y border-border-subtle bg-surface py-32 md:py-44">
        <div className="mx-auto max-w-[1400px] px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.75, ease }}
            className="max-w-3xl"
          >
            <div className="tag-bracket mb-5">▸ Obscura Govern</div>
            <h2 className="font-display text-4xl leading-[1.05] tracking-tight md:text-5xl">
              Confidential governance,
              <br />
              <span className="text-brand">encrypted ballots on public chains.</span>
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Obscura Govern is the voting layer of the Harmony workspace: browse proposals with public
              metadata, cast multi-option encrypted ballots, delegate voting power, and direct treasury
              flows — plus an executable OpenZeppelin Governor track. Participation feeds shared
              reputation across Pay, Credit, and Govern.
            </p>
            <Link
              to="/vote"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-medium text-brand-ink transition-opacity hover:opacity-90"
            >
              Open Obscura Govern
              <ArrowUpRight className="size-4" />
            </Link>
          </motion.div>
        </div>
      </div>

      <ProductHowItWorksScroll config={VOTE_HOW_IT_WORKS} />
    </section>
  );
}
