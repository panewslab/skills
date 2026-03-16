---
name: panews-creator
description: PANews creator workflow — authenticate, manage column applications, upload images, and publish articles. Requires PA-User-Session. Use panews for public read-only access instead.
metadata:
  author: Seven Du
  version: "2026.03.16"
---

Authenticated creator workflow via `https://universal-api.panewslab.com`. All endpoints require a `PA-User-Session` header.

## When to Use

- The task needs an authenticated creator session
- The user wants to check creator eligibility, manage a column application, upload images, or create/update/delete an article
- The task changes PANews state

## Do Not Use When

- The task is public read-only article or ranking lookup
- The user wants a rendered PANews webpage instead of creator API actions
- There is no valid `PA-User-Session` and the request cannot proceed without one

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
4. Has approved column → search tags (`GET /tags`) → convert Markdown to HTML → execute article operations

Copy this checklist and work through it:

```text
PANews Creator Progress:
- [ ] Step 1: Validate the session
- [ ] Step 2: Inspect creator context and approved columns
- [ ] Step 3: If needed, complete or resubmit the column application
- [ ] Step 4: Upload assets and gather tag IDs
- [ ] Step 5: Convert Markdown to HTML with the available package runner
- [ ] Step 6: Create or update the article
- [ ] Step 7: Verify the API response before finishing
```

## Session

Resolve `PA-User-Session` from environment in order: `PANEWS_USER_SESSION` → `PA_USER_SESSION` → `PA_USER_SESSION_ID`. On `401`, discard and re-resolve.

## Rules

- Validate the session before any mutating action
- Never hand-write raw HTML article bodies; convert Markdown with a tool such as `md4x` first
- Treat `401` as a hard stop: discard the session and re-resolve it
- Only publish to `PENDING` when the user is ready to submit for review; otherwise default to `DRAFT`

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

## Failure Handling

- If session validation fails with `401`, stop and obtain a fresh session before retrying
- If there is no approved column, do not attempt article creation; complete the application flow first
- If content formatting looks wrong, re-render the Markdown and inspect the generated HTML before submitting
- If an article update or delete fails because the status is immutable, fetch the current article list and report the blocking state clearly

## References

| Topic | Description | Reference |
| ----- | ----------- | --------- |
| Session | Resolve, validate, and handle session errors | [session](references/session.md) |
| Column Applications | Submit or resubmit a column application | [columns](references/columns.md) |
| Tags | Search tags by keyword to get IDs for article tagging | [tags](references/tags.md) |
| Articles | List, create, update, delete column articles | [articles](references/articles.md) |
| Content Format | Write in Markdown, render to HTML, pass via --content-file | [content-format](references/content-format.md) |
| Upload | Upload images to PANews CDN | [upload](references/upload.md) |
