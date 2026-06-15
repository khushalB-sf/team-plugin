# 03 — Installing Plugins

## Install Syntax

```bash
/plugin install <plugin-name>@<marketplace>
```

The marketplace name is `claude-plugins-official` for the official catalog.

---

## Install Scopes

Plugins can be installed at two scopes:

| Scope | Flag | Where stored | Who it applies to |
|-------|------|-------------|-------------------|
| **User** (default) | *(none)* | `~/.claude/plugins/` | You, across all projects |
| **Project** | `--scope project` | `./.claude/plugins/` | Everyone who clones this repo |

```bash
# Install for yourself only (user scope)
/plugin install commit-commands@claude-plugins-official

# Install for the whole team (project scope — commit .claude/ to git)
/plugin install commit-commands@claude-plugins-official --scope project
```

**Team tip:** Use project scope for plugins that enforce team standards (code review, security guidance, commit conventions). Commit the `.claude/` folder to your repo and everyone on the team gets the same plugins automatically.

---

## Live Demo: Install commit-commands

```bash
# Install it
/plugin install commit-commands@claude-plugins-official

# Confirm it's there
/plugin list
```

After installation you'll immediately have three new slash commands:
- `/commit` — stage + commit with auto-generated message
- `/commit-push-pr` — commit + push + open PR in one command
- `/clean_gone` — remove local branches deleted from remote

---

## Live Demo: Install security-guidance

```bash
/plugin install security-guidance@claude-plugins-official
```

This plugin installs **hooks** (not just commands/skills). It:
- Fires on every `Edit`/`Write` tool call to check for dangerous patterns
- Runs a diff review after each Claude turn
- Runs a commit review before every `git commit`

No restart needed — hooks activate immediately.

---

## Updating and Removing

```bash
# Update all installed plugins
/plugin update

# Update a specific plugin
/plugin update commit-commands@claude-plugins-official

# Remove a plugin
/plugin remove commit-commands@claude-plugins-official
```

---

## What Actually Gets Installed?

When you install a plugin, Claude Code:
1. Downloads the plugin files into `~/.claude/plugins/cache/<marketplace>/<plugin-name>/`
2. Registers any skills so Claude auto-loads them
3. Registers any commands so they appear in `/help`
4. Configures any MCP servers (adds entries to `.mcp.json`)
5. Installs any hooks into Claude Code's hook system

**Nothing runs in the background** until you invoke a command, Claude triggers a skill, or an MCP server is needed.

---

## Where Installed Files Live

```
~/.claude/plugins/
├── installed_plugins.json          ← registry of what's installed
├── known_marketplaces.json         ← marketplace URLs
├── marketplaces/
│   └── claude-plugins-official/    ← marketplace catalog (git clone)
└── cache/
    └── claude-plugins-official/
        └── commit-commands/        ← plugin files live here
            └── commands/
                ├── commit.md
                ├── commit-push-pr.md
                └── clean_gone.md
```

---

**Next:** [04 — Skills: Auto-Triggered Guidance](../04-skills/README.md)
