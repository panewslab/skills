---
name: panews-web-viewer
description: Read public PANews website pages as Markdown. Use when the user wants to browse www.panewslab.com pages — homepage, article content, or column listings.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Fetches `www.panewslab.com` pages as Markdown via `Accept: text/markdown`. Responses include a YAML frontmatter block with page metadata (`title`, `description`, `image`). Use `panews` instead for structured API queries or search.

## Supported Languages

| Locale              | Prefix     |
| ------------------- | ---------- |
| Simplified Chinese  | `/zh`      |
| Traditional Chinese | `/zh-hant` |
| English             | `/en`      |
| Japanese            | `/ja`      |
| Korean              | `/ko`      |

## Usage

```bash
curl -sSL -H 'Accept: text/markdown' 'https://www.panewslab.com/zh'
curl -sSL -H 'Accept: text/markdown' 'https://www.panewslab.com/en/articles/ARTICLE_ID'
curl -sSL -H 'Accept: text/markdown' 'https://www.panewslab.com/zh-hant/columns/COLUMN_ID'
```

## Rules

- Always use `-sSL` to follow redirects
- Always include the locale prefix in the URL
