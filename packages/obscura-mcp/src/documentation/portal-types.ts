/** Minimal docs portal types (mirrors docs/portal/types.ts) */

export type DocBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; level: 2 | 3; text: string; id?: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; language: string; code: string; title?: string }
  | { type: "callout"; variant: "info" | "warning" | "tip" | "success"; title: string; text: string }
  | { type: "diagram"; title: string; mermaid: string }
  | { type: "cards"; items: { title: string; description: string; href?: string }[] }
  | { type: "link-grid"; items: { label: string; href: string; description?: string }[] }
  | { type: "visual"; variant: string }
  | { type: "steps"; items: { title: string; description: string; href?: string }[] }
  | { type: "scale"; metrics: { label: string; value: string; detail?: string }[] };

export interface DocPage {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords?: string[];
  blocks: DocBlock[];
}

export interface DocNavItem {
  slug: string;
  label: string;
}

export interface DocNavGroup {
  title: string;
  items: DocNavItem[];
}

export interface DocSearchEntry {
  slug: string;
  title: string;
  description: string;
  category: string;
  excerpt: string;
}
