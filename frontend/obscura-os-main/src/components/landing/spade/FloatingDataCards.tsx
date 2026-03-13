import { motion } from "framer-motion";
import { Banknote, FileKey2, Hash, Landmark, Lock, Vote as VoteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function ReceiptCard({
  label,
  icon: Icon,
  children,
  className,
}: {
  label: string;
  icon: typeof Hash;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-xl border border-forest/10 bg-white/95 p-2.5 shadow-[0_8px_28px_-10px_rgba(24,40,14,0.12)] backdrop-blur-md sm:p-3",
        "ring-1 ring-white/90 transition-shadow duration-300 hover:shadow-[0_10px_32px_-8px_rgba(24,40,14,0.16)]",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-forest/5 via-lime-accent/55 to-forest/5"
        aria-hidden
      />

      <div className="flex items-center justify-between gap-1.5">
        <div className="flex min-w-0 items-center gap-1.5">
          <span className="grid size-6 shrink-0 place-items-center rounded-md border border-forest/10 bg-sage-2 text-forest">
            <Icon className="size-3" strokeWidth={1.75} />
          </span>
          <p className="truncate font-mono text-[7px] font-semibold uppercase tracking-[0.14em] text-forest/45 sm:text-[8px]">
            {label}
          </p>
        </div>
        <span className="size-1 shrink-0 rounded-full bg-lime-accent shadow-[0_0_6px_rgba(178,235,118,0.5)]" />
      </div>

      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SealedAmountGlyph() {
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {[0.85, 0.55, 0.7, 0.45, 0.65, 0.5].map((scale, i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 2.4, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
          className="h-1.5 rounded-sm bg-gradient-to-b from-lime-accent/75 to-forest/25"
          style={{ width: `${scale * 10}px` }}
        />
      ))}
      <Lock className="ml-0.5 size-2.5 text-forest/35" strokeWidth={1.75} />
    </div>
  );
}

function ModuleSignalCard({
  module,
  title,
  detail,
  status,
  icon,
  featured,
}: {
  module: string;
  title: string;
  detail: string;
  status: React.ReactNode;
  icon: React.ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-forest/10 bg-white/95 px-3.5 py-3 shadow-[0_10px_40px_-12px_rgba(24,40,14,0.12)] backdrop-blur-md ring-1 ring-white/90 sm:px-4 sm:py-3.5",
        featured && "ring-forest/10",
      )}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-forest/15 to-transparent"
        aria-hidden
      />

      <div className="flex items-center gap-2.5">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-forest/10 bg-sage-2 text-forest shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {icon}
        </div>
        <div className="min-w-0 flex-1 text-left">
          <p className="font-mono text-[8px] font-semibold uppercase tracking-[0.18em] text-forest/42">
            {module}
          </p>
          <p className="truncate font-display text-[13px] leading-tight text-forest sm:text-[14px]">
            {title}
          </p>
          <p className="truncate font-mono text-[9px] text-forest/45 sm:text-[10px]">{detail}</p>
        </div>
        <div className="shrink-0 rounded-lg border border-forest/8 bg-sage-1 px-1.5 py-1 font-mono text-[10px] leading-none text-forest/70 sm:text-[11px]">
          {status}
        </div>
      </div>
    </div>
  );
}

function Floater({
  children,
  className,
  delay,
  from = "left",
  hideBelow,
  staggerX = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay: number;
  from?: "left" | "right";
  hideBelow?: "sm" | "md" | "lg" | "never";
  staggerX?: number;
}) {
  const hide =
    hideBelow === "lg"
      ? "hidden lg:block"
      : hideBelow === "md"
        ? "hidden md:block"
        : hideBelow === "sm"
          ? "hidden sm:block"
          : "block";

  return (
    <motion.div
      className={cn("w-full", hide, className)}
      style={from === "right" ? { marginRight: staggerX } : { marginLeft: staggerX }}
      initial={{ opacity: 0, x: from === "left" ? -10 : 10, y: 6 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.75, delay }}
    >
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 5 + delay, repeat: Infinity, ease: "easeInOut" }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function CardStack({
  side,
  className,
  children,
}: {
  side: "left" | "right";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "absolute top-1/2 z-20 flex -translate-y-1/2 flex-col",
        side === "left"
          ? "left-0 w-[min(38vw,168px)] gap-2 sm:w-[168px] sm:gap-2.5 lg:left-[1%] xl:left-[3%]"
          : "right-0 w-[min(48vw,220px)] gap-3 sm:w-[220px] sm:gap-4 lg:right-[1%] xl:right-[3%]",
        className,
      )}
    >
      {children}
    </div>
  );
}

function WideLayout() {
  return (
    <>
      <CardStack side="left">
        <Floater delay={0.25} from="left" staggerX={0}>
          <ReceiptCard label="Transaction ID" icon={Hash}>
            <code className="inline-block rounded-md border border-forest/8 bg-sage-2 px-2 py-1 font-mono text-[10px] tabular-nums text-forest">
              0x8a91…f2c4
            </code>
          </ReceiptCard>
        </Floater>

        <Floater delay={0.4} from="left" staggerX={12} hideBelow="sm">
          <ReceiptCard label="Encrypted amount" icon={Lock}>
            <SealedAmountGlyph />
          </ReceiptCard>
        </Floater>

        <Floater delay={0.55} from="left" staggerX={4} hideBelow="md">
          <ReceiptCard label="View permit" icon={FileKey2}>
            <div className="space-y-1">
              <span className="inline-flex rounded-full border border-forest/10 bg-sage-2 px-1.5 py-0.5 font-mono text-[8px] font-medium text-forest/70">
                EIP-712 · Signed
              </span>
              <p className="font-mono text-[9px] leading-snug text-forest/75">
                Viewer <span className="text-forest/45">·</span> 0xAa…7b <span className="text-forest/45">·</span> 5m
              </p>
            </div>
          </ReceiptCard>
        </Floater>
      </CardStack>

      <CardStack side="right">
        <Floater delay={0.3} from="right" staggerX={0} hideBelow="md">
          <ModuleSignalCard
            featured
            module="Obscura Pay"
            title="Payroll stream"
            detail="ocUSDC · cycle sealed"
            status={<span className="tracking-[0.16em] text-lime-accent/80">████</span>}
            icon={<Banknote className="size-4 stroke-[1.5]" />}
          />
        </Floater>

        <Floater delay={0.45} from="right" staggerX={10} hideBelow="md">
          <ModuleSignalCard
            module="Obscura Credit"
            title="Vault position"
            detail="Health · FHE compute"
            status={
              <span className="flex gap-0.5" aria-hidden>
                {[0, 1, 2, 3].map((i) => (
                  <span key={i} className="size-1.5 rounded-full bg-lime-accent/55" />
                ))}
              </span>
            }
            icon={<Landmark className="size-4 stroke-[1.5]" />}
          />
        </Floater>

        <Floater delay={0.6} from="right" staggerX={4} hideBelow="md">
          <ModuleSignalCard
            module="Obscura Vote"
            title="Proposal #014"
            detail="Ballot · homomorphic"
            status={<span className="font-semibold text-lime-accent">✓</span>}
            icon={<VoteIcon className="size-4 stroke-[1.5]" />}
          />
        </Floater>
      </CardStack>
    </>
  );
}

type FloatingDataCardsProps = {
  variant?: "centered" | "wide";
};

export default function FloatingDataCards({ variant = "wide" }: FloatingDataCardsProps) {
  void variant;
  return <WideLayout />;
}
