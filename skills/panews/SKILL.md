---
name: panews
description: Query the public PANews API for the currently bundled read-only workflows: article search, listings, rankings, and daily must-reads.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Public read-only PANews content via `https://universal-api.panewslab.com`. Set the `PA-Accept-Language` request header to localize responses.

Current first-class support in this skill is limited to the bundled scripts below. Other public endpoints may appear in references as HTTP notes, but they are not part of the default supported workflow unless scripts are added later.

## When to Use

- The user wants structured JSON data from the PANews API
- The task is article discovery, article detail lookup, rankings, or daily must-reads
- The caller needs stable filters such as `columnId`, `tagId`, `authorId`, or article type

## Do Not Use When

- The user wants the rendered website page body or layout-aware Markdown output
- The task requires authentication, publishing, or creator-only routes
- The request is really about a PANews web URL rather than API data

## Standard Workflow

Copy this checklist and work through it:

```text
PANews Read Progress:
- [ ] Step 1: Decide API JSON vs website Markdown
- [ ] Step 2: Set locale (default: zh)
- [ ] Step 3: Pick the narrowest bundled script that matches the task
- [ ] Step 4: Retry once with a broader query if results are empty
- [ ] Step 5: Return the result with any filters or caveats called out
```

## Language

| Language            | Header value |
| ------------------- | ------------ |
| Simplified Chinese  | `zh`         |
| Traditional Chinese | `zh-hant`    |
| English             | `en`         |
| Japanese            | `ja`         |
| Korean              | `ko`         |

## Rules

- Always use `POST /search/articles` for keyword search — never `GET /articles?search=...`
- Default `mode=hit`; use `mode=time` only when the user explicitly wants newest results
- Default article types `NORMAL,NEWS`; add `VIDEO` only when the user explicitly asks
- This skill is read-only — for article creation and publishing use `panews-creator`
- Prefer bundled scripts before falling back to ad hoc HTTP requests
- Treat reference-only endpoints as optional HTTP notes, not as default supported workflows

## Failure Handling

- If a search query returns no results, retry once with a broader keyword or fewer filters
- If article detail returns `404`, report the article as unavailable instead of silently switching sources
- If the request is really for a public webpage, route to `panews-web-viewer`

## Scripts

```bash
node {Skills Directory}/panews/scripts/search-articles.mjs <query> [--mode hit|time] [--type NORMAL,NEWS] [--take 10] [--skip 0] [--lang zh]
node {Skills Directory}/panews/scripts/list-articles.mjs [--type NORMAL|NEWS|VIDEO] [--column-id <id>] [--tag-id <id>] [--author-id <id>] [--is-featured] [--take 10] [--skip 0] [--lang zh]
node {Skills Directory}/panews/scripts/get-article.mjs <articleId> [--related] [--lang zh]
node {Skills Directory}/panews/scripts/get-daily-must-reads.mjs [--date YYYY-MM-DD] [--special] [--lang zh]
node {Skills Directory}/panews/scripts/get-rankings.mjs [--weekly] [--lang zh]
```

## References

| Topic | Description | Reference |
| ----- | ----------- | --------- |
| Workflows | Task routing, defaults, and empty-result handling | [workflows](references/workflows.md) |
| Articles | Search, list, detail, related articles, and rankings | [articles](references/articles.md) |
| Content | Daily must-reads plus reference-only notes for adjacent public endpoints | [content](references/content.md) |
