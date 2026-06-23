import { existsSync } from "node:fs"
import { loginInteractive } from "./auth.js"
import { loadConfig } from "./config.js"

/**
 * One-time interactive sign-in. Run with `npm run login`. Performs the device-code
 * flow and writes the token cache to disk so the MCP server can acquire tokens
 * silently afterwards.
 */
async function main(): Promise<void> {
  const config = loadConfig()
  if (config.error) {
    process.stderr.write(`${config.error.message}\n`)
    process.exit(1)
  }

  const result = await loginInteractive(config.data)
  if (result.error) {
    process.stderr.write(`Login failed: ${result.error.message}\n`)
    process.exit(1)
  }

  // Verify the cache actually landed on disk before declaring success.
  if (!existsSync(config.data.cachePath)) {
    process.stderr.write(`Login succeeded but no cache file at ${config.data.cachePath} — check directory permissions.\n`)
    process.exit(1)
  }

  process.stderr.write(`Signed in to Microsoft 365. Token cached at ${config.data.cachePath} — you can now use /react-team-status start.\n`)
  process.exit(0)
}

void main()
