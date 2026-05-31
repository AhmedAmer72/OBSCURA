#!/usr/bin/env node
/**
 * Production agent-auth audit — run against live API with AGENT_AUTH_LEGACY_PUBLIC=false.
 *
 * Usage:
 *   node scripts/production-agent-auth-audit.mjs
 *   OBSCURA_AGENT_TOKEN=obsc_at_... node scripts/production-agent-auth-audit.mjs
 */
const API = (process.env.OBSCURA_API_URL ?? "https://obscura-api-n62v.onrender.com").replace(/\/$/, "");
const TOKEN = process.env.OBSCURA_AGENT_TOKEN?.trim();
const VICTIM = "0x0000000000000000000000000000000000000001";
const OTHER = "0x1111111111111111111111111111111111111111";

const results = [];

function record(name, pass, detail) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchJson(path, init = {}) {
  const res = await fetch(`${API}${path}`, init);
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

async function main() {
  console.log(`[audit] API: ${API}\n`);

  // Health
  const health = await fetchJson("/health");
  record("GET /health", health.status === 200, `status=${health.status}`);

  // Legacy routes without token → 401
  for (const path of [`/reputation/${VICTIM}`, `/activity/${VICTIM}`]) {
    const r = await fetchJson(path);
    record(`Legacy ${path} without token → 401`, r.status === 401, `got ${r.status}`);
  }

  // Agent routes without token → 401
  for (const path of ["/agent/me", "/agent/reputation", "/agent/activity"]) {
    const r = await fetchJson(path);
    record(`${path} without token → 401`, r.status === 401, `got ${r.status}`);
  }

  // Legacy prefs without token → 401 when AGENT_AUTH_LEGACY_PUBLIC=false
  const prefsLegacy = await fetchJson(`/prefs/${VICTIM}`);
  record("Legacy GET /prefs/:wallet without token → 401", prefsLegacy.status === 401, `got ${prefsLegacy.status}`);

  const agentPrefs = await fetchJson("/agent/prefs");
  record("GET /agent/prefs without token → 401", agentPrefs.status === 401, `got ${agentPrefs.status}`);

  // Notifications prefs — authenticated route (no unauthenticated read)
  record(
    "Unauthenticated prefs read blocked",
    prefsLegacy.status === 401 && agentPrefs.status === 401,
    "legacy + /agent/prefs require auth",
  );

  const debugPush = await fetchJson("/debug/push-test");
  record(
    "GET /debug/push-test disabled in production",
    debugPush.status === 404,
    `got ${debugPush.status}`,
  );

  if (TOKEN) {
    const auth = { headers: { Authorization: `Bearer ${TOKEN}` } };

    const me = await fetchJson("/agent/me", auth);
    record("GET /agent/me with token", me.status === 200 && me.body?.wallet, `wallet=${me.body?.wallet}`);

    const ownerWallet = me.body?.wallet?.toLowerCase();
    if (ownerWallet) {
      // Cross-wallet legacy with valid token → 403
      const crossRep = await fetchJson(`/reputation/${OTHER}`, auth);
      record("Cross-wallet GET /reputation/:other with token → 403", crossRep.status === 403, `got ${crossRep.status}`);

      const crossAct = await fetchJson(`/activity/${OTHER}`, auth);
      record("Cross-wallet GET /activity/:other with token → 403", crossAct.status === 403, `got ${crossAct.status}`);

      // Own wallet legacy with token → 200
      const ownRep = await fetchJson(`/reputation/${ownerWallet}`, auth);
      record("Own-wallet GET /reputation/:self with token", ownRep.status === 200, `got ${ownRep.status}`);

      const agentRep = await fetchJson("/agent/reputation", auth);
      record("GET /agent/reputation", agentRep.status === 200, `tier=${agentRep.body?.tier}`);

      const agentAct = await fetchJson("/agent/activity?pageSize=3", auth);
      record("GET /agent/activity", agentAct.status === 200, `items=${agentAct.body?.items?.length ?? 0}`);
    }
  } else {
    console.log("\n[audit] Set OBSCURA_AGENT_TOKEN to run authenticated + cross-wallet tests.");
  }

  const failed = results.filter((r) => !r.pass);
  console.log(`\n[audit] ${results.length - failed.length}/${results.length} passed`);
  if (failed.length) {
    console.log("[audit] FAILED:");
    for (const f of failed) console.log(`  - ${f.name}: ${f.detail}`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("[audit] error:", e);
  process.exit(1);
});
