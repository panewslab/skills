This file provides guidance to AI agents (Claude Code, Codex, Copilot, etc.) when working with code in this repository.

## Creating a New Skill

### Directory Structure

```text
skills/
  {skill-name}/                 # kebab-case directory name
    SKILL.md                    # Required: skill definition
    references/                 # Optional: reference documents
      {topic}.md
    scripts/                    # Optional: executable scripts
      {script-name}.{mjs|py|sh} # Script entry points
```

### Naming Conventions

- Skill directory: kebab-case (e.g., `panews-creator`, `log-monitor`)
- `SKILL.md`: always uppercase, always this exact filename
- Scripts: kebab-case `.mjs` (e.g., `get-article.mjs`, `upload-image.mjs`)
- References: kebab-case `.md` (e.g., `session-resolution.md`, `article-workflow.md`)

### SKILL.md Format

```markdown
---
name: <skill-name>
description: <One sentence describing when to use this skill.>
metadata:
  author: <Author Name>
  version: "<YYYY.MM.DD>"
---

## <Section>

<Rules or notes for this section.>

## Scripts

\`\`\`bash
{Skills Directory}/{skill-name}/scripts/{script}.mjs
\`\`\`

## References

| Topic      | Description                | Reference                       |
| ---------- | -------------------------- | ------------------------------- |
| Topic Name | What this reference covers | [link-name](references/file.md) |
```
