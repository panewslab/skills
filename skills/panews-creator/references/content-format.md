---
name: content-format
description: Article content format guide — write in Markdown, convert to HTML, save to a file, then pass to --content-file.
---

# Article Content Format

## Rule

Always write article content in **Markdown**, then render it to HTML before submitting.

The `--content-file` parameter accepts an HTML file. Workflow:

1. Write content in Markdown
2. Render Markdown → HTML
3. Save the HTML to a temporary file
4. Pass the file path to `--content-file`

Never write raw HTML manually.

## Markdown Guidelines

- Use `##` / `###` for section headings — do not use `#` (the article title is a separate field)
- Separate paragraphs with a blank line
- Upload images first via `upload-image.mjs`, then embed the returned CDN URL: `![alt](https://cdn.panewslab.com/...)`
