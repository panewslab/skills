---
name: content-format
description: Article content format guide — write in Markdown, convert it to HTML, save it to a file, then pass it to --content-file.
---

# Article Content Format

## Rule

Always write article content in **Markdown**, then convert it to HTML before submitting.

The `--content-file` parameter accepts an HTML file. Workflow:

1. Write content in Markdown
2. Convert Markdown → HTML with a Markdown CLI such as `md4x`
3. Save the HTML to a temporary file
4. Pass the file path to `--content-file`

Never write raw HTML manually.

## Conversion Commands

```bash
npx --yes md4x draft.md -t html -o draft.html
```

```bash
bunx md4x draft.md -t html -o draft.html
```

Pick the runner that exists in the current environment. Do not assume `npx` is always available.

## Example

```bash
node {Skills Directory}/panews-creator/scripts/create-article.mjs --column-id <id> --lang zh --title "..." --desc "..." --content-file draft.html --status DRAFT
```

## Markdown Guidelines

- Use `##` / `###` for section headings — do not use `#` (the article title is a separate field)
- Separate paragraphs with a blank line
- Upload images first via `upload-image.mjs`, then embed the returned CDN URL: `![alt](https://cdn.panewslab.com/...)`
- Review the rendered HTML before publishing if the article uses complex lists or code blocks
