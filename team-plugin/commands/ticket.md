---
description: Create a feature branch and link it to a ticket ID (e.g. /ticket AUTH-234)
argument-hint: <ticket-id>
allowed-tools: [Bash]
---

# Ticket Branch Creator

Create a properly named feature branch from a ticket ID.

## Instructions

The user provided ticket ID: $ARGUMENTS

1. Validate that $ARGUMENTS looks like a ticket ID (letters-numbers, e.g. AUTH-234, FEAT-12).
   If it doesn't, say: "Please provide a ticket ID like AUTH-234"

2. Ask the user: "What is this ticket about? (one line description)"
   Wait for the response.

3. Build the branch name:
   - Format: `<ticket-id-lowercase>/<kebab-case-description>`
   - Example: `auth-234/add-refresh-token-rotation`
   - Max 60 chars total, truncate description if needed

4. Run: `git checkout -b <branch-name>`

5. Confirm: "Branch created: `<branch-name>`"
   "Commits on this branch will appear in your standup as: [area] work"
