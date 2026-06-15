# 02 — Discovering Plugins

## The `/plugin` Command

Everything starts with `/plugin`. Run it with no arguments to open the interactive plugin browser.

```
/plugin
```

You'll see a menu with options:
- **Discover** — Browse the marketplace
- **Install** — Install a plugin by name
- **List** — See what's installed
- **Remove** — Uninstall a plugin
- **Update** — Update installed plugins

---

## Browsing the Marketplace

```bash
# Open the full discovery browser
/plugin discover
```

The marketplace shows plugins grouped by category. You can search, filter by category, and read the README before installing.

**Categories in the official marketplace:**
- `development` — git workflows, code review, security
- `frontend` — UI design, styling
- `testing` — browser automation, test runners
- `lsp` — language server integrations (TypeScript, Go, Rust, etc.)
- `integrations` — GitHub, Linear, Slack, Asana

---

## Reading Plugin Info Before Installing

Every plugin in the marketplace has a README. Before installing anything, read it to understand:
1. What the plugin does
2. What prerequisites it needs
3. Whether it installs MCP servers (which run external processes)

**Always trust before installing** — MCP plugins run code on your machine.

---

## Try It Live

```bash
# 1. Open the browser
/plugin

# 2. Navigate to Discover, search "commit"
# → you'll see commit-commands, which adds /commit, /commit-push-pr, /clean_gone

# 3. Read the README
# → notice: no prerequisites, no external servers, just slash commands

# 4. We'll install it in the next section
```

---

## Pro Tip: The Plugin Catalog

The official marketplace (`claude-plugins-official`) is a GitHub repo:  
`https://github.com/anthropics/claude-plugins-official`

Browse it directly to see all plugins, their source code, and version history.
Plugin structure, READMEs, and SKILL.md files are all plain Markdown — readable without any tooling.

---

**Next:** [03 — Installing Plugins](../03-installation/README.md)
