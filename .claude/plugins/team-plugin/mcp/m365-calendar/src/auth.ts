import { mkdir, readFile, writeFile } from "node:fs/promises"
import { dirname } from "node:path"
import {
  PublicClientApplication,
  type ICachePlugin,
  type TokenCacheContext,
} from "@azure/msal-node"
import { type AppConfig } from "./config.js"
import { logger } from "./logger.js"
import { type Result, ok, err } from "./result.js"

/**
 * File-backed MSAL token cache. The cache holds refresh tokens, so the file is
 * written with 0600 permissions. (For OS-level encryption at rest, swap this for
 * @azure/msal-node-extensions — see the server README.)
 */
function createCachePlugin(cachePath: string): ICachePlugin {
  return {
    async beforeCacheAccess(context: TokenCacheContext): Promise<void> {
      try {
        const cache = await readFile(cachePath, "utf-8")
        context.tokenCache.deserialize(cache)
      } catch {
        // No cache yet — first run. MSAL will populate it after sign-in.
      }
    },
    async afterCacheAccess(context: TokenCacheContext): Promise<void> {
      if (!context.cacheHasChanged) return
      await mkdir(dirname(cachePath), { recursive: true })
      await writeFile(cachePath, context.tokenCache.serialize(), { mode: 0o600 })
    },
  }
}

function buildClient(config: AppConfig): PublicClientApplication {
  return new PublicClientApplication({
    auth: { clientId: config.clientId, authority: config.authority },
    cache: { cachePlugin: createCachePlugin(config.cachePath) },
  })
}

/**
 * Acquire an access token from the cache, refreshing silently if needed. Returns
 * an error (never throws) when no account is cached — the caller should tell the
 * user to run the interactive login. Used by the MCP server at request time.
 */
export async function getAccessTokenSilent(config: AppConfig): Promise<Result<string>> {
  logger.info("getAccessTokenSilent: start")
  const client = buildClient(config)

  const accounts = await client.getTokenCache().getAllAccounts()
  const account = accounts[0]
  if (!account) {
    logger.error("getAccessTokenSilent: no cached account")
    return err(new Error("Not signed in to Microsoft 365. Run the login command first: npm run login"))
  }

  try {
    const result = await client.acquireTokenSilent({ account, scopes: config.scopes })
    if (!result?.accessToken) {
      return err(new Error("Silent token acquisition returned no access token"))
    }
    logger.info("getAccessTokenSilent: complete", { account: account.username })
    return ok(result.accessToken)
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught)
    logger.error("getAccessTokenSilent: failed", { error: message })
    return err(new Error(`Silent auth failed — re-run the login command. (${message})`))
  }
}

/**
 * Interactive device-code sign-in. Prints the verification URL + code to stderr
 * and resolves once the user completes sign-in in their browser. Run once via
 * `npm run login`; subsequent runs use the cached/refreshed token silently.
 */
export async function loginInteractive(config: AppConfig): Promise<Result<string>> {
  logger.info("loginInteractive: start")
  const client = buildClient(config)

  try {
    const result = await client.acquireTokenByDeviceCode({
      scopes: config.scopes,
      deviceCodeCallback: (response) => {
        process.stderr.write(`${response.message}\n`)
      },
    })
    if (!result?.accessToken) {
      return err(new Error("Device code flow returned no access token"))
    }
    // Persist the cache explicitly from this client instance, before returning,
    // so the token is on disk regardless of afterCacheAccess callback timing.
    await mkdir(dirname(config.cachePath), { recursive: true })
    await writeFile(config.cachePath, client.getTokenCache().serialize(), { mode: 0o600 })
    logger.info("loginInteractive: complete", { account: result.account?.username, cachePath: config.cachePath })
    return ok(result.accessToken)
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : String(caught)
    logger.error("loginInteractive: failed", { error: message })
    return err(new Error(`Device code sign-in failed: ${message}`))
  }
}
