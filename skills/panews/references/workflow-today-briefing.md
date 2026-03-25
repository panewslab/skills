# Today's Briefing

**Trigger**: The user wants to know what happened today or recently without naming a specific topic.
Common prompts include "What happened today?", "What's going on in crypto lately?", or "Summarize today's top news."

Difference from "browse latest news":
- Today's briefing -> synthesized analysis with narrative and context
- Browse latest news -> direct listing for fast scanning

## Steps

### 1. Fetch today's must-reads

```bash
node cli.mjs get-daily-must-reads --lang <lang>
```

### 2. Fetch the 24-hour trending articles

```bash
node cli.mjs get-rankings --type daily --take 10 --lang <lang>
```

### 3. Consolidate the results

Combine both sources, remove duplicates, and decide which 3 to 5 items matter most.

### 4. Write the briefing

Use this structure:

- First line: summarize today's market mood in one sentence (calm / active / volatile)
- 3 to 5 news items: title plus one sentence on why it matters
- Final line: "Source: PANews. Updated at [time]."

## Output Requirements

- Keep it within 400 words.
- When a technical term first appears, add a short explanation in parentheses.
- Do not show raw JSON or article IDs.
