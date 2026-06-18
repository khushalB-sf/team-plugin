# Plan: `/react-team-status` command (morning `start` + EOD `end`)

A single plugin command, invoked as `/react-team-status start` (morning) and
`/react-team-status end` (EOD). It both **takes the tasks you type** and **uses git
activity** to suggest/track progress, and it **carries forward** work across the day
and across days via a per-date state file.

---

## Phase 0 — Documentation Discovery (verified)

Source: official Claude Code docs (plugins, plugins-reference, skills) + the two existing
commands in this plugin (`commands/standup.md`, `commands/ticket.md`).

### Allowed APIs / facts (cite these, do not invent)

- **Command file → name**: a plugin file at `commands/react-team-status.md` becomes
  `/react-team-status` (namespaced `/team-plugin:react-team-status`). No `.claude-plugin/`
  nesting — `commands/` sits at the plugin root. *(plugins-reference)*
- **Frontmatter fields** (supported): `description`, `argument-hint`, `allowed-tools`,
  `model`, `disable-model-invocation`, `user-invocable`, `effort`, `paths`, `shell`,
  `hooks`. *(skills docs)*
- **Arguments**:
  - `$ARGUMENTS` = full raw string after the command name.
  - First positional = `$ARGUMENTS[0]` **or** the shorthand `$0`. Second = `$ARGUMENTS[1]`/`$1`.
  - ⚠️ Anti-pattern: treating bare `$1` as "the first argument" — `$0` is the first.
- **State persistence**: none built in. Write/read files with the `Bash`/`Write`/`Read`
  tools. The `` !`cmd` `` dynamic-injection syntax runs a shell command at load time and
  inlines its stdout into the prompt — use it to surface today's/yesterday's state files.
- **Existing patterns to COPY from**:
  - `commands/standup.md:1-5` — frontmatter shape (`description`, `argument-hint`,
    `allowed-tools: [Bash]`), and `git log --since=... --author=<email>` usage.
  - `commands/ticket.md:11-29` — `$ARGUMENTS` validation, interactive "ask the user then
    wait", and confirmation-message style.

### Design decisions (locked with user)

1. **One command, branch on `$0`** = `start` | `end`.
2. **Persist & recall** to a per-date file: `~/.claude/react-team-status/<YYYY-MM-DD>.md`
   (machine-global, one combined status per day across all projects).
3. **Both task sources**: user types tasks AND git activity is used to suggest tasks and
   track progress.
4. **Carry-forward chain**: yesterday's EOD `Tomorrow's Plan` → today's `start` `Today's Task`;
   morning `Today's Task` → EOD `Today's Update` (with statuses); incomplete items → next
   `Tomorrow's Plan`.

### Output formats (exact templates the command must emit)

**`start` (morning):**
```
Date : <YYYY-MM-DD>
Today's Task:
Working on <Project name 1>
* Action Item 1
* Action Item 2
    * Sub Item 1
    * Sub Item 2
Working on <Project name 2>
* Action Item 1
* Action Item 2

Blockers/Queries/Concerns:
None / <list>
```

**`end` (EOD):**
```
Today's Update:
Working on <Project name 1>
* Action Item 1 [Done/inprogress/Yet To start]
* Action Item 2 [Done/inprogress/Yet To start]
    * Sub Item 1 [Done/inprogress/Yet To start]
Working on <Project name 2>
* Action Item 1 [Done/inprogress/Yet To start]

Others:
- <DSM, sessions, team meetings, etc.>

Tomorrow's Plan:
- <every inprogress or Yet To start item>

Blockers/Queries/Concerns:
None / <list>
```

---

## Phase 1 — Scaffold the command file

**What to implement** — create `commands/react-team-status.md`. COPY the frontmatter shape
from `commands/standup.md:1-5`; expand `allowed-tools` to `[Bash, Read, Write]`.

```
---
description: Add your daily React team status — `start` for the morning plan, `end` for the EOD update
argument-hint: [start|end]
allowed-tools: [Bash, Read, Write]
---
```

Then a body that:
1. Reads the action from `$0` (`$ARGUMENTS[0]`).
2. Validates it is exactly `start` or `end`; otherwise prints
   `Usage: /react-team-status start | end` and stops.
3. Computes today's file path via Bash: `~/.claude/react-team-status/$(date +%Y-%m-%d).md`,
   and ensures the directory exists (`mkdir -p ~/.claude/react-team-status`).
4. Branches into the Phase 2 (`start`) or Phase 3 (`end`) instructions.

