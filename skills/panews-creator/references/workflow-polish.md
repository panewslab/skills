# Polish an Article

**Trigger**: User wants to improve article quality. Common phrases: "Check this for me", "Polish this", "Are there any issues with this article".

This workflow calls no CLI commands — it is purely Claude's text processing capability.

## Steps

### 1. Get the article content

The user can provide Markdown, HTML, or plain text.

### 2. Review by dimension (flag only issues)

- **Accuracy**: any obvious factual errors or vague claims
- **Structure**: is the logic clear, do paragraphs flow
- **Title vs. content**: does the title accurately reflect the content
- **Summary**: does it help readers quickly decide if the article is worth reading
- **Language**: any awkward sentences, ambiguity, or overly stiff expressions

### 3. Output format

- Start with an overall assessment (1–2 sentences)
- List specific suggestions by dimension, noting location (which paragraph or sentence)
- Where rewriting is needed, provide a before/after comparison

### 4. Ask about next steps

Would you like me to rewrite it for you, or will you adjust it yourself? If ready to publish, transition naturally to [workflow-publish](./workflow-publish.md).

## Principles

- Respect the author's perspective and style — only fix expression issues, not positions
- Do not proactively suggest cutting core content
- Do not invent new arguments or data on behalf of the user
