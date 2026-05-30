#!/usr/bin/env node
/**
 * User MCP smoke test — simulates a fresh npm install + stdio tool calls.
 * Usage:
 *   node scripts/smoke-test-user-mcp.mjs
 *   OBSCURA_AGENT_TOKEN=obsc_at_... node scripts/smoke-test-user-mcp.mjs
 */
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const MCP_VERSION = "1.0.4";
const SDK_VERSION = "1.0.4";
const API_URL = process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com";
const AGENT_TOKEN = process.env.OBSCURA_AGENT_TOKEN?.trim();

async function mcpRequest(serverPath, cwd, env, method, params = {}) {
  const proc = spawn("node", [serverPath], { cwd, env: { ...process.env, ...env }, stdio: ["pipe", "pipe", "pipe"] });

  const send = (msg) => proc.stdin.write(JSON.stringify(msg) + "\n");

  send({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "smoke-test", version: "1.0.0" } } });
  send({ jsonrpc: "2.0", method: "notifications/initialized" });

  const callId = 2;
  send({ jsonrpc: "2.0", id: callId, method: "tools/call", params: { name: method, arguments: params } });

  proc.stdin.end();

  let stdout = "";
  for await (const chunk of proc.stdout) stdout += chunk;

  const lines = stdout.trim().split("\n").filter(Boolean);
  const response = lines.map((l) => { try { return JSON.parse(l); } catch { return null; } }).find((m) => m?.id === callId);

  await new Promise((resolve) => proc.on("close", resolve));

  if (!response) throw new Error(`No MCP response for ${method}\n${stdout}`);
  if (response.error) throw new Error(`${method}: ${response.error.message ?? JSON.stringify(response.error)}`);
  return JSON.parse(response.result.content[0].text);
}

async function main() {
  const dir = await mkdtemp(join(tmpdir(), "obscura-mcp-smoke-"));
  console.log(`[smoke] temp project: ${dir}`);

  try {
    const npmInstall = spawn("npm", ["install", `@obscura-fhe/mcp@${MCP_VERSION}`, `@obscura-fhe/sdk@${SDK_VERSION}`, "--no-save"], {
      cwd: dir,
      stdio: "inherit",
      shell: true,
    });
    await new Promise((resolve, reject) => {
      npmInstall.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`npm install failed (${code})`))));
    });

    const serverPath = join(dir, "node_modules", "@obscura-fhe", "mcp", "dist", "obscura-mcp-user.js");
    const env = { OBSCURA_API_URL: API_URL, ...(AGENT_TOKEN ? { OBSCURA_AGENT_TOKEN: AGENT_TOKEN } : {}) };

    console.log("[smoke] user_health_api …");
    const health = await mcpRequest(serverPath, dir, env, "user_health_api");
    console.log("  ✓", health.status, health.service);

    console.log("[smoke] user_get_chain_config …");
    const cfg = await mcpRequest(serverPath, dir, env, "user_get_chain_config");
    console.log("  ✓ apiUrl:", cfg.apiUrl, "| agentTokenConfigured:", cfg.agentTokenConfigured);

    console.log("[smoke] vote_get_proposal_count …");
    const votes = await mcpRequest(serverPath, dir, env, "vote_get_proposal_count");
    console.log("  ✓ proposalCount:", votes.proposalCount);

    if (AGENT_TOKEN) {
      console.log("[smoke] user_get_agent_identity …");
      const id = await mcpRequest(serverPath, dir, env, "user_get_agent_identity");
      console.log("  ✓ wallet:", id.wallet, "| permissions:", id.permissions.join(", "));

      console.log("[smoke] reputation_get_summary …");
      const rep = await mcpRequest(serverPath, dir, env, "reputation_get_summary");
      console.log("  ✓ tier:", rep.tier, "| weight:", rep.totalCappedWeight);

      console.log("[smoke] activity_list_for_wallet …");
      const act = await mcpRequest(serverPath, dir, env, "activity_list_for_wallet", { pageSize: 5 });
      console.log("  ✓ items:", act.items.length, "| hasMore:", act.hasMore);
    } else {
      console.log("[smoke] SKIP authenticated tools — set OBSCURA_AGENT_TOKEN to test wallet-scoped reads");
      console.log("[smoke] reputation_get_summary without token (expect error) …");
      try {
        await mcpRequest(serverPath, dir, env, "reputation_get_summary");
        console.log("  ✗ should have failed without token");
        process.exitCode = 1;
      } catch (e) {
        console.log("  ✓ correctly rejected:", String(e.message).slice(0, 80));
      }
    }

    console.log("\n[smoke] All checks passed.");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

main().catch((e) => {
  console.error("[smoke] FAILED:", e.message);
  process.exit(1);
});
