---
name: panews
description: >
  Entry point for reading PANews cryptocurrency / blockchain news and market narratives.
  Triggers: today's headlines, breaking news, trending rankings, article search,
  reading specific articles, browsing columns / series / community topics,
  industry events & conferences, event calendar, platform hot searches and editorial picks.
metadata:
  author: Seven Du
---

This is the core PANews reading skill for users who want to follow cryptocurrency and blockchain news through PANews coverage. Use it for market-moving headlines, project and token updates, rankings, deep dives, topics, columns, series, events, and editorial picks.

It is best suited for structured news discovery and explanation. The skill should help users understand what is happening, why it matters, and where to keep reading, while staying accessible to readers who may not be technical.

## Common User Phrases

- "What are the biggest crypto stories today?"
- "Can you find coverage about Bitcoin, Solana, or this project?"

## Capabilities

| Scenario | Trigger intent | Reference |
|----------|---------------|-----------|
| Today's briefing | What's the big news today? What's happening in crypto? | [workflow-today-briefing](./references/workflow-today-briefing.md) |
| Search | Search for XX / find reports about XX | [workflow-search](./references/workflow-search.md) |
| Deep dive | What's going on with Bitcoin / a project / an event lately? | [workflow-topic-research](./references/workflow-topic-research.md) |
| Read an article | User provides an article URL or ID | [workflow-read-article](./references/workflow-read-article.md) |
| Discover trending | What is everyone talking about right now? | [workflow-trending](./references/workflow-trending.md) |
| Latest news | Breaking news / what just happened | [workflow-latest-news](./references/workflow-latest-news.md) |
| Browse columns | What columns are there / this author's column | [workflow-columns](./references/workflow-columns.md) |
| Browse series | Any series coverage on XX | [workflow-series](./references/workflow-series.md) |
| Browse topics | What do people think about XX / what's the community discussing | [workflow-topics](./references/workflow-topics.md) |
| Events | Any recent summits / hackathons / activities | [workflow-events](./references/workflow-events.md) |
| Event calendar | Important events this month / project schedule | [workflow-calendar](./references/workflow-calendar.md) |
| Platform picks | What is the editor recommending / what are the hot searches | [workflow-hooks](./references/workflow-hooks.md) |

## General principles

- Do not predict price movements or give investment advice
- Content strictly from PANews — do not add information PANews has not reported
- For publishing content, use the panews-creator skill

## Execution guidance

- Use judgment for open-ended discovery tasks such as briefings, topic research, and trend summaries. Multiple valid paths are acceptable if the result stays grounded in PANews coverage.
- Be more specific for fragile tasks:
  - If the user provides an article URL or ID, resolve the article directly instead of broadening into generic search.
  - If the task is rankings, events, calendar items, or platform picks, use the most direct matching workflow instead of combining unrelated workflows first.
  - If PANews coverage is weak or missing, say so directly rather than filling gaps with outside knowledge.

## Language

All CLI commands support `--lang`, accepting standard locale strings (e.g. `zh`, `en`, `zh-TW`, `en-US`, `ja-JP`), automatically mapped to the nearest supported language. If omitted, the system locale is auto-detected. Match `--lang` to the user's question language.

## CLI

```bash
node {Skills Directory}/panews/scripts/cli.mjs <command> [options]
```

When unsure about parameters, check with `--help` first:

```bash
node {Skills Directory}/panews/scripts/cli.mjs --help
node {Skills Directory}/panews/scripts/cli.mjs <command> --help
```

Available commands:

```
         list-articles    List latest articles by type
  get-daily-must-reads    Get daily must-read articles
          get-rankings    Get article hot rankings (daily: 24h hot | weekly: 7-day search trending)
       search-articles    Search articles by keyword
           get-article    Get full article content by ID
          list-columns    List or search PANews columns
            get-column    Get column details and recent articles
           list-series    List or search PANews series
            get-series    Get series details and articles
           list-topics    List or search PANews topics
             get-topic    Get topic details and latest comments
           list-events    List PANews events / activities
  list-calendar-events    List PANews calendar events
             get-hooks    Fetch PANews hooks / injection-point data by category
```
