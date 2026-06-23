# m365-calendar MCP server

A local stdio MCP server that reads **today's** Microsoft 365 (Teams/Outlook)
calendar meetings via Microsoft Graph. It exposes one tool used by
`/react-team-status start` to auto-populate the **Others** list:

```
mcp__plugin_team-plugin_m365-calendar__get_todays_meetings
```

## How it works

- **Auth:** Azure AD app registration (public client) + MSAL device-code flow.
  You sign in once (`npm run login`); the token is cached and refreshed silently
  thereafter. The MCP server only ever does *silent* token acquisition, so the
  slash command never blocks on a browser sign-in.
- **Data:** `GET /me/calendarView` for the local day, filtered client-side to
  non-cancelled, non-declined, non-all-day events.

## One-time setup

### 1. Create an Azure AD app registration

In the [Azure Portal](https://portal.azure.com) → **App registrations** → **New registration**:

- **Supported account types:** your org (single tenant) is fine.
- **Authentication** → **Advanced settings** → set **Allow public client flows** = **Yes**
  (required for the device-code flow).
- **API permissions** → add **Microsoft Graph** → **Delegated** → **Calendars.Read**.
  Grant admin consent if your org requires it.

Note the **Application (client) ID** and **Directory (tenant) ID**.

### 2. Export the IDs in your shell environment

The plugin's `.mcp.json` reads these from your environment:

```bash
export MS_CLIENT_ID="<application-client-id>"
export MS_TENANT_ID="<directory-tenant-id>"
```

(Add them to your `~/.zshrc` so every Claude Code session sees them.)

### 3. Install and build the server

```bash
cd .claude/plugins/team-plugin/mcp/m365-calendar
npm install
npm run build
```

### 4. Sign in once

```bash
npm run login
```

Follow the printed URL + code to sign in. The token cache is written to
`~/.claude/react-team-status/msal-cache.json` (file mode `0600`).

### 5. Reload the plugin / MCP servers

In Claude Code, run `/reload-plugins` (or restart) so the MCP server connects.
Verify with `/mcp` — `m365-calendar` should be listed.

## Security note

The token cache contains a refresh token and is stored as a plaintext JSON file
with `0600` permissions. For OS-level encryption at rest (DPAPI / Keychain /
LibSecret), replace the file cache plugin in `src/auth.ts` with
[`@azure/msal-node-extensions`](https://learn.microsoft.com/en-us/entra/msal/javascript/node/extensions).

## Troubleshooting

- **"Not signed in"** from the tool → run `npm run login` again.
- **Server not listed in `/mcp`** → confirm `npm run build` produced `dist/index.js`
  and that `MS_CLIENT_ID` / `MS_TENANT_ID` are exported in the session.
- **Logs:** the server logs JSON lines to **stderr** (stdout is reserved for the
  JSON-RPC stream). Check the `/plugin` Errors tab, or run `npm start` directly.
