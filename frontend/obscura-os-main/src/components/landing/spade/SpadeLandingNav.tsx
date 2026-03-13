import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import NavRightSlot from "@/components/elite/NavRightSlot";
import ObscuraLogo from "@/components/brand/ObscuraLogo";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Download", href: "/download" },
  { label: "Privacy", href: "/privacy" },
  { label: "Docs", href: "/docs" },
] as const;

const navLinkClass =
  "font-mono text-xs font-semibold uppercase tracking-[0.16em] text-[#0a0f08] transition-opacity hover:opacity-70";

const launchAppClass =
  "hidden inline-flex items-center justify-center rounded-full bg-forest px-6 py-2.5 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-accent transition-opacity hover:opacity-90 sm:inline-flex";

export default function SpadeLandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (location.pathname !== "/" || !location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
    }
  }, [location.pathname, location.hash]);

  const handleNavClick = (href: string) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.includes("#")) return;
    const [path, hash] = href.split("#");
    if (path !== "/" && path !== "") return;
    if (location.pathname !== "/") return;
    event.preventDefault();
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.replaceState(null, "", `/#${hash}`);
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky inset-x-0 top-0 z-50 h-14 w-full bg-white transition-shadow duration-300 sm:h-16",
        scrolled && "shadow-sm shadow-black/5",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-5 lg:px-8">
        <Link to="/" className="inline-flex shrink-0" aria-label="Obscura home">
          <ObscuraLogo size="nav" tone="light" />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex lg:gap-8" aria-label="Main navigation">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={navLinkClass}
              onClick={handleNavClick(link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/home" className={launchAppClass}>
            Launch App
          </Link>
          <NavRightSlot tone="light" />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-9 shrink-0 border-forest/15 lg:hidden"
                aria-label="Open menu"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,320px)] border-forest/10 bg-white">
              <SheetHeader>
                <SheetTitle className="text-left font-display text-lg text-forest">Menu</SheetTitle>
              </SheetHeader>
              <nav className="mt-6 flex flex-col gap-1" aria-label="Mobile navigation">
                {NAV_LINKS.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.href}
                      href={link.href}
                      onClick={(event) => {
                        handleNavClick(link.href)(event);
                        setMenuOpen(false);
                      }}
                      className="rounded-lg px-3 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-forest transition-colors hover:bg-sage-1"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="rounded-lg px-3 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-forest transition-colors hover:bg-sage-1"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
                <Link
                  to="/home"
                  onClick={() => setMenuOpen(false)}
                  className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 py-3 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-lime-accent"
                >
                  Launch App
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
