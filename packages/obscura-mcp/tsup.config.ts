import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "obscura-mcp-user": "src/user/index.ts",
    "obscura-mcp-dev": "src/developer/index.ts",
    "obscura-mcp-docs": "src/documentation/index.ts",
  },
  format: ["esm"],
  target: "node20",
  clean: true,
  dts: false,
  sourcemap: true,
  banner: {
    js: "#!/usr/bin/env node",
  },
  noExternal: [],
});
