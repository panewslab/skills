---
name: panews-web-viewer
description: Read public PANews website pages as Markdown. Use for homepage, article-page, and column-page reads.
metadata:
  author: Seven Du
  version: "2026.03.25"
---

This skill is for reading rendered PANews web pages as Markdown, including the homepage, article pages, and column pages. Use it when the user wants page content in a Markdown-friendly format with page metadata, rather than structured API fields or filtered search results.

It is best suited for single-page retrieval from PANews URLs. The skill should preserve the rendered page structure and metadata, and it should not be used for broad crawling, creator workflows, or API-style data discovery.

Read `www.panewslab.com` pages as Markdown via `Accept: text/markdown`. Responses include a YAML frontmatter block with page metadata (`title`, `description`, `image`).

Runtime behavior: this skill performs direct HTTP GET requests to `https://www.panewslab.com` with `Accept: text/markdown` and returns the rendered Markdown response. It does not require local scripts, creator credentials, or broad site crawling.

## Common User Phrases

- "Read this article as Markdown."
- "Open this column page and give me the rendered content."

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

## Standard Request Template

```text
1. Start from https://www.panewslab.com
2. Build a page URL using one of the supported locale prefixes:
   /zh, /zh-hant, /en, /ja, /ko
3. If the caller provides a PANews path without a locale prefix, prepend the prefix from `--lang`, or default to `/zh`
4. Send an HTTP GET request with:
   Accept: text/markdown
5. Return the Markdown body as-is, including YAML frontmatter metadata
6. If the response is 404, report the page as unavailable
```

## Rules

- Use a direct HTTP request with `Accept: text/markdown`
- Always include the locale prefix in the URL
- Route to `panews` if the user asks for structured search or filterable API data

## Examples

```text
https://www.panewslab.com/en
https://www.panewslab.com/en/ARTICLE_ID
https://www.panewslab.com/zh-hant/columns/COLUMN_ID
```

## Failure Handling

- If the page returns `404`, report it as unavailable rather than trying to synthesize content from API endpoints
- If the caller gives a path without a locale prefix, add the prefix from `--lang` or default to `zh`
