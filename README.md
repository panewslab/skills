# PANews Skills

PANews's official collection of agent skills for cryptocurrency and blockchain news, creator workflows, and PANews web-page reading.

## Installation

```bash
# Using Bun
bunx skills add panewslab/skills

# Using NPM
npx skills add panewslab/skills
```

If your AI assistant supports skill installation, you can also send:

```txt
Install PANews skills at github.com/panewslab/skills
```

## Skills

| Skill                                                  | Description                                                                                                                                                                |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [panews](skills/panews/SKILL.md)                       | Structured PANews cryptocurrency and blockchain news discovery across briefings, article search, rankings, topics, columns, series, events, calendars, and editorial picks |
| [panews-creator](skills/panews-creator/SKILL.md)       | Authenticated PANews creator workflows for session validation, columns, drafts, submissions, image uploads, tag search, and article creation or updates                    |
| [panews-web-viewer](skills/panews-web-viewer/SKILL.md) | Protocol-focused skill for reading PANews homepage, article, and column web pages as Markdown with page metadata                                                           |

## Choosing a Skill

| Need                                                                                                                                | Use                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| Understand what is happening in crypto, search PANews coverage, browse rankings, columns, series, topics, events, or calendars      | [panews](skills/panews/SKILL.md)                       |
| Read the rendered PANews homepage, article page, or column page as Markdown instead of JSON/API fields                              | [panews-web-viewer](skills/panews-web-viewer/SKILL.md) |
| Validate a creator session, manage drafts or submissions, upload images, search tags, apply for a column, or create/update articles | [panews-creator](skills/panews-creator/SKILL.md)       |

## Routing Guidance

- Use `panews` for structured PANews news discovery and API-style retrieval.
- Use `panews-web-viewer` when the task is page rendering as Markdown from a PANews URL.
- Use `panews-creator` only for authenticated creator operations that require `PA-User-Session`.
