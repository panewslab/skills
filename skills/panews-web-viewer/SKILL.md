---
name: panews-web-viewer
description: Read public PANews website pages as Markdown. Use for homepage, article-page, and column-page reads.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Fetches `www.panewslab.com` pages as Markdown via `Accept: text/markdown`. Responses include a YAML frontmatter block with page metadata (`title`, `description`, `image`).

Current first-class support in this skill is single-page fetching through the bundled script below. It is intended for homepage, article-page, and column-page reads, not broad site crawling.

## When to Use

- The user provides or implies a PANews web URL
- The task is to read the rendered article page, homepage, or column page as Markdown
- The caller wants the page content, not the underlying JSON API shape

## Do Not Use When

- The task is structured search, rankings, or filtered API retrieval
- The task requires creator authentication or write access
- The user asks for JSON fields rather than page Markdown

## Supported Languages

| Locale              | Prefix     |
| ------------------- | ---------- |
| Simplified Chinese  | `/zh`      |
| Traditional Chinese | `/zh-hant` |
| English             | `/en`      |
| Japanese            | `/ja`      |
| Korean              | `/ko`      |

## Standard Workflow

```text
PANews Web Progress:
- [ ] Step 1: Confirm this is a website-page task, not an API task
- [ ] Step 2: Choose the locale prefix
- [ ] Step 3: Fetch with Accept: text/markdown
- [ ] Step 4: Preserve frontmatter metadata in the response
```

## Scripts

```bash
node {Skills Directory}/panews-web-viewer/scripts/fetch-page.mjs <path-or-url> [--lang zh]
```

## Usage

```bash
node {Skills Directory}/panews-web-viewer/scripts/fetch-page.mjs /articles/ARTICLE_ID --lang en
node {Skills Directory}/panews-web-viewer/scripts/fetch-page.mjs https://www.panewslab.com/zh-hant/columns/COLUMN_ID
```

## Rules

- Prefer the bundled `fetch-page.mjs` script; if you fall back to `curl`, use `-sSL`
- Always include the locale prefix in the URL
- Route to `panews` if the user asks for structured search or filterable API data

## Failure Handling

- If the page returns `404`, report it as unavailable rather than trying to synthesize content from API endpoints
- If the caller gives a path without a locale prefix, add the prefix from `--lang` or default to `zh`
