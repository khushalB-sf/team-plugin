# 07 — Building Your Own Plugin

You don't need to use only marketplace plugins. You can create your own and share them with your team via your git repository.

---

## Why Build Your Own?

Marketplace plugins are generic. Your team has specific:
- **Coding standards** — how functions are named, error handling patterns
- **Workflows** — your PR process, your deployment steps
- **Knowledge** — which services exist, what the architecture looks like

A custom plugin turns that institutional knowledge into something Claude follows automatically, for every engineer on the team.

---

## Plugin Structure

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json       ← required: plugin metadata
├── skills/
│   └── my-skill/
│       └── SKILL.md      ← auto-triggered guidance
└── commands/
    └── my-command.md     ← user-triggered slash command
```

That's it. Plain Markdown files. No build step, no compilation.

---

## The Example Plugin in This Repo

Look at `../team-plugin/` — a real plugin pre-built for this session:

```
team-plugin/
├── .claude-plugin/
│   └── plugin.json
├── skills/
│   └── team-standards/
│       └── SKILL.md      ← auto-enforces your team's coding standards
└── commands/
    └── standup.md        ← /standup: generates a standup update from git log
```

---

## Step 1: Write plugin.json

```json
{
  "name": "team-plugin",
  "description": "Engineering team standards and workflow commands",
  "author": {
    "name": "Your Team",
    "email": "engineering@yourcompany.com"
  }
}
```

That's the whole file. Just name, description, author.

---

## Step 2: Write a Skill

Create `skills/team-standards/SKILL.md`:

```markdown
---
name: team-standards
description: This skill applies when writing any new function, class, or module.
             Enforces team coding standards including error handling, logging,
             and naming conventions.
---

# Team Coding Standards

## Error Handling

Always use Result types, never raw exceptions for expected failures:
- ✓ return { data: result, error: null }
- ✓ return { data: null, error: new Error("not found") }
- ✗ throw new Error("not found")   ← only for truly unexpected failures

## Logging

Every function that touches external I/O must log:
- Entry: logger.info("Starting X", { params })
- Exit: logger.info("Completed X", { duration })
- Errors: logger.error("Failed X", { error, context })

## Naming

- Files: kebab-case.ts
- Functions: camelCase
- Classes: PascalCase
- Constants: UPPER_SNAKE_CASE
- Never abbreviate (userId not uid, response not res)
```

Claude will follow these rules on every function it writes, without you reminding it.

---

## Step 3: Write a Command

Create `commands/standup.md`:

```markdown
---
description: Generate a daily standup update from your recent git activity
argument-hint: [hours-back]
allowed-tools: [Bash]
---

# Daily Standup Generator

Generate a standup update by looking at recent work.

## Instructions

1. Run: git log --since="24 hours ago" --oneline --author=$(git config user.email)
2. Group commits by the feature/area they touch
3. Write a standup in this format:
   **Yesterday:** [what was completed]
   **Today:** [what's in progress based on staged/unstaged changes]
   **Blockers:** [anything that needs attention]

If $ARGUMENTS is provided, use that many hours instead of 24.

Keep it to 3-5 bullet points. Engineers read this fast.
```

Now `/standup` generates your standup from your actual commits.

---

## Step 4: Install Your Plugin Locally

```bash
# From your project root:
/plugin install ./team-plugin --scope project
```

Or if the plugin is in a git repo, share the repo URL:
```bash
/plugin install https://github.com/your-org/team-plugin
```

---

## Step 5: Share with the Team

The best approach for team plugins:
1. Create a git repo: `github.com/your-org/claude-team-plugin`
2. Everyone installs it: `/plugin install https://github.com/your-org/claude-team-plugin`
3. When you update the plugin, teammates run `/plugin update`

Or: commit `.claude/plugins/` to your main repo and have project-scope plugins load automatically.

---

## The skill-creator Plugin

There's a plugin that helps you write plugins:

```bash
/plugin install skill-creator@claude-plugins-official
```

Then say:
```
"Create a skill that enforces our TypeScript patterns: 
 - no any types
 - always handle promise rejections  
 - use zod for all external data validation"
```

The `skill-creator` plugin will generate a well-structured `SKILL.md` for you.

---

## Try It: Build the Standup Command

```bash
# 1. Look at the pre-built example
cat "../team-plugin/commands/standup.md"

# 2. Install it
/plugin install ../team-plugin --scope project

# 3. Try it
/standup
```

---

**Next:** [08 — Plugins vs Normal Prompting](../08-vs-prompting/README.md)
