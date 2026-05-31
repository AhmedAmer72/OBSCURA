import { AlertTriangle } from "lucide-react";

export function VoteAdvancedIntro() {
  return (
    <div className="vote-advanced-intro mb-6 rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3.5 sm:px-5 sm:py-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-800" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">For protocol operators</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Treasury spends and Governor executes are irreversible. Private ballots stay in Proposals — use Treasury
            or Governor below when you need timelock actions.
          </p>
        </div>
      </div>
    </div>
  );
}
