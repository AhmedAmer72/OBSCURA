import { runDeveloperServer } from "./server.js";

runDeveloperServer().catch((err) => {
  console.error("[obscura-mcp-dev] fatal:", err);
  process.exit(1);
});