**Verification**: `/react-team-status` with no arg, or a junk arg, prints the usage line and
does nothing else.

**Anti-pattern guards**: do NOT use bare `$1` for the first arg (use `$0`). Do NOT invent a
persistence API — use plain Bash/Write file I/O.

---

## Phase 2 — `start` branch (morning plan)

**What to implement** (inside the same file, under an "If action is `start`" section):

1. **Carry forward**: read the most recent *prior* status file (the newest dated file older
   than today) and, if it has a `Tomorrow's Plan:` section, pre-fill today's `Today's Task`
   from those items. Surface it with `` !`ls -1 ~/.claude/react-team-status/*.md ...` `` or a
   `Read` of the resolved path.
2. **Git suggestions**: run `git config user.email`, then
   `git log --since="18 hours ago" --author=<email> --oneline` and read the current branch
   (`git rev-parse --abbrev-ref HEAD`). Use branch/commit text to suggest project names and
   in-progress action items. (Pattern: `commands/standup.md:13-18`.)
3. **Ask the user** (pattern: `commands/ticket.md:18-19`): present the carried-forward +
   git-suggested draft and ask them to confirm/add project names, action items, and sub-items.
   Wait for the response.
4. **Format** strictly into the `start` template from Phase 0. Ask for Blockers; default `None`.
5. **Save** the rendered block to `~/.claude/react-team-status/<today>.md` (overwrite).
6. **Output** the block to the user verbatim (ready to paste into Slack/standup), then confirm
   the saved path.

**Verification**: after running, `cat ~/.claude/react-team-status/<today>.md` shows the block;
running `start` twice on the same day overwrites rather than duplicates; a prior file's
`Tomorrow's Plan` shows up as today's tasks.

---

## Phase 3 — `end` branch (EOD update)

**What to implement** (under an "If action is `end`" section):

1. **Recall**: `Read` today's file `~/.claude/react-team-status/<today>.md`. If missing, tell
   the user to run `/react-team-status start` first, but still allow them to provide tasks
   inline (graceful fallback).
2. **Git progress detection**: `git log --since="<this morning>" --author=<email> --oneline`
   (since ~9–10 hours ago, or since the file's mtime) + `git status --short`. Match commit
   subjects/branch to the morning's action items to *propose* a status for each:
   `Done` (committed/merged), `inprogress` (uncommitted changes / partial), `Yet To start`.
3. **Ask the user** to confirm/override each item's status and to fill `Others:` (DSM, sessions,
   team meetings, etc.). Wait for the response.
4. **Auto-build `Tomorrow's Plan`**: every item still `inprogress` or `Yet To start`.
5. **Format** strictly into the `end` template from Phase 0. Ask for Blockers; default `None`.
6. **Save** the rendered EOD block back to today's file (append under a `--- EOD ---` marker, or
   write a sibling `<today>-eod.md`) so tomorrow's `start` can read its `Tomorrow's Plan`.
7. **Output** the EOD block verbatim and confirm the saved path.

**Verification**: with a morning file present, `end` reproduces those tasks with status tags;
commits since morning flip matching items to `Done`; `Tomorrow's Plan` lists exactly the
non-Done items; the saved EOD `Tomorrow's Plan` is picked up by the next day's `start`.

**Anti-pattern guards**: never silently invent statuses — every `Done` must trace to a commit
or explicit user confirmation. Never log/store secrets from commit messages.

---

## Phase 4 — README + final verification

1. **README**: in `commands/` section of `README.md` (after the `/ticket` entry, ~line 26),
   add a `/react-team-status` block documenting `start` and `end`, the carry-forward behavior,
   and where state is stored.
2. **Spec compliance grep**: confirm no bare-`$1`-as-first-arg usage —
   `grep -n '\$1' commands/react-team-status.md` should only appear where `$1` is genuinely the
   *second* arg (ideally none).
3. **Frontmatter check**: `head -6 commands/react-team-status.md` matches the Phase 1 block.
4. **End-to-end dry run**: `/react-team-status start` → fill a task → `/react-team-status end`
   → confirm statuses, Others, Tomorrow's Plan render correctly and the file round-trips.
5. **Verify command appears**: `/help` (or plugin command list) shows `/react-team-status` with
   the `[start|end]` arg hint.

---

## Open question for execution time

- **Git scope across projects**: the format lists multiple projects, but `git log` is per-repo.
  Default plan = use the *current* repo's git for suggestions/progress and let the user add other
  projects manually. If a single combined view across several repos is needed, that's a follow-up
  (configurable repo list) — out of scope for v1.
