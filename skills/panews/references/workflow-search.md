# Search

**Trigger**: User wants to search for a keyword, project, event, or topic.
Common phrases: "Search for Bitcoin ETF articles", "Any reports on XX", "Find news about XX".

Difference from other scenarios:
- Search → user actively inputs keywords, finds matching content
- Deep dive ([workflow-topic-research](./workflow-topic-research.md)) → user wants a comprehensive understanding of a topic from multiple sources
- Today's briefing → focused on current day's latest content

## Steps

### 1. (Optional) Get hot search keywords for inspiration

When the user has no clear keyword or wants to discover trending topics:

```bash
node cli.mjs get-hooks --category search-keywords --lang <lang>
```

Present the hot keywords for the user to choose from.

### 2. Execute the search

```bash
node cli.mjs search-articles "<keyword>" [--mode SMART|EXACT] [--take 10] --lang <lang>
```

**Search modes**:
- `SMART` (default) — semantic search, good for natural language descriptions
- `EXACT` — exact match, good for proper nouns and project names

### 3. Deep dive into an article

Get the article ID from the search results and go to [workflow-read-article](./workflow-read-article.md).

## Output requirements

- Include title, summary, and publish time with each result
- If results are sparse or irrelevant, suggest trying different keywords or switching modes
- Do not add information beyond the search results
