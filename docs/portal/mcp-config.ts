/** Shared MCP server definitions for IDE setup docs */

const USER_ENV = {
  OBSCURA_API_URL: "https://obscura-api-n62v.onrender.com",
} as const;

export const MCP_SERVERS = {
  "obscura-user": {
    command: "node",
    args: ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-user.js"],
    env: { ...USER_ENV },
  },
  "obscura-dev": {
    command: "node",
    args: ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-dev.js"],
    env: { OBSCURA_REPO_ROOT: "${OBSCURA_REPO_ROOT}" },
  },
  "obscura-docs": {
    command: "node",
    args: ["./node_modules/@obscura-fhe/mcp/dist/obscura-mcp-docs.js"],
  },
} as const;

export function mcpConfigJson(): string {
  return JSON.stringify({ mcpServers: MCP_SERVERS }, null, 2);
}

/** Claude Desktop wraps under top-level mcpServers (same shape) */
export function claudeDesktopConfig(): string {
  return mcpConfigJson();
}

/** Continue.dev config fragment */
export function continueConfig(): string {
  return JSON.stringify(
    {
      mcpServers: Object.fromEntries(
        Object.entries(MCP_SERVERS).map(([name, srv]) => [
          name,
          {
            command: srv.command,
            args: srv.args,
            env: "env" in srv ? srv.env : undefined,
          },
        ]),
      ),
    },
    null,
    2,
  );
}

/** Generic stdio — any agent that accepts command + args + env */
export function genericStdioExample(profile: "user" | "dev" | "docs"): string {
  const bin = `obscura-mcp-${profile === "dev" ? "dev" : profile === "docs" ? "docs" : "user"}`;
  const lines = [
    "# After: npm install @obscura-fhe/mcp",
    `command: node`,
    `args: ./node_modules/@obscura-fhe/mcp/dist/${bin}.js`,
    `transport: stdio`,
  ];
  if (profile === "user") {
    lines.push("env.OBSCURA_API_URL: https://obscura-api-n62v.onrender.com");
    lines.push("env.OBSCURA_RPC_URL: (optional) Arbitrum Sepolia RPC override");
  }
  if (profile === "dev") {
    lines.push("env.OBSCURA_REPO_ROOT: /path/to/Obscura");
  }
  return lines.join("\n");
}
