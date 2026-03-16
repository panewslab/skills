---
name: content-format
description: Article content format guide — write in Markdown, convert to HTML, save to a file, then pass to --content-file.
---

# Article Content Format

## Rule

Always write article content in **Markdown**, then render it to HTML before submitting.

The `--content-file` parameter accepts an HTML file. Workflow:

1. Write content in Markdown
2. Render Markdown → HTML with `scripts/render-markdown.mjs` (`npx md4x` under the hood)
3. Save the HTML to a temporary file
4. Pass the file path to `--content-file`

Never write raw HTML manually.

## Example

```bash
node {Skills Directory}/panews-creator/scripts/render-markdown.mjs draft.md --output draft.html
node {Skills Directory}/panews-creator/scripts/create-article.mjs --column-id <id> --lang zh --title "..." --desc "..." --content-file draft.html --status DRAFT
```

Equivalent direct CLI call:

```bash
npx --yes md4x draft.md -t html -o draft.html
```

## Markdown Guidelines

- Use `##` / `###` for section headings — do not use `#` (the article title is a separate field)
- Separate paragraphs with a blank line
- Upload images first via `upload-image.mjs`, then embed the returned CDN URL: `![alt](https://cdn.panewslab.com/...)`
- Review the rendered HTML before publishing if the article uses complex lists or code blocks
