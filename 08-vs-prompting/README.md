# 08 — Plugins vs Normal Prompting

This is the most important section. Understanding *why* plugins beat normal prompting changes how your whole team uses Claude Code.

---

## The Problem With Normal Prompting

Normal prompting works once. Plugins work every time.

```
Normal prompting:

  Monday:
    "When writing TypeScript, use zod for all external data,
     never use any, always handle promise rejections,
     use our Result type pattern for errors..."
    [Claude follows it — great!]

  Wednesday:
    New session. Context cleared.
    Claude writes code with raw try/catch, any types, no zod.
    You: "What happened to the patterns I described?"
    Claude: "I don't have that context in this conversation."

Plugin:

  Every session, automatically:
    Claude reads team-standards SKILL.md before responding.
    No reminding. No re-explaining. Consistent forever.
```

---

## Side-by-Side Comparison

### Scenario 1: Code Quality Standards

| Aspect | Normal Prompting | Plugin (Skill) |
|--------|-----------------|----------------|
| Activation | You include in every prompt | Auto-fires when writing code |
| Persistence | Lost when session ends | Always active |
| Team consistency | Each dev prompts differently | Same standards for all |
| Maintenance | Update every engineer's habit | Update one SKILL.md in git |
| Length | Adds 200+ tokens to every message | Loaded once, cached |

---

### Scenario 2: Git Workflow

| Aspect | Normal Prompting | Plugin (Command) |
|--------|-----------------|-----------------|
| Commit | "Read my changes, study recent commits, write a good message matching our style, stage files, don't include .env, use conventional commits..." | `/commit` |
| PR creation | [5 paragraphs of instructions] | `/commit-push-pr` |
| Cleanup | "List branches, find the gone ones, delete worktrees, delete branches" | `/clean_gone` |
| Remembering | You must remember the full prompt | Just type the command |

---

### Scenario 3: External Tool Access

| Aspect | Normal Prompting | Plugin (MCP) |
|--------|-----------------|-------------|
| GitHub issues | "Here's my GitHub token, use the API to..." | Claude calls the tool directly |
| Browser testing | "Here's how Playwright works, write a script that..." | Claude runs the browser now |
| Linear tasks | "The Linear API is at..., here's how to authenticate..." | Claude reads your board directly |
| What it requires | You know the API, write the instructions correctly | Just ask what you want done |

---

## The Real Advantage: Claude Knows What You Don't Need to Say

Normal prompting = **you know what Claude needs to know and say it correctly every time**

Plugin = **the knowledge is already there, Claude uses it when relevant**

```
With plugins, this conversation works:

  You:   "Add error handling to the payment service"
  
  Claude: [reads team-standards skill, knows to use Result types]
          [reads security-guidance skill, checks for sensitive data logging]
          [no prompting from you]
          
  Output: Code that follows your patterns, with security checks applied.
  
Without plugins, the same conversation:

  You:   "Add error handling to the payment service.
          Use our Result type pattern, not throw.
          Don't log the full card data in errors.
          Follow our naming conventions.
          Use our logger utility from lib/logger.ts.
          Check for the data-sensitivity guidelines in our CLAUDE.md..."
          
  Output: Still might miss something. Next session: start over.
```

---

## When Normal Prompting Is Still Fine

Plugins are not the answer to everything:

- **One-time tasks** — "Refactor this function" doesn't need a plugin
- **Exploratory questions** — "What does this code do?" is just a question
- **Project-specific one-offs** — unique tasks that don't repeat

Use plugins when a **behavior needs to be consistent across many sessions** — quality standards, team workflows, external integrations.

---

## The Compounding Effect

The more plugins your team installs:

```
Week 1: Install commit-commands
  → Commits take 30 seconds instead of 3 minutes

Week 2: Install code-review  
  → PRs get reviewed before humans see them

Week 3: Install security-guidance
  → Security bugs caught before commit

Week 4: Add team-standards skill
  → New engineers code to team standards immediately

Month 2: Add github + linear MCP
  → Tickets and PRs linked automatically

Month 3: Every engineer runs /commit-push-pr
  → Zero context-switching in the git workflow
```

Each plugin compounds on the others. The team gets faster, more consistent, with less friction.

---

## Summary: When to Use What

| You want... | Use... |
|-------------|--------|
| Consistent code style across the team | Skill |
| Team-specific patterns (Result types, logging) | Skill |
| Repetitive multi-step workflow | Command |
| Git operations (commit, PR, branch cleanup) | commit-commands plugin |
| Automated PR review | code-review plugin |
| Security checks on every save | security-guidance plugin |
| Read/write GitHub issues and PRs | github MCP plugin |
| Browser-based testing or verification | playwright MCP plugin |
| Project management integration | linear/asana MCP plugin |
| Your own team-specific workflow | Build a custom plugin |

---

## Final Takeaway

**Normal prompting is a conversation.**  
**Plugins are institutional memory.**

Plugins let the team's best practices and workflows live in code, not in every engineer's memory.

---

Finished. Go back to the [session overview](../README.md) or start building your team's first plugin in [`../team-plugin/`](../team-plugin/).
