# 05 — Commands: User-Triggered Actions

Commands are slash commands you type to kick off a defined workflow. Think of them as programmable macros for multi-step tasks you do repeatedly.

---

## How Commands Work

A command is a Markdown file with YAML frontmatter:

```markdown
---
description: Creates a git commit with an auto-generated message
argument-hint: [optional message]
allowed-tools: [Bash, Read]
---

# Commit Command

When invoked:
1. Run git status to see all changes
2. Run git diff to review what changed  
3. Read recent git log to match commit style
4. Stage relevant files (never .env or credentials)
5. Write a commit message following the repo's convention
6. Create the commit
```

The `allowed-tools` frontmatter pre-approves tools, so Claude doesn't ask permission for every Bash call.

---

## The commit-commands Plugin in Action

### `/commit`

```bash
# Before: what most people do
git add -A
git commit -m "fix stuff"

# After: type this instead
/commit

# Claude:
# - Reads your diff (knows what actually changed)
# - Reads last 10 commits (matches your repo's style)
# - Uses conventional commits if your repo does
# - Never stages .env files
# - Creates: "feat(auth): add refresh token rotation with 7-day expiry"
```

**Try it now:** Make a small edit to any file in this project, then run `/commit`.

---

### `/commit-push-pr`

```bash
/commit-push-pr

# Claude does ALL of this:
# 1. Creates a feature branch (if you're on main)
# 2. Stages changes
# 3. Commits with a good message
# 4. Pushes to origin
# 5. Opens a PR with:
#    - Summary (3 bullet points)
#    - Test plan checklist
#    - Claude Code attribution
# 6. Gives you the PR URL

# What used to take 5+ commands now takes 1
```

---

### `/code-review`

Install it first:
```bash
/plugin install code-review@claude-plugins-official
```

Then run on any PR branch:
```bash
/code-review
```

What it does:
1. Checks if review is needed (skips closed/draft/trivial PRs)
2. Reads your CLAUDE.md files for team guidelines
3. **Spawns 4 parallel review agents**:
   - Agent 1 & 2: CLAUDE.md compliance check
   - Agent 3: Bug scan focused on the diff
   - Agent 4: Git blame context analysis
4. Scores each finding 0–100 confidence
5. Posts only findings with confidence ≥ 80 as PR comments

This is not Claude reading your diff once — it's 4 independent agents reviewing your PR simultaneously.

---

### `/clean_gone`

```bash
# Situation: you've merged 5 PRs, now have 5 stale local branches

/clean_gone

# Claude:
# 1. git fetch --prune
# 2. Finds branches marked [gone] (deleted from remote)
# 3. Removes their worktrees (if any)
# 4. Deletes the local branches
# 5. Reports what was cleaned
```

---

## Commands Accept Arguments

```bash
# Without arguments
/commit

# With an argument — override the auto-generated message
/commit "chore: bump dependencies to latest stable"

# In the command file: $ARGUMENTS becomes the user's input
```

---

## Pre-Approved Tools Reduce Friction

```yaml
---
allowed-tools: [Bash, Read, Grep, Glob]
---
```

When tools are pre-approved in the command's frontmatter, Claude runs them without asking permission. This is how `/commit` can run `git status`, `git diff`, `git log`, and `git commit` without four separate prompts.

---

## Try It

```bash
# 1. Stage a file change
echo "# test" >> README.md
git add README.md

# 2. Run commit command
/commit

# 3. See what message Claude writes — compare to what you'd have typed
```

---

**Next:** [06 — MCP Plugins: Real Tool Access](../06-mcp/README.md)
