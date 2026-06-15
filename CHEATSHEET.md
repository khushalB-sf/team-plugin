# Claude Code Plugins — Quick Reference

## Plugin Commands

```bash
/plugin                                          # Open plugin browser (interactive)
/plugin install <name>@claude-plugins-official   # Install from official marketplace
/plugin install <name>@claude-plugins-official --scope local    # Just you, this project
/plugin install <name>@claude-plugins-official --scope project  # Whole team (commit to git)
/plugin install ./team-plugin                    # Install from local path
/plugin list                                     # Show installed plugins
/plugin update                                   # Update all plugins
/plugin remove <name>@claude-plugins-official    # Uninstall
```

---

## Install Sources

| Source | How |
|--------|-----|
| Official marketplace | `/plugin install <name>@claude-plugins-official` |
| GitHub repo (private or public) | `git clone <repo-url> ~/.claude/plugins/<name>` |
| Local path | `./team-plugin` (relative to project root) |

---

## Plugin Scopes

| Scope | Flag | Stored at | Who gets it |
|-------|------|-----------|-------------|
| User _(default)_ | `--scope user` | `~/.claude/plugins/` | Just you, all projects |
| Local | `--scope local` | `./.claude/plugins/` _(gitignored)_ | Just you, this project |
| Project | `--scope project` | `./.claude/plugins/` _(commit to git)_ | Whole team |

---

## Sharing with Your Team

```bash
# Copy plugin into project scope and commit
mkdir -p .claude/plugins
cp -r team-plugin .claude/plugins/
git add .claude/
git commit -m "chore: add team-plugin"
git push
# teammates: git pull → plugin loads automatically
```

---

## Start Here (5 minutes)

```bash
/plugin install commit-commands@claude-plugins-official   # smart commits
/plugin install code-review@claude-plugins-official       # automated PR review
/plugin install security-guidance@claude-plugins-official # real-time security checks
```

## Other Official Plugins

| Plugin | What it does |
|--------|-------------|
| `frontend-design` | Distinctive UI instead of generic AI layouts |
| `playwright` | Claude controls a real browser |
| `github` | Claude reads/creates GitHub issues and PRs |
| `linear` | Claude reads/updates your Linear board |
| `plugin-dev` | Scaffolding and guidance for building plugins |
| `skill-creator` | Claude helps you write a SKILL.md |

---

## team-plugin (Demo Plugin)

```bash
# Install
mkdir -p .claude/plugins && cp -r team-plugin .claude/plugins/

# Commands it adds
/standup           # Yesterday / Today / Blockers from git log (default 24h)
/standup 48        # Look back 48 hours instead
/ticket AUTH-234   # Create kebab-case branch from ticket ID
```

The `team-standards` skill fires **automatically** when Claude writes TypeScript/JavaScript — no command needed.

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

## Plugins vs Normal Prompting

| Aspect | Normal Prompting | Plugin |
|--------|-----------------|--------|
| Activation | You include it in every prompt | Auto-fires when context matches |
| Persistence | Lost when session ends | Always active |
| Team consistency | Each dev prompts differently | Same standards for everyone |
| Maintenance | Update every engineer's habit | Update one file in git |
| Onboarding | New devs don't know the prompts | Install the plugin → instant context |
| External tools | You explain the API each time | Claude calls the API directly |
