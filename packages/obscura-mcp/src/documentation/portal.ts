import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { DocNavGroup, DocPage, DocSearchEntry, DocBlock } from "./portal-types.js";

interface PortalBundle {
  navigation: DocNavGroup[];
  pages: DocPage[];
  searchIndex: DocSearchEntry[];
}

let cached: PortalBundle | null = null;

function resolveBundlePath(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const candidates = [
    join(here, "../../resources/portal-bundle.json"),
    join(here, "../resources/portal-bundle.json"),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error("portal-bundle.json not found — run: npm run bundle:docs");
}

function loadBundle(): PortalBundle {
  if (cached) return cached;
  const raw = readFileSync(resolveBundlePath(), "utf8");
  cached = JSON.parse(raw) as PortalBundle;
  return cached;
}

export function getDocNav(): DocNavGroup[] {
  return loadBundle().navigation;
}

export function getDocPages(): DocPage[] {
  return loadBundle().pages;
}

export function buildSearchIndex(): DocSearchEntry[] {
  return loadBundle().searchIndex;
}

export function getPage(slug: string): DocPage | undefined {
  return loadBundle().pages.find((p) => p.slug === slug);
}

export function extractTableFromPage(slug: string, headingIncludes: string): DocBlock | null {
  const page = getPage(slug);
  if (!page) return null;
  for (const block of page.blocks) {
    if (block.type === "table" && block.headers.length > 0) {
      return block;
    }
    if (block.type === "heading" && block.text.toLowerCase().includes(headingIncludes)) {
      const idx = page.blocks.indexOf(block);
      const next = page.blocks[idx + 1];
      if (next?.type === "table") return next;
    }
  }
  return null;
}

export function findCodeBlock(slug: string, titleIncludes?: string): DocBlock | null {
  const page = getPage(slug);
  if (!page) return null;
  for (const block of page.blocks) {
    if (block.type === "code") {
      if (!titleIncludes || block.title?.toLowerCase().includes(titleIncludes.toLowerCase())) {
        return block;
      }
    }
  }
  return null;
}

/** @deprecated use getDocNav() */
export const DOC_NAV = { get length() { return getDocNav().length; } };

/** @deprecated use getDocPages() */
export const DOC_PAGES = { get length() { return getDocPages().length; } };
