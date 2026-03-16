---
name: panews
description: Query public PANews content via the unified API. Use for structured article search, listings, rankings, daily must-reads, and cryptocurrency data.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Public read-only PANews content via `https://universal-api.panewslab.com`. Set the `PA-Accept-Language` request header to localize responses.

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

## Scripts

```bash
node {Skills Directory}/panews/scripts/search-articles.mjs <query> [--mode hit|time] [--type NORMAL,NEWS] [--take 10] [--skip 0] [--lang zh]
node {Skills Directory}/panews/scripts/list-articles.mjs [--type NORMAL|NEWS|VIDEO] [--column-id <id>] [--tag-id <id>] [--author-id <id>] [--is-featured] [--take 10] [--skip 0] [--lang zh]
node {Skills Directory}/panews/scripts/get-article.mjs <articleId> [--related] [--lang zh]
node {Skills Directory}/panews/scripts/get-daily-must-reads.mjs [--date YYYY-MM-DD] [--special] [--lang zh]
node {Skills Directory}/panews/scripts/get-rankings.mjs [--weekly] [--lang zh]
```

## References

| Topic    | Description                                               | Reference                          |
| -------- | --------------------------------------------------------- | ---------------------------------- |
| Articles | Search, list, detail, related articles, and rankings      | [articles](references/articles.md) |
| Content  | Daily must-reads, columns, tags, crypto, events, calendar | [content](references/content.md)   |
