import { runDocumentationServer } from "./server.js";

runDocumentationServer().catch((err) => {
  console.error("[obscura-mcp-docs] fatal:", err);
  process.exit(1);
});
