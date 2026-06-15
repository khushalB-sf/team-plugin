---
description: Generate a daily standup update from your recent git activity and current branch state
argument-hint: [hours-back]
allowed-tools: [Bash]
---

# Daily Standup Generator

Generate a concise standup from real git history and current work state.

## Instructions

1. Get the author email: run `git config user.email`

2. Get recent commits (default: last 24 hours, or use $ARGUMENTS hours if provided):
   ```
   git log --since="24 hours ago" --oneline --author=<email>
   ```

3. Get current work in progress:
   ```
   git status --short
   git diff --stat HEAD
   ```

4. Check for any blocked items:
   ```
   git stash list
   ```

5. Format the standup as:

   **Yesterday**
   - [group commits by feature/area, one bullet per area, use past tense]
   
   **Today**
   - [infer from uncommitted changes and current branch name]
   
   **Blockers**
   - [mention stashed items or "None" if clean]

## Rules

- Keep it to 3–5 bullets total
- Use plain English, not commit message syntax
- Mention ticket numbers if they appear in commit messages (e.g. "AUTH-234")
- If there are no commits in the time range, say "No commits — working on [current branch name]"
- Never include file lists, just high-level areas (e.g. "auth service" not "src/services/auth.ts")
