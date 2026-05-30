/**
 * Smoke test: Documentation MCP via official MCP client SDK.
 */
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const serverPath = join(root, "dist/obscura-mcp-docs.js");

const proc = spawn(process.execPath, [serverPath], { stdio: ["pipe", "pipe", "inherit"] });
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [serverPath],
  stderr: "inherit",
});
// StdioClientTransport spawns its own process — kill our manual proc
proc.kill();

const client = new Client({ name: "smoke-test", version: "1.0.0" });

try {
  await client.connect(transport);
  const { tools } = await client.listTools();
  const names = tools.map((t) => t.name);
  if (!names.includes("docs_list_pages")) {
    throw new Error(`docs_list_pages missing. Got: ${names.join(", ")}`);
  }
  const result = await client.callTool({ name: "docs_list_pages", arguments: {} });
  const text = result.content?.[0]?.type === "text" ? result.content[0].text : "";
  if (!text.includes("mcp")) {
    throw new Error("mcp slug not found in docs_list_pages response");
  }
  console.log(`OK: Documentation MCP smoke test passed (${names.length} tools, mcp page present)`);
  await client.close();
  process.exit(0);
} catch (err) {
  console.error("FAIL:", err instanceof Error ? err.message : err);
  await client.close().catch(() => {});
  process.exit(1);
}
