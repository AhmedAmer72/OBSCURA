import type { LucideIcon } from "lucide-react";
import {
  ArrowDownToLine,
  BarChart3,
  Eye,
  Fingerprint,
  Gauge,
  Gavel,
  Inbox,
  LockKeyhole,
  PiggyBank,
  ScrollText,
  Send,
  Shield,
  Users,
  Vote,
  Wallet,
} from "lucide-react";
import type { ObscuraChipTone } from "@/components/landing/ObscuraFeatureIcon";

export type HowItWorksStep = {
  id: string;
  title: string;
  brief: string;
  icon: LucideIcon;
  tone: ObscuraChipTone;
  hint: string;
};

export type HowItWorksAccent = "lime" | "amber" | "violet";

export type ProductHowItWorksConfig = {
  ariaLabel: string;
  headline: string;
  headlineMuted: string;
  description: string;
  steps: HowItWorksStep[];
  accent: HowItWorksAccent;
};

const ACCENT_CLASSES: Record<
  HowItWorksAccent,
  {
    label: string;
    activeStep: string;
    doneStep: string;
    line: string;
    miniCurrent: string;
    miniDone: string;
    hint: string;
    gradient: string;
  }
> = {
  lime: {
    label: "text-lime-accent/75",
    activeStep: "border-lime-accent bg-lime-accent text-forest",
    doneStep: "border-lime-accent/60 bg-lime-accent/20 text-lime-accent",
    line: "bg-lime-accent",
    miniCurrent: "border-lime-accent bg-lime-accent/20 text-lime-accent",
    miniDone: "bg-lime-accent/50",
    hint: "text-lime-accent/90",
    gradient: "radial-gradient(60% 55% at 72% 42%, rgba(178,235,118,0.14), transparent 65%)",
  },
  amber: {
    label: "text-amber-300/80",
    activeStep: "border-amber-300 bg-amber-300 text-forest",
    doneStep: "border-amber-300/60 bg-amber-300/15 text-amber-200",
    line: "bg-amber-300",
    miniCurrent: "border-amber-300 bg-amber-300/15 text-amber-200",
    miniDone: "bg-amber-300/45",
    hint: "text-amber-200/90",
    gradient: "radial-gradient(60% 55% at 72% 42%, rgba(251,191,36,0.12), transparent 65%)",
  },
  violet: {
    label: "text-violet-300/80",
    activeStep: "border-violet-300 bg-violet-300 text-forest",
    doneStep: "border-violet-300/60 bg-violet-300/15 text-violet-200",
    line: "bg-violet-300",
    miniCurrent: "border-violet-300 bg-violet-300/15 text-violet-200",
    miniDone: "bg-violet-300/45",
    hint: "text-violet-200/90",
    gradient: "radial-gradient(60% 55% at 72% 42%, rgba(167,139,250,0.14), transparent 65%)",
  },
};

export function getHowItWorksAccentClasses(accent: HowItWorksAccent) {
  return ACCENT_CLASSES[accent];
}

export const PAY_HOW_IT_WORKS: ProductHowItWorksConfig = {
  ariaLabel: "How Obscura Pay works",
  headline: "Six steps.",
  headlineMuted: "One private payment.",
  description:
    "Scroll to walk through the flow — shield, seal, send, and track without leaving Obscura Pay.",
  accent: "lime",
  steps: [
    {
      id: "wallet",
      title: "Connect wallet",
      brief: "Sign in with the wallet you already use on Arbitrum Sepolia.",
      icon: Wallet,
      tone: "forest",
      hint: "MetaMask · WalletConnect",
    },
    {
      id: "mode",
      title: "Pick your rail",
      brief:
        "Private Mode seals ocUSDC with your EOA. Public Mode uses a passkey smart account for visible USDC.",
      icon: Fingerprint,
      tone: "lime",
      hint: "Private · Public",
    },
    {
      id: "shield",
      title: "Shield USDC",
      brief: "In Private Mode, move public USDC in — your balance becomes encrypted ocUSDC on-chain.",
      icon: Shield,
      tone: "moss",
      hint: "USDC → ocUSDC",
    },
    {
      id: "encrypt",
      title: "Seal the amount",
      brief: "The payment amount is encrypted in your browser before it hits the chain.",
      icon: LockKeyhole,
      tone: "lime",
      hint: "CoFHE · client-side",
    },
    {
      id: "send",
      title: "Send privately",
      brief: "Pay an address or a stealth meta-address — amounts stay hidden.",
      icon: Send,
      tone: "deep",
      hint: "Confidential transfer",
    },
    {
      id: "inbox",
      title: "Track in one place",
      brief: "Receipts, streams, and stealth claims land in your activity inbox.",
      icon: Inbox,
      tone: "forest",
      hint: "Activity · inbox",
    },
  ],
};

