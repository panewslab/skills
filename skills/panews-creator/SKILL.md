---
name: panews-creator
description: PANews creator workflow — authenticate, manage column applications, upload images, and publish articles. Requires PA-User-Session. Use panews for public read-only access instead.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Authenticated creator workflow via `https://universal-api.panewslab.com`. All endpoints require a `PA-User-Session` header.

## Language

| Language            | Value     |
| ------------------- | --------- |
| Simplified Chinese  | `zh`      |
| Traditional Chinese | `zh-hant` |
| English             | `en`      |
| Japanese            | `ja`      |
| Korean              | `ko`      |

## Standard Workflow

1. Validate session → `get-current-user`
2. Get full context → `get-creator-context`
3. No approved column → run column application flow (`apply-column`)
4. Has approved column → search tags (`GET /tags`) → execute article operations

## Session

Resolve `PA-User-Session` from environment in order: `PANEWS_USER_SESSION` → `PA_USER_SESSION` → `PA_USER_SESSION_ID`. On `401`, discard and re-resolve.

## Scripts

```bash
node {Skills Directory}/panews-creator/scripts/get-current-user.mjs [--session <value>]
node {Skills Directory}/panews-creator/scripts/get-creator-context.mjs [--session <value>]
node {Skills Directory}/panews-creator/scripts/upload-image.mjs <file-path> [--watermark] [--session <value>]
node {Skills Directory}/panews-creator/scripts/apply-column.mjs --name <name> --desc <desc> --picture <url> --links <url,...> [--session <value>]
node {Skills Directory}/panews-creator/scripts/apply-column.mjs --column-id <id> [--name] [--desc] [--picture] [--links] [--session <value>]
node {Skills Directory}/panews-creator/scripts/search-tags.mjs <keyword> [--take 20] [--skip 0] [--lang zh]
node {Skills Directory}/panews-creator/scripts/list-articles.mjs --column-id <id> [--status DRAFT|PENDING|PUBLISHED|REJECTED] [--take 20] [--skip 0] [--session <value>]
node {Skills Directory}/panews-creator/scripts/create-article.mjs --column-id <id> --lang <lang> --title <title> --desc <desc> --content-file <path> [--status DRAFT|PENDING] [--cover <url>] [--tags <id,...>] [--session <value>]
node {Skills Directory}/panews-creator/scripts/update-article.mjs --column-id <id> --article-id <id> [fields...] [--session <value>]
node {Skills Directory}/panews-creator/scripts/delete-article.mjs --column-id <id> --article-id <id> [--session <value>]
```

## References

| Topic | Description | Reference |
| ----- | ----------- | --------- |
| Session | Resolve, validate, and handle session errors | [session](references/session.md) |
| Column Applications | Submit or resubmit a column application | [columns](references/columns.md) |
| Tags | Search tags by keyword to get IDs for article tagging | [tags](references/tags.md) |
| Articles | List, create, update, delete column articles | [articles](references/articles.md) |
| Content Format | Write in Markdown, render to HTML, pass via --content-file | [content-format](references/content-format.md) |
| Upload | Upload images to PANews CDN | [upload](references/upload.md) |
