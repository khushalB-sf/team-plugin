# 06 — MCP Plugins: Real Tool Access

MCP (Model Context Protocol) plugins are fundamentally different from skills and commands. They give Claude **actual programmatic access** to external systems — not just knowledge about them.

---

## Skills vs MCP: The Key Difference

```
Skill:      Claude KNOWS how to write good commits
MCP:        Claude CAN CREATE a GitHub issue right now

Skill:      Claude KNOWS how to write Playwright tests
MCP:        Claude IS RUNNING a browser right now

Skill:      Claude KNOWS how Linear tasks should look
MCP:        Claude CAN READ and UPDATE your Linear board
```

---

## How MCP Works

An MCP server is a process (Node.js, Python, or any executable) that exposes **tools** Claude can call. Claude Code starts these processes when needed and communicates with them via a standard protocol.

```
Claude Code
    │
    ├── github MCP server (Node process)
    │       └── tools: create_issue, list_prs, merge_pr, ...
    │
    ├── playwright MCP server (Node process)
    │       └── tools: navigate, click, screenshot, fill, ...
    │
    └── linear MCP server (Node process)
            └── tools: list_issues, update_issue, create_task, ...
```

The plugin just configures which server to start. Claude decides when to call which tool.

---

## Demo: github Plugin

```bash
/plugin install github@claude-plugins-official
```

After installing, you can do things like:

```
You: "Check if there are any open issues tagged 'performance' and create a
      tracking task for the top three"

Claude:
1. Calls github:list_issues with label=performance
2. Reads the issues
3. Creates a GitHub issue: "Performance tracking: [Q3]"
4. Links the three source issues in the body
5. Returns the URL

No copy-pasting. No browser tab. Claude did it.
```

```
You: "My PR is ready for review, add the backend team as reviewers"

Claude:
1. Gets the current PR from your branch
2. Looks up the backend team's GitHub usernames
3. Calls github:request_reviewers
4. Done in one message
```

---

## Demo: playwright Plugin

```bash
/plugin install playwright@claude-plugins-official
```

This is one of the most powerful plugins — Claude controls a real browser.

```
You: "Go to our staging site, log in as the test user, 
      create a new project, and screenshot the result"

Claude:
1. playwright:navigate to staging URL
2. playwright:fill login form
3. playwright:click submit
4. playwright:navigate to /projects/new
5. playwright:fill project name
6. playwright:click create
7. playwright:screenshot → returns the image

You see: a real screenshot of the page after the action
```

**Testing use case:**
```
You: "Run through the checkout flow and tell me if anything is broken"

Claude actually clicks through your UI, finds broken elements,
reports them with screenshots — not by reading your test code,
but by using your real app.
```

---

## Demo: Linear Plugin

```bash
/plugin install linear@claude-plugins-official
```

```
You: "What's my backlog looking like? Anything blocking this sprint?"

Claude:
1. Calls linear:list_issues for current sprint
2. Filters by status = "blocked"
3. Reads each issue's blocker description
4. Gives you a summary with direct Linear links

You: "Mark the auth bug as in-progress and assign it to me"

Claude:
1. linear:find_issue by title
2. linear:update_issue status=in_progress, assignee=you
3. Confirms: "Done — AUTH-234 is now in-progress, assigned to you"
```

---

## MCP Authentication

Most MCP plugins that connect to external services require authentication.

```bash
# After installing github plugin:
/mcp-tunnels:authenticate github

# Or follow the plugin's README — most use OAuth or API keys
```

Some MCP servers (like Playwright) are local-only and need no auth.

---

## Understanding the MCP Config

When a plugin installs an MCP server, it adds an entry to `.mcp.json` in your project root (or `~/.claude/.mcp.json` for user-scope):

```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

This is a standard JSON config file. You can check it into git for your team.

---

## Try It

```bash
# 1. Install playwright
/plugin install playwright@claude-plugins-official

# 2. Try:
#    "Navigate to https://example.com and take a screenshot"
#    Claude will control a real browser and return the screenshot

# 3. Try:
#    "Navigate to our local app at localhost:3000 and check if the nav renders"
```

---

**Next:** [07 — Building Your Own Plugin](../07-build-your-own/README.md)