export const CREDIT_HOW_IT_WORKS: ProductHowItWorksConfig = {
  ariaLabel: "How Obscura Credit works",
  headline: "Six steps.",
  headlineMuted: "One sealed lending position.",
  description:
    "Scroll through supply, borrow, and health monitoring — collateral and debt stay encrypted until you reveal.",
  accent: "amber",
  steps: [
    {
      id: "wallet",
      title: "Connect wallet",
      brief: "Link the same wallet you use for Pay — Credit reads ocUSDC collateral on Arbitrum Sepolia.",
      icon: Wallet,
      tone: "forest",
      hint: "Shared Harmony wallet",
    },
    {
      id: "markets",
      title: "Browse markets",
      brief: "Market rates, vaults, and liquidation windows are public — no wallet needed to explore.",
      icon: BarChart3,
      tone: "moss",
      hint: "Overview · Borrow · Earn",
    },
    {
      id: "supply",
      title: "Supply collateral",
      brief: "Deposit ocUSDC from Pay into a vault — your supplied balance is encrypted on-chain.",
      icon: PiggyBank,
      tone: "lime",
      hint: "Supply · ocUSDC",
    },
    {
      id: "borrow",
      title: "Borrow privately",
      brief: "Draw against sealed collateral — debt shares stay hidden from observers.",
      icon: ArrowDownToLine,
      tone: "deep",
      hint: "Encrypted borrow",
    },
    {
      id: "health",
      title: "Monitor health",
      brief: "Health factor and borrowing power live on-chain — tap Reveal when you need exact numbers.",
      icon: Gauge,
      tone: "forest",
      hint: "Position · Reveal",
    },
    {
      id: "liquidate",
      title: "Manage risk",
      brief: "Repay, add collateral, or watch liquidation auctions — bids stay sealed until settled.",
      icon: Gavel,
      tone: "moss",
      hint: "Repay · Liquidations",
    },
  ],
};

export const VOTE_HOW_IT_WORKS: ProductHowItWorksConfig = {
  ariaLabel: "How Obscura Govern works",
  headline: "Six steps.",
  headlineMuted: "One encrypted ballot.",
  description:
    "Scroll through proposals, sealed votes, delegation, and treasury — choices stay private until tallies are revealed.",
  accent: "violet",
  steps: [
    {
      id: "wallet",
      title: "Connect wallet",
      brief: "Use your Harmony wallet on Arbitrum Sepolia — voting power ties to your encrypted participation.",
      icon: Wallet,
      tone: "forest",
      hint: "Arbitrum Sepolia",
    },
    {
      id: "proposals",
      title: "Browse proposals",
      brief: "Proposal titles and metadata are public — vote choices and weights stay encrypted on-chain.",
      icon: ScrollText,
      tone: "moss",
      hint: "Proposals · Overview",
    },
    {
      id: "seal",
      title: "Seal your choice",
      brief: "Your ballot is encrypted in the browser before it is submitted — observers cannot see For, Against, or Abstain.",
      icon: LockKeyhole,
      tone: "lime",
      hint: "Multi-option ballot",
    },
    {
      id: "cast",
      title: "Cast privately",
      brief: "Submit the encrypted vote on-chain and earn ballot rewards for every participation.",
      icon: Vote,
      tone: "deep",
      hint: "Cast · Rewards",
    },
    {
      id: "delegate",
      title: "Delegate power",
      brief: "Point voting weight to a delegate without exposing how you voted on past proposals.",
      icon: Users,
      tone: "forest",
      hint: "Delegation tab",
    },
    {
      id: "reveal",
      title: "Reveal totals",
      brief: "When voting closes, aggregate tallies can be revealed — individual ballots stay sealed.",
      icon: Eye,
      tone: "moss",
      hint: "Tally · Treasury",
    },
  ],
};
