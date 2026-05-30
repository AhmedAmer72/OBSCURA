import { runUserServer } from "./server.js";

runUserServer().catch((err) => {
  console.error("[obscura-mcp-user] fatal:", err);
  process.exit(1);
});
