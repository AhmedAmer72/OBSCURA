import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerUserPrompts, registerUserResources, registerUserTools } from "./tools.js";

export function createUserServer(): McpServer {
  const server = new McpServer({
    name: "obscura-mcp-user",
    version: "1.0.0",
  });
  registerUserTools(server);
  registerUserResources(server);
  registerUserPrompts(server);
  return server;
}

export async function runUserServer(): Promise<void> {
  const server = createUserServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
