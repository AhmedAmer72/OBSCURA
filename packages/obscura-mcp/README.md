# @obscura-fhe/mcp

Production-grade [Model Context Protocol](https://modelcontextprotocol.io) servers for Obscura — three isolated profiles optimized for privacy, FHE boundaries, and developer safety.

## Profiles

| Binary | Audience | Live user data | Secrets |
|--------|----------|----------------|---------|
| `obscura-mcp-user` | End-user wallet agents | Wallet-scoped reads | Supabase anon (server env only) |
| `obscura-mcp-dev` | Contributors / auditors | None | None (denylist enforced) |
| `obscura-mcp-docs` | Integrators learning Obscura | None | None (static portal) |

## Install

```bash
npm install @obscura-fhe/mcp @obscura-fhe/sdk
```

Requires Node.js 20+.

## Cursor configuration

Add to `.cursor/mcp.json` (or project MCP settings):

```json
{
  "mcpServers": {
    "obscura-user": {
      "command": "node",
      "args": ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js"],
      "env": {
        "OBSCURA_SUPABASE_ANON_KEY": "your-anon-key",
        "OBSCURA_API_URL": "https://obscura-api-n62v.onrender.com"
      }
    },
    "obscura-dev": {
      "command": "node",
      "args": ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-dev.js"],
      "env": {
        "OBSCURA_REPO_ROOT": "D:/route/Obscura"
      }
    },
    "obscura-docs": {
      "command": "node",
      "args": ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-docs.js"]
    }
  }
}
```

After `npm install @obscura-fhe/mcp`, use `node` + `dist/*.js` (recommended on Windows). Or: `npx -y -p @obscura-fhe/mcp obscura-mcp-docs`.

## Claude Desktop

```json
{
  "mcpServers": {
    "obscura-docs": {
      "command": "node",
      "args": ["path/to/node_modules/@obscura-fhe/mcp/dist/obscura-mcp-docs.js"]
    }
  }
}
```

## User MCP tools (privacy-first)

- `user_health_api`, `user_get_chain_config`
- `pay_get_encrypted_balance_handle` — opaque ctHash only, never decrypted
- `pay_build_shield`, `pay_build_unshield`, `pay_build_transfer` — pre-encrypted `InEuint64` required
- `credit_get_market_utilization` — public aggregates only
- `credit_build_supply_collateral`, `credit_build_borrow`, `credit_build_repay`
- `vote_get_proposal_count`, `vote_get_proposal`, `vote_build_cast_vote`, `vote_build_delegate`
- `reputation_get_summary`, `activity_list_for_wallet` (max 25 rows)
- `user_encode_call` — unsigned calldata for external wallet signing

**Never exposed:** decrypt, relay, keeper, worker health, notification writes, bulk activity scans.

## Developer MCP

Reads local repo files with denylist (`.env`, secrets). Tools: `dev_read_file`, `dev_get_deployment_registry`, `dev_get_sanitize_rules`, `dev_get_api_routes`, and more.

Set `OBSCURA_REPO_ROOT` to your Obscura clone path.

## Documentation MCP

Serves the official [docs portal](https://obscuraos.online/docs) — 14 curated pages. No chain RPC or Supabase.

Tools: `docs_list_pages`, `docs_get_page`, `docs_search`, `docs_get_privacy_summary`, etc.

## Environment variables (User MCP)

| Variable | Required | Description |
|----------|----------|-------------|
| `OBSCURA_SUPABASE_ANON_KEY` | For activity | Anon key only — never service role |
| `OBSCURA_API_URL` | No | Default: production API |
| `OBSCURA_RPC_URL` | No | Default: Arbitrum Sepolia |
| `OBSCURA_PRIVACY_MODE` | No | `standard` or `strict` |

## Privacy rules

1. Never decrypt FHE values in MCP
2. Display encrypted handles as `***` — user reveals in Obscura UI
3. Encrypted writes require EOA wallet (not smart accounts)
4. Use pre-encrypted `InEuint64` from browser CoFHE SDK

## Development

```bash
cd packages/obscura-mcp
npm install
npm run build
npm test
```

## License

MIT
