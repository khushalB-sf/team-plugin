# 04 — Skills: Auto-Triggered Guidance

Skills are the most powerful and subtle plugin type. They work *silently* — Claude reads them automatically when the situation matches.

---

## How Skills Work

A skill is a SKILL.md file with:
- A `description` frontmatter field — Claude reads this to decide when to trigger the skill
- A body — the guidance Claude follows once triggered

```markdown
---
name: frontend-design
description: Guidance for distinctive, intentional visual design when building
             new UI or reshaping an existing one.
---

# Frontend Design

Approach this as the design lead at a small studio...
[2000 words of precise design guidance]
```

Claude reads the `description` at the start of every session. When your request matches, it pulls in the full skill body and follows the guidance.

---

## Demo: frontend-design Skill (Already Installed)

You installed `frontend-design` earlier. Let's see the difference.

### Without the skill — what Claude would normally do:

```
You: "Build a landing page for our API product"

Claude output:
─ Generic hero with gradient background
─ "Get Started" blue button
─ Three-column features grid with icons
─ Looks like every SaaS site from 2019
```

### With frontend-design installed:

```
You: "Build a landing page for our API product"

Claude now:
1. Brainstorms a design plan (palette, typography, layout, signature element)
2. Critiques that plan — "does this look like any SaaS site?" → revises
3. Builds from the revised plan with meticulous detail
4. Self-critiques during build, takes screenshot if available

Output: distinctive typography choice, opinionated palette, one memorable element
        that fits the API/developer audience specifically
```

**The key**: you typed the exact same prompt. The skill changed the output.

---

## Demo: Security-Guidance Skill

After installing `security-guidance`:

```
You: "Add a function to parse user YAML config"

Without plugin:
    import yaml
    config = yaml.load(user_input)    # ← dangerous, loads arbitrary Python objects

With security-guidance:
    Pattern warning fires on Edit/Write:
    "yaml.load() with untrusted input is unsafe — use yaml.safe_load()"
    
    Claude fixes it before you even see the response.
```

---

## The Trigger Description Is Everything

The `description` field in a SKILL.md controls when Claude activates the skill.

```yaml
# Narrow trigger — only fires for very specific phrases
description: This skill activates when the user asks to "demonstrate skills" or
             discusses "skill development patterns".

# Broad trigger — fires for a whole domain
description: Guidance for distinctive, intentional visual design when building
             new UI or reshaping an existing one.
```

Write broad descriptions for things you always want (team coding standards, design consistency).  
Write narrow descriptions for specialized workflows you want on-demand.

---

## Try It

1. Open a new project and say:  
   `"Create a simple React dashboard for user analytics"`

2. Notice the output style with `frontend-design` installed vs. a project without it.

3. Then try:  
   `"Write a function that reads a file path from query params"`

4. With `security-guidance` active, Claude should warn about path traversal before finishing.

---

## Key Insight: Skills vs Prompting

| Normal prompting | Skill |
|-----------------|-------|
| Must include guidance in every prompt | Auto-fires every time |
| Forgotten when context clears | Always active |
| Per-person inconsistency | Team-wide consistency |
| Instructions buried in chat history | Version-controlled Markdown |

---

**Next:** [05 — Commands: User-Triggered Actions](../05-commands/README.md)
