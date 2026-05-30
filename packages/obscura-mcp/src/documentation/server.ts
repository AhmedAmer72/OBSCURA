import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  registerDocumentationPrompts,
  registerDocumentationResources,
  registerDocumentationTools,
} from "./tools.js";

export function createDocumentationServer(): McpServer {
  const server = new McpServer({
    name: "obscura-mcp-docs",
    version: "1.0.0",
  });
  registerDocumentationTools(server);
  registerDocumentationResources(server);
  registerDocumentationPrompts(server);
  return server;
}

export async function runDocumentationServer(): Promise<void> {
  const server = createDocumentationServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
