# PANews Skills

PANews's official collection of agent skills.

## Installation

```bash
bunx skills add panewslab/skills
```

```bash
npx skills add panewslab/skills
```

## Skills

| Skill                                                  | Description                                                                             |
| ------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| [panews](skills/panews/SKILL.md)                       | Query the public PANews API for the currently bundled read-only workflows: article search, listings, rankings, and daily must-reads |
| [panews-creator](skills/panews-creator/SKILL.md)       | PANews creator workflow — authenticate, manage columns, upload images, publish articles |
| [panews-web-viewer](skills/panews-web-viewer/SKILL.md) | Read public PANews website pages as Markdown                                            |

## Choosing a Skill

| Need | Use |
| ---- | --- |
| Search articles, list article feeds, fetch rankings, or get daily must-reads as JSON | [panews](skills/panews/SKILL.md) |
| Read the rendered website page, article body, or column page as Markdown | [panews-web-viewer](skills/panews-web-viewer/SKILL.md) |
| Validate a creator session, apply for a column, upload assets, or create/update/delete articles | [panews-creator](skills/panews-creator/SKILL.md) |

## Quality Goals

- Keep `SKILL.md` files task-oriented: say when to use the skill, when not to use it, and what the default path is.
- Prefer bundled scripts over ad hoc commands when the same task repeats.
- Put edge cases and validation loops in the skill, not in the caller's prompt.
- Use references for deeper API details and checklists, not for the primary workflow.
- Do not describe reference-only endpoints as if they were first-class supported workflows.
