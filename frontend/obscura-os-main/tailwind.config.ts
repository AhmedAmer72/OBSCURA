import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  // Safelist dynamic classes used by elite/* components (accent={emerald|cyan|violet}).
  safelist: [
    // Text colors
    "text-emerald-400", "text-cyan-400", "text-violet-400",
    // Backgrounds (10-15-20 alpha)
    "bg-emerald-500/5", "bg-emerald-500/10", "bg-emerald-500/15", "bg-emerald-500/20",
    "bg-cyan-500/5", "bg-cyan-500/10", "bg-cyan-500/15", "bg-cyan-500/20",
    "bg-violet-500/5", "bg-violet-500/10", "bg-violet-500/15", "bg-violet-500/20",
    // Borders
    "border-emerald-500/20", "border-emerald-500/30", "border-emerald-500/40",
    "border-cyan-500/20", "border-cyan-500/30", "border-cyan-500/40",
    "border-violet-500/20", "border-violet-500/30", "border-violet-500/40",
    // Hover borders
    "hover:border-emerald-500/30", "hover:border-cyan-500/30", "hover:border-violet-500/30",
    // Sidebar dot
    "bg-emerald-400", "bg-cyan-400", "bg-violet-400",
    // Gradient via classes used in DashboardShell
    "via-emerald-500/60", "via-cyan-500/60", "via-violet-500/60",
    // Glow shadows
    "shadow-[0_0_20px_rgba(34,197,94,0.25)]",
    "shadow-[0_0_20px_rgba(6,182,212,0.25)]",
    "shadow-[0_0_20px_rgba(139,92,246,0.25)]",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', '"Sora"', '"Inter"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '"Inter"', 'system-ui', 'sans-serif'],
        brand: ['"Sora"', '"Inter"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
        body: ['"DM Sans"', '"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        ui: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        spadeDisplay: ['"Sora"', 'sans-serif'],
        spadeBody: ['"Inter"', 'sans-serif'],
        editorial: ['"Cormorant Garamond"', '"Sora"', 'serif'],
      },
      colors: {
        'obscura-bg': '#F9F9F7',
        'obscura-surface': '#FFFFFF',
        'obscura-surface-2': '#F4F4F1',
        'obscura-border': '#E5E5E2',
        'obscura-text': '#111110',
        'obscura-text-2': '#6B6B65',
        'obscura-text-muted': '#9B9B95',
        'obscura-green': '#1C4D3E',
        'obscura-green-light': '#E8F2EE',
        'obscura-green-mid': '#2D6B55',
        'obscura-mask': '#C8C8C4',
        'obscura-mask-2': '#D8D8D4',
        'obscura-success': '#16A34A',
        'obscura-warning': '#D97706',
        'obscura-danger': '#DC2626',
        'obscura-danger-light': '#FEF2F2',
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        surface: "hsl(var(--surface))",
        success: "hsl(var(--success))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        glow: {
          green: "hsl(var(--glow-green))",
        },
        terminal: {
          green: "hsl(var(--terminal-green))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          elevated: "hsl(var(--vault-surface-elevated))",
          glass: "hsl(var(--surface-glass))",
        },
        cyan: {
          accent: "hsl(var(--accent-cyan))",
        },
        amber: {
          accent: "hsl(var(--accent-amber))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        sage: {
          1: "#F7F9F2",
          2: "#EEF3EA",
          3: "#E4EBDF",
        },
        forest: {
          DEFAULT: "#18280E",
          light: "#2A3D1E",
        },
        lime: {
          accent: "#B2EB76",
        },
        brand: {
          DEFAULT: "hsl(var(--vault-brand))",
          soft: "hsl(var(--vault-brand-soft))",
          ink: "hsl(var(--vault-brand-ink))",
        },
        "border-subtle": "hsl(var(--vault-border-subtle))",
        "surface-elevated": "hsl(var(--vault-surface-elevated))",
        ink: {
          DEFAULT: "var(--vault-ink)",
          elev: "var(--vault-ink-elev)",
          fg: "var(--vault-ink-fg)",
          mute: "var(--vault-ink-muted)",
          accent: "var(--vault-ink-accent)",
        },
        "ink-accent": "var(--vault-ink-accent)",
        "ink-elev": "var(--vault-ink-elev)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        card: "12px",
        tile: "16px",
      },
      boxShadow: {
        tile: "0 1px 3px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)",
        "tile-hover": "0 4px 12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.06)",
        modal: "0 20px 60px rgba(0,0,0,0.14)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "marquee-reverse": {
          "0%": { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        "encrypt-pulse": {
          "0%": { opacity: "1", letterSpacing: "0.05em" },
          "50%": { opacity: "0.6", letterSpacing: "0.15em" },
          "100%": { opacity: "1", letterSpacing: "0.05em" },
        },
        "encrypt-scan": {
          "0%": { backgroundPosition: "-200% center" },
          "100%": { backgroundPosition: "200% center" },
        },
        "encrypt-shimmer": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
        "reveal-dissolve": {
          "0%": { filter: "blur(4px)", opacity: "0", transform: "scale(0.98)" },
          "100%": { filter: "blur(0)", opacity: "1", transform: "scale(1)" },
        },
        "seal-in": {
          "0%": { opacity: "0", transform: "scale(1.02)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "tier-up": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(28,77,62,0)" },
          "50%": { transform: "scale(1.04)", boxShadow: "0 0 0 8px rgba(28,77,62,0.15)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(28,77,62,0)" },
        },
        "fhe-orbit": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-4px)" },
        },
        "ping-slow": {
          "0%": { transform: "scale(1)", opacity: "0.8" },
          "100%": { transform: "scale(2)", opacity: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        marquee: "marquee 55s linear infinite",
        "marquee-reverse": "marquee-reverse 55s linear infinite",
        "encrypt-pulse": "encrypt-pulse 3s ease-in-out infinite",
        "encrypt-scan": "encrypt-scan 2.5s linear infinite",
        "encrypt-shimmer": "encrypt-shimmer 1.8s ease-in-out infinite",
        "reveal-dissolve": "reveal-dissolve 0.4s ease-out forwards",
        "seal-in": "seal-in 0.3s ease-out forwards",
        "tier-up": "tier-up 0.6s ease-out",
        "fhe-orbit": "fhe-orbit 8s linear infinite",
        float: "float 4s ease-in-out infinite",
        "ping-slow": "ping-slow 2s cubic-bezier(0,0,0.2,1) infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
