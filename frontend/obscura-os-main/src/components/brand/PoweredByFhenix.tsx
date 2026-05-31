import { cn } from "@/lib/utils";

const FHENIX_URL = "https://www.fhenix.io/";
const FHENIX_LOGO_SRC = "/images/fhenix-logo.svg";

const LOGO_HEIGHT: Record<"hero" | "nav" | "footer" | "app" | "inline", string> = {
  hero: "h-5 sm:h-6",
  nav: "h-3.5 sm:h-4",
  footer: "h-4 brightness-0 invert opacity-90",
  app: "h-3.5",
  inline: "h-3.5",
};

function FhenixLogo({
  variant,
  className,
}: {
  variant: "hero" | "nav" | "footer" | "app" | "inline";
  className?: string;
}) {
  return (
    <img
      src={FHENIX_LOGO_SRC}
      alt="Fhenix"
      className={cn("w-auto shrink-0 object-contain object-left", LOGO_HEIGHT[variant], className)}
      decoding="async"
    />
  );
}

export function PoweredByFhenix({
  variant = "inline",
  compact = false,
  className,
}: {
  variant?: "hero" | "nav" | "footer" | "app" | "inline";
  /** Logo only (e.g. collapsed sidebar). */
  compact?: boolean;
  className?: string;
}) {
  const poweredByClass = cn(
    variant === "hero" || variant === "nav"
      ? "text-forest/65"
      : variant === "footer"
        ? "text-white/55"
        : "text-muted-foreground",
  );

  return (
    <a
      href={FHENIX_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "powered-by-fhenix inline-flex items-center gap-2 no-underline transition-opacity hover:opacity-85",
        variant === "hero" &&
          "rounded-full border border-forest/14 bg-white/90 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] shadow-[0_2px_12px_rgba(24,40,14,0.06)] backdrop-blur-sm hover:border-forest/25",
        variant === "nav" &&
          "rounded-full border border-forest/10 bg-sage-1 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.18em] hover:border-forest/20",
        variant === "footer" &&
          "font-mono text-[10px] uppercase tracking-[0.2em] hover:opacity-100",
        variant === "app" &&
          "mx-3 w-[calc(100%-1.5rem)] justify-center rounded-lg border border-border/80 bg-muted/35 px-3 py-2.5 font-mono text-[9px] uppercase tracking-[0.16em] hover:border-[hsl(var(--dash-forest)/0.2)] hover:bg-[hsl(var(--dash-mint)/0.4)]",
        variant === "inline" &&
          "font-mono text-[10px] uppercase tracking-[0.18em]",
        compact && "justify-center rounded-lg p-2",
        className,
      )}
      aria-label="Powered by Fhenix — opens fhenix.io"
      title="Powered by Fhenix"
    >
      {compact ? (
        <FhenixLogo variant={variant} className="h-4 max-w-[5.25rem]" />
      ) : (
        <>
          <span className={cn("shrink-0", poweredByClass)}>Powered by</span>
          <FhenixLogo variant={variant} />
          {variant === "hero" ? (
            <span className={cn("shrink-0", poweredByClass)}>· CoFHE</span>
          ) : null}
        </>
      )}
    </a>
  );
}
