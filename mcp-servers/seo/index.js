import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuditTools } from "./tools/audit.js";
import { registerSchemaTools } from "./tools/schema.js";
import { registerMetaTools } from "./tools/meta.js";

const server = new McpServer(
  { name: "sayso-seo", version: "1.0.0" },
  { capabilities: { logging: {} } }
);

registerAuditTools(server);
registerSchemaTools(server);
registerMetaTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
