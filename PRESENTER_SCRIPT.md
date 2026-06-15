# Presenter Script — Claude Code Plugins Session

90-minute session. Keep Claude Code open on screen throughout.  
All commands are meant to be run live.

---

## Setup (before the session starts)

```bash
# 1. Open this project in Claude Code
cd "session-demo"

# 2. Make sure the marketplace is fresh
# (Run once — Claude Code handles this automatically)

# 3. Have these tabs ready in your browser:
#    - github.com/anthropics/claude-plugins-official  (the marketplace repo)
#    - This README.md
```

---

## Part 1: The Problem (5 min)

Start without opening Claude Code. Ask the room:

> "How many of you have explained the same coding standards to Claude more than once this week?"

[Pause for hands]

> "How many have copied a long system prompt into Claude because you couldn't remember it otherwise?"

[Pause]

> "That's the problem plugins solve. Let me show you what I mean."

**Open Claude Code.** Type:

```
Write a function that fetches a user from the database
```

Show the output — probably raw try/catch, no logging, any types if TypeScript.

Then say:
> "Now watch what happens after we install two plugins."

---

## Part 2: Install & See the Difference (10 min)

```bash
/plugin install commit-commands@claude-plugins-official
/plugin install security-guidance@claude-plugins-official
/plugin install frontend-design@claude-plugins-official
```

Now type the SAME prompt again:
```
Write a function that fetches a user from the database
```

Show the difference. Point out:
- The logging (security-guidance nudged this)
- The error handling pattern
- Any type warnings

> "Same prompt. Different output. Because plugins changed what Claude knows before it responds."

---

## Part 3: What Are Plugins? (10 min)

Draw this on a whiteboard or show [`01-concepts/README.md`](01-concepts/README.md):

```
Plugin
├── Skills     — Claude auto-applies based on context
├── Commands   — You type /command to trigger a workflow
└── MCP        — Claude gets actual tool access (GitHub, browser, etc.)
```

**Key point to land:**
> "Normal prompting is a conversation. Plugins are institutional memory.  
> The conversation ends. The plugin doesn't."

---

## Part 4: Discovery & Installation (10 min)

Live demo:

```bash
# Open the browser
/plugin

# Navigate to Discover
# Search "commit"
# Point out: commit-commands, code-review
# Click into commit-commands and read the README
```

> "Before installing any plugin — especially MCP ones — read the README.  
> MCP plugins run processes on your machine. Treat them like npm install."

Install sequence:

```bash
# Basic install (user scope)
/plugin install commit-commands@claude-plugins-official

# See it's there
/plugin list

# Show what got added
ls ~/.claude/plugins/cache/claude-plugins-official/commit-commands/
```

---

## Part 5: Skills in Action (15 min)

### Setup: frontend-design skill

```bash
# Create a quick test file
mkdir test-ui && cd test-ui
```

Type in Claude Code:
```
Build a landing page for an API monitoring dashboard
```

Show the output — point out the design decisions (distinctive palette, typography choice, layout rationale).

Then say:
> "Now let me show you the SKILL.md that made this happen."

```bash
cat ~/.claude/plugins/cache/claude-plugins-official/frontend-design/unknown/skills/frontend-design/SKILL.md
```

Scroll to the trigger description:
```yaml
description: Guidance for distinctive, intentional visual design when building
             new UI or reshaping an existing one.
```

> "Claude reads that description at the start of every session.  
> When your request matches it, the full 2000 words of guidance loads.  
> You didn't include a single word of it in your prompt."

### The team-standards skill (show the custom plugin)

```bash
cat team-plugin/skills/team-standards/SKILL.md
```

> "This is a skill I wrote for this session. It looks exactly like the official ones.  
> It's just Markdown. Anyone on the team can write this."

---

## Part 6: Commands in Action (15 min)

### `/commit` demo

```bash
# Make a quick code change
echo 'export const API_VERSION = "v2"' >> api-config.ts

# The old way
# git add api-config.ts
# git commit -m "update api config"  ← shallow message

# The plugin way
/commit
```

Show how Claude:
1. Ran `git status` and `git diff` automatically
2. Wrote a message that describes the *why*, not just the *what*
3. Followed conventional commits if your repo does

### `/code-review` demo

```bash
/plugin install code-review@claude-plugins-official
```

If you have a PR branch ready:
```bash
git checkout <feature-branch>
/code-review
```

Walk through the output:
> "Notice: it spawned 4 agents in parallel. Each reviewed from a different angle.  
> Only findings with 80%+ confidence got posted. That's not Claude reading your diff once —  
> that's four reviewers in parallel with a confidence filter."

---

## Part 7: MCP Plugins (15 min)

> "Skills and commands are about knowledge and workflows.  
> MCP plugins are about Claude actually doing things in real systems."

### Playwright demo

```bash
/plugin install playwright@claude-plugins-official
```

Type:
```
Navigate to https://example.com, take a screenshot, and tell me what's on the page
```

Claude launches a real browser. Show the screenshot.

> "This is not Claude writing Playwright test code.  
> This is Claude *using* Playwright right now."

Follow-up prompt:
```
Now click the 'More information...' link and screenshot the result
```

> "Claude is driving a browser like a person would. Your entire test flow can be:  
> 'Go through the checkout, tell me what's broken.'"

### The MCP config

```bash
cat .mcp.json  # or ~/.claude/.mcp.json
```

> "When you install an MCP plugin, it adds a server config here.  
> This is a standard JSON file. Commit it to your repo.  
> Every teammate who opens this project gets the same tools."

---

## Part 8: Build Your Own Plugin (10 min)

```bash
ls team-plugin/
cat team-plugin/.claude-plugin/plugin.json
cat team-plugin/skills/team-standards/SKILL.md
cat team-plugin/commands/standup.md
```

> "Three files. That's the whole plugin.  
> The skill enforces your team's coding standards automatically.  
> The command generates your standup from actual git history."

Install and demo it:
```bash
/plugin install ./team-plugin --scope project

# Test the standup command
/standup
```

> "Notice: Claude read your git log, found what you worked on, and formatted it  
> as a standup. You didn't write any instructions in the chat."

**Key insight to deliver:**
> "This plugin is yours. You can put your team's actual error handling patterns,  
> your actual naming conventions, your actual logging format.  
> Every new engineer who joins gets that knowledge from day one."

---

## Part 9: Plugins vs Prompting — The Summary (5 min)

Show [`08-vs-prompting/README.md`](08-vs-prompting/README.md), specifically the table.

Read the final line out loud:

> "Normal prompting is a conversation. Plugins are institutional memory."

Then:

> "The question isn't 'should we use plugins' — it's  
> 'which of our team's best practices should we encode first?'"

Give them the exercise:
> "For homework: pick one thing you explain to Claude every week.  
> Write a SKILL.md for it. Install it. Tell us next session whether  
> you had to explain it again."

---

## Q&A Prompts (if conversation stalls)

- "What repetitive task do you do in Claude Code that you'd want a command for?"
- "What team standard would be most valuable if Claude applied it automatically?"
- "Has anyone been burned by Claude forgetting context between sessions?"
- "Would MCP access to our internal tooling (Jira, Datadog, etc.) be useful?"

---

## Useful Links

- Official marketplace: `github.com/anthropics/claude-plugins-official`
- Plugin docs: `code.claude.com/docs/en/plugins`
- Submit a plugin: via the submission form linked in the marketplace README
- Build help: `/plugin install plugin-dev@claude-plugins-official` (has 7 skills for plugin authors)
