---
name: workflows
description: Common PANews read-only task routes and defaults. Use to choose the right bundled script quickly.
---

# PANews Workflows

## Route the Request First

1. If the user wants structured JSON data, use this skill.
2. If the user wants the rendered website page as Markdown, use `panews-web-viewer`.
3. If the user wants to publish or manage creator content, use `panews-creator`.
4. If the task depends on a reference-only endpoint, treat it as an exception path rather than the default workflow.

## Common Tasks

### Search by keyword

- Default script: `scripts/search-articles.mjs`
- Default mode: `hit`
- Switch to `--mode time` only when the user explicitly asks for newest-first results

### Browse article feeds

- Default script: `scripts/list-articles.mjs`
- Add filters only when the user provides a column, tag, author, or feed flag

### Fetch one article

- Default script: `scripts/get-article.mjs`
- Add `--related` when the user also wants nearby reading recommendations

### Get curated lists

- Daily must-reads: `scripts/get-daily-must-reads.mjs`
- Hot rankings: `scripts/get-rankings.mjs`

## Defaults

- Locale: `zh` unless the user asks for another language
- Search result types: `NORMAL,NEWS`
- Page size: keep bundled script defaults unless the user asks for more

## Reference-Only Endpoints

- `columns`, `tags`, `crypto`, `events`, and `calendar` are not part of the main bundled workflow in the current skill version
- If one of these becomes a repeated task, add a script before promoting it into the primary skill surface

## Empty or Missing Results

- If search returns nothing, retry once with a broader query before concluding there are no matches.
- If a direct article lookup returns `404`, report that the article is unavailable rather than switching to a different endpoint silently.
- If a result set is unexpectedly empty for a niche filter, remove only the narrowest filter and retry once.
