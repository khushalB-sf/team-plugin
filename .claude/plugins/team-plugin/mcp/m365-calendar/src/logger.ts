/**
 * Structured logger. Writes to stderr only — a stdio MCP server must keep
 * stdout clean for the JSON-RPC stream, so console.log is never used here.
 * Never log secrets (access tokens, refresh tokens, full PII).
 */
type LogFields = Record<string, unknown>

function emit(level: "info" | "error", message: string, fields: LogFields): void {
  const entry = { level, message, ...fields, ts: new Date().toISOString() }
  process.stderr.write(`${JSON.stringify(entry)}\n`)
}

export const logger = {
  info(message: string, fields: LogFields = {}): void {
    emit("info", message, fields)
  },
  error(message: string, fields: LogFields = {}): void {
    emit("error", message, fields)
  },
}
