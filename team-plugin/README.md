# team-plugin

A Claude Code plugin for engineering team standards and daily workflow.

## What It Does

### Skills (auto-active)

**`team-standards`** — Automatically enforces the team's coding conventions whenever you write or edit TypeScript/JavaScript:
- Result pattern for error handling (no raw `throw` for domain errors)
- Mandatory structured logging on I/O functions  
- No `any` types; Zod for external data validation
- Naming conventions (camelCase functions, PascalCase classes, kebab-case files)
- Parallel `Promise.all()` instead of sequential awaits

Claude applies these without being asked, on every function it writes.

### Commands (user-triggered)

**`/standup`** — Generates a daily standup from your actual git activity.
```bash
/standup         # last 24 hours
/standup 48      # last 48 hours
```

**`/ticket <id>`** — Creates a properly named feature branch from a ticket ID.
```bash
/ticket AUTH-234
```

---

## Installation

### For yourself (user scope)
```bash
/plugin install ./team-plugin
```

### For the whole team (project scope — commits to .claude/)
```bash
/plugin install ./team-plugin --scope project
git add .claude/
git commit -m "chore: add team-plugin for the whole team"
```

### From a shared git repo
```bash
/plugin install https://github.com/your-org/team-plugin
```

---

## Updating

When the plugin is updated in git:
```bash
/plugin update team-plugin
```

---

## Customizing

Edit the `SKILL.md` to match your team's actual standards.  
Add new commands to `commands/` — each is a Markdown file with YAML frontmatter.

See the [build-your-own guide](../07-build-your-own/README.md) for details.
