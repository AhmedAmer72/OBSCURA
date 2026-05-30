import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerDeveloperPrompts,
  registerDeveloperResources,
  registerDeveloperTools,
} from "./tools.js";

export function createDeveloperServer(): McpServer {
  const server = new McpServer({
    name: "obscura-mcp-dev",
    version: "1.0.0",
  });
  registerDeveloperTools(server);
  registerDeveloperResources(server);
  registerDeveloperPrompts(server);
  return server;
}

export async function runDeveloperServer(): Promise<void> {
  const server = createDeveloperServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
