# Changelog

## [1.0.2] - 2026-05-30

### Fixed
- Cursor/README setup uses `node` + `dist/*.js` (Windows-compatible)
- Docs portal bundle includes `/docs/mcp` page (14 pages)

## [1.0.1] - 2026-05-30

### Fixed
- Publish `@obscura-fhe/sdk` as npm dependency (^1.0.2) instead of local file path
- Bin entry paths for cross-platform npm install

## [1.0.0] - 2026-05-30

### Added

- **User MCP** (`obscura-mcp-user`) — privacy-first wallet agent tools via `@obscura-fhe/sdk`
- **Developer MCP** (`obscura-mcp-dev`) — local repo inspection with secret denylist
- **Documentation MCP** (`obscura-mcp-docs`) — official docs portal (14 pages)
- Privacy guard, rate limiting, mandatory agent prompts
- Stdio transport for Cursor, Claude Desktop, VS Code MCP clients
