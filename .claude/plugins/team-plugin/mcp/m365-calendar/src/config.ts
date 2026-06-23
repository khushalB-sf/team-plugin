import { homedir } from "node:os"
import { join } from "node:path"
import { z } from "zod"
import { type Result, ok, err } from "./result.js"

/** Validated configuration for the Microsoft Graph calendar client. */
export type AppConfig = {
  clientId: string
  tenantId: string
  authority: string
  scopes: string[]
  cachePath: string
}

const envSchema = z.object({
  MS_CLIENT_ID: z
    .string({ required_error: "MS_CLIENT_ID is required (Azure AD app registration client ID)" })
    .min(1, "MS_CLIENT_ID must not be empty"),
  MS_TENANT_ID: z
    .string({ required_error: "MS_TENANT_ID is required (Azure AD directory/tenant ID)" })
    .min(1, "MS_TENANT_ID must not be empty"),
})

/**
 * Read and validate config from the environment. External input (env vars) is
 * validated with Zod before use, per team standards.
 */
export function loadConfig(): Result<AppConfig> {
  const parsed = envSchema.safeParse(process.env)
  if (!parsed.success) {
    const detail = parsed.error.issues.map((issue) => issue.message).join("; ")
    return err(new Error(`Invalid environment: ${detail}`))
  }

  const { MS_CLIENT_ID, MS_TENANT_ID } = parsed.data
  return ok({
    clientId: MS_CLIENT_ID,
    tenantId: MS_TENANT_ID,
    authority: `https://login.microsoftonline.com/${MS_TENANT_ID}`,
    // Calendars.Read is the minimum scope for reading the signed-in user's calendar.
    scopes: ["https://graph.microsoft.com/Calendars.Read"],
    cachePath: join(homedir(), ".claude", "react-team-status", "msal-cache.json"),
  })
}
