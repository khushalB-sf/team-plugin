---
description: Add your daily React team status — `start` for the morning plan, `end` for the EOD update
argument-hint: [start|end]
allowed-tools: [Bash, Read, Write, mcp__plugin_team-plugin_m365-calendar__get_todays_meetings]
---

# React Team Daily Status

Record your daily status in the team's standard format. One command, two modes:
`start` (morning plan) and `end` (end-of-day update). State is saved per day so the
EOD run recalls the morning plan, and incomplete work carries forward to the next day.

## Setup (always run first)

The action requested is: **$1**

1. Validate the action. If `$1` is not exactly `start` or `end`, print this and stop:
   ```
   Usage: /react-team-status start | end
   ```

2. Resolve the state location (do not duplicate — reuse these values below):
   ```bash
   mkdir -p ~/.claude/react-team-status
   TODAY=$(date +%Y-%m-%d)
   TODAY_FILE=~/.claude/react-team-status/$TODAY.md
   ```

3. Branch: if `$1` is `start`, follow **Mode: start**. If `end`, follow **Mode: end**.

---

## Mode: start (morning plan)

1. **Carry forward yesterday's plan.** Find the most recent prior status file and pull its
   `Tomorrow's Plan:` section to seed today's tasks:
   ```bash
   PREV_FILE=$(find ~/.claude/react-team-status -name '*.md' 2>/dev/null \
     | grep -v "$TODAY" | sort | tail -1)
   [ -n "$PREV_FILE" ] && echo "--- prior file: $PREV_FILE ---" && cat "$PREV_FILE"
   ```
   If a `Tomorrow's Plan:` section exists, treat those items as the starting `Today's Task`.

2. **Suggest from git.** Use real activity to propose project names and in-progress items:
   ```bash
   EMAIL=$(git config user.email)
   git rev-parse --abbrev-ref HEAD 2>/dev/null
   git log --since="18 hours ago" --author="$EMAIL" --oneline 2>/dev/null
   ```
   Map the current branch / recent commit subjects to likely project names and action items.

3. **Ask the user** to confirm and complete the plan:
   > "Here's your draft for today (carried-forward + git suggestions). Which projects are you
   > working on, and what are the action items / sub-items? Add or correct anything."

   Wait for the response.

4. **Build the `Others` list — calendar first, then ask.**
   - Call the calendar tool `mcp__plugin_team-plugin_m365-calendar__get_todays_meetings` to read
     today's Microsoft 365 meetings. Add each returned meeting **title** as an `Others:` line.
   - If the tool succeeds, show the list and ask: "These are today's meetings from your calendar.
     Add anything that isn't on it, or remove anything you'll skip."
   - If the tool errors (e.g. "Not signed in" or the server isn't configured), fall back to the
     manual questions and tell the user calendar sync is unavailable:
     - "Do you have to attend DSM today? (Yes/No)" → `Yes` adds `- Attend DSM`
     - "Do you have any Session today? (Yes/No)" → `Yes` adds `- Attend Session`
     - "Anything else for Others? (e.g. team meeting, 1:1 — or None)" → add each item listed.

   If there are no meetings and nothing is added, omit the `Others:` section entirely.

5. **Ask for blockers:** "Any blockers, queries, or concerns? (default: None)". Wait.

6. **Render** exactly this structure (omit empty sub-item lines; one `Working on` block per
   project; include `Others:` only if there is at least one item):
   ```
   Date : <TODAY>
   Today's Task:
   Working on <Project name 1>
   * <Action Item 1>
   * <Action Item 2>
       * <Sub Item 1>
       * <Sub Item 2>
   Working on <Project name 2>
   * <Action Item 1>
   * <Action Item 2>

   Others:
   - <e.g. Attend DSM>
   - <e.g. Attend Session>

   Blockers/Queries/Concerns:
   None / <list>
   ```

7. **Save** the rendered block to `$TODAY_FILE` (overwrite if it exists), using the Write tool
   or a Bash heredoc. Then **print the block** verbatim so the user can paste it, and confirm:
   `Saved to ~/.claude/react-team-status/<TODAY>.md`.

---

## Mode: end (end-of-day update)

1. **Recall the morning plan.** Read `$TODAY_FILE`. If it is missing, tell the user:
   "No morning plan found for today — run `/react-team-status start` first, or paste your tasks
   and I'll build the EOD update directly." Then proceed with whatever tasks they provide.

2. **Detect progress from git.** Look at what actually happened today:
   ```bash
   EMAIL=$(git config user.email)
   git log --since="10 hours ago" --author="$EMAIL" --oneline 2>/dev/null
   git status --short 2>/dev/null
   ```
   For each action item from the morning plan, propose a status:
   - `Done` — a matching commit landed (or it was merged).
   - `inprogress` — matching uncommitted changes, or partial work.
   - `Yet To start` — no activity found.

   Every `Done` must trace to a commit or to explicit user confirmation — never guess.

3. **Ask the user** to confirm/override each item's status:
   > "Here are your tasks with proposed statuses from git. Correct any of them."

   Wait for the response.

4. **Carry the morning's `Others` forward, then confirm.** Read the `Others:` section from the
   morning plan in `$TODAY_FILE` and present it as the default:
   > "This morning you planned: <list of Others items>. Did each happen? Add anything new
   > (e.g. an unplanned team meeting) or remove anything that didn't."

   If the morning had no `Others:` section, still ask the recurring questions:
   "Did you attend DSM? (Yes/No)" and "Did you attend any Session? (Yes/No)". Keep each `Yes`
   item. Omit the `Others:` section if nothing applies.

5. **Build `Tomorrow's Plan`** automatically: every item still marked `inprogress` or
   `Yet To start`.

6. **Ask for blockers:** "Any blockers, queries, or concerns? (default: None)". Wait.

7. **Render** exactly this structure:
   ```
   Today's Update:
   Working on <Project name 1>
   * <Action Item 1> [Done/inprogress/Yet To start]
   * <Action Item 2> [Done/inprogress/Yet To start]
       * <Sub Item 1> [Done/inprogress/Yet To start]
   Working on <Project name 2>
   * <Action Item 1> [Done/inprogress/Yet To start]

   Others:
   - <DSM, sessions, team meetings, etc.>

   Tomorrow's Plan:
   - <every inprogress or Yet To start item>

   Blockers/Queries/Concerns:
   None / <list>
   ```

8. **Save** the EOD block back to `$TODAY_FILE`, appended under an `--- EOD ---` marker (keep
   the morning plan above it). This makes the `Tomorrow's Plan:` section discoverable by the
   next day's `start` run. Then **print the block** verbatim and confirm the saved path.

---

## Rules

- Match the templates exactly — heading wording, the `Working on` lines, `*` for action items,
  and 4-space-indented `*` for sub-items.
- Never log or store secrets that appear in commit messages.
- Keep statuses honest: `Done` only when git or the user confirms it.
