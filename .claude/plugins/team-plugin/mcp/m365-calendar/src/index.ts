import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { getAccessTokenSilent } from "./auth.js"
import { loadConfig } from "./config.js"
import { getTodaysMeetings } from "./graph.js"
import { logger } from "./logger.js"

type ToolResult = {
  content: Array<{ type: "text"; text: string }>
  isError?: boolean
}

function text(value: string): ToolResult {
  return { content: [{ type: "text", text: value }] }
}

function failure(message: string): ToolResult {
  return { content: [{ type: "text", text: message }], isError: true }
}

const server = new McpServer({ name: "m365-calendar", version: "1.0.0" })

server.registerTool(
  "get_todays_meetings",
  {
    title: "Get today's meetings",
    description:
      "Returns the titles and start times of today's Microsoft 365 (Teams/Outlook) " +
      "calendar meetings, filtered to non-cancelled, non-declined, non-all-day events. " +
      "Use this to populate the 'Others' list in a daily status update.",
  },
  async (): Promise<ToolResult> => {
    const config = loadConfig()
    if (config.error) return failure(config.error.message)

    const token = await getAccessTokenSilent(config.data)
    if (token.error) return failure(token.error.message)

    const meetings = await getTodaysMeetings(token.data)
    if (meetings.error) return failure(meetings.error.message)

    if (meetings.data.length === 0) {
      return text("No meetings on your Microsoft 365 calendar today.")
    }

    const lines = meetings.data.map((meeting) => {
      const time = meeting.start ? ` (${meeting.start})` : ""
      return `- ${meeting.subject}${time}`
    })
    return text(`Today's meetings:\n${lines.join("\n")}`)
  },
)

async function main(): Promise<void> {
  await server.connect(new StdioServerTransport())
  logger.info("m365-calendar MCP server connected")
}

main().catch((caught: unknown) => {
  const message = caught instanceof Error ? caught.message : String(caught)
  logger.error("server failed to start", { error: message })
  process.exit(1)
})
