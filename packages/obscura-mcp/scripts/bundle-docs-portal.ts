import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { DOC_NAV } from "../../../docs/portal/navigation.js";
import { DOC_PAGES, buildSearchIndex } from "../../../docs/portal/index.js";

const root = dirname(fileURLToPath(import.meta.url));
const outPath = join(root, "../resources/portal-bundle.json");

mkdirSync(dirname(outPath), { recursive: true });

writeFileSync(
  outPath,
  JSON.stringify(
    {
      navigation: DOC_NAV,
      pages: DOC_PAGES,
      searchIndex: buildSearchIndex(),
    },
    null,
    2,
  ),
);

console.log(`[bundle-docs-portal] wrote ${outPath} (${DOC_PAGES.length} pages)`);
