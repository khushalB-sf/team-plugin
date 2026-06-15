# 01 — What Are Plugins?

## The Core Idea

Claude Code plugins extend what Claude can do inside your projects.  
Without plugins, Claude knows how to code — but it doesn't know *your* workflow, *your* team's standards, or *your* external tools.

Plugins are the answer to: **"How do I make Claude consistently do X without explaining it every single session?"**

---

## Three Types of Plugins

```
Plugin
├── Skills         — Auto-triggered guidance (Claude decides when to use)
├── Commands       — User-triggered slash commands (/commit, /code-review)
└── MCP Servers    — Real tool access (GitHub API, Linear, Playwright)
```

### 1. Skills

A **skill** is a Markdown file that tells Claude *what to do* when certain situations arise.  
Claude reads it automatically when it detects the situation — no user prompt needed.

```
Example: frontend-design skill
─────────────────────────────
When Claude is building any UI, the skill auto-activates and tells it
to make opinionated design choices, pick distinctive typography,
and avoid generic "AI-looking" layouts.

Without the skill → generic blue buttons, default fonts.
With the skill    → distinctive, production-grade UI every time.
```

**Where skills live:**
```
~/.claude/plugins/cache/<marketplace>/<plugin-name>/skills/
└── skill-name/
    └── SKILL.md     ← Claude reads this when the trigger fires
```

---

### 2. Commands

A **command** is a slash command the user types to kick off a defined workflow.

```
Example: /commit   (from commit-commands plugin)
──────────────────────────────────────────────
Types: /commit

Claude will:
1. Read your staged + unstaged changes
2. Study your recent commit history to match your style
3. Stage relevant files
4. Write and create the commit

No more: "commit my changes with a good message following our conv commit style"
```

Commands accept arguments too: `/code-review --fix`

---

### 3. MCP Server Plugins

MCP (Model Context Protocol) plugins give Claude **actual tool access** — not just knowledge, but the ability to call APIs, run browsers, read databases.

```
Example: playwright plugin
──────────────────────────
Claude can launch a real browser, navigate to pages,
take screenshots, click elements, fill forms, and run tests.
This is NOT prompt guidance — it's a live browser Claude controls.
```

Other MCP plugins: GitHub (read/create PRs/issues), Linear (tasks), Slack, Firebase, Terraform.

---

## Where Plugins Come From

```
Marketplace (claude-plugins-official)
├── Internal (Anthropic-built)
│   ├── commit-commands
│   ├── code-review
│   ├── security-guidance
│   ├── frontend-design
│   ├── plugin-dev
│   └── 20+ more...
└── External (community/partners)
    ├── github     (GitHub MCP server)
    ├── linear     (Linear MCP server)
    ├── playwright (Browser automation)
    ├── firebase
    └── 10+ more...
```

You can also write your own plugins and share them with your team via git.

---

## The Lifecycle

```
1. DISCOVER   →  /plugin discover   (browse the marketplace)
2. INSTALL    →  /plugin install commit-commands@claude-plugins-official
3. USE        →  Skills auto-fire / type /command / tools available
4. SHARE      →  Commit plugin config to your repo for the whole team
```

---

**Next:** [02 — Discovering Plugins](../02-discovery/README.md)
