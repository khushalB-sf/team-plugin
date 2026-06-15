# Claude Code Plugins — Quick Reference

## Plugin Commands

```bash
/plugin                                          # Open plugin browser (interactive)
/plugin discover                                 # Browse marketplace
/plugin install <name>@claude-plugins-official   # Install from official marketplace
/plugin install <name>@claude-plugins-official --scope project  # Install for whole team
/plugin install ./local-path                     # Install from local directory
/plugin install https://github.com/org/repo      # Install from git URL
/plugin list                                     # Show installed plugins
/plugin update                                   # Update all plugins
/plugin update <name>@claude-plugins-official    # Update specific plugin
/plugin remove <name>@claude-plugins-official    # Uninstall
```

---

## Must-Have Plugins for Engineering Teams

| Plugin | What it does | Install |
|--------|-------------|---------|
| `commit-commands` | `/commit`, `/commit-push-pr`, `/clean_gone` | `/plugin install commit-commands@claude-plugins-official` |
| `code-review` | Automated 4-agent PR review | `/plugin install code-review@claude-plugins-official` |
| `security-guidance` | Real-time security checks on every save | `/plugin install security-guidance@claude-plugins-official` |
| `frontend-design` | Distinctive UI instead of generic AI layouts | `/plugin install frontend-design@claude-plugins-official` |
| `github` | Claude reads/creates GitHub issues and PRs | `/plugin install github@claude-plugins-official` |
| `playwright` | Claude controls a real browser | `/plugin install playwright@claude-plugins-official` |
| `linear` | Claude reads/updates your Linear board | `/plugin install linear@claude-plugins-official` |

---

## Plugin File Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        ← { "name", "description", "author" }
├── skills/
│   └── my-skill/
│       └── SKILL.md       ← auto-triggered guidance
└── commands/
    └── my-command.md      ← user-triggered slash command
```

---

## Skill Template

```markdown
---
name: my-skill
description: This skill applies when the user asks to "X" or mentions "Y topic".
version: 1.0.0
---

# Skill Title

[Instructions Claude follows when this skill activates]
```

---

## Command Template

```markdown
---
description: Short description shown in /help
argument-hint: <required-arg> [optional-arg]
allowed-tools: [Bash, Read, Grep]
---

# Command Title

## Instructions

1. Step one
2. Step two

The user provided: $ARGUMENTS
```

---

## Three Plugin Types

```
Skills     → Auto-fires when context matches
             Lives in skills/<name>/SKILL.md

Commands   → User types /command-name
             Lives in commands/command-name.md

MCP        → Claude gets actual tool access (APIs, browser, etc.)
             Configured in .mcp.json by the plugin installer
```

---

## Plugin Scopes

| Scope | Default? | Stored at | Team-shared? |
|-------|----------|-----------|-------------|
| User | Yes | `~/.claude/plugins/` | No |
| Project | `--scope project` | `./.claude/plugins/` | Yes (commit to git) |

---

## Key Insight

```
Normal prompting → forgotten every session
Plugin           → active every session

Normal prompting → one engineer's habit
Plugin           → the whole team's default

Normal prompting → requires perfect instructions each time
Plugin           → encode the instructions once, use forever
```
