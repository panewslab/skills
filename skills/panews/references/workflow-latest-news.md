# Latest News

**Trigger**: User wants to quickly scan the latest updates, for example:
- "Latest news", "What's in the news recently", "What just happened"
- "Show me today's news" (no specific topic)

Difference from "Today's briefing":
- Today's briefing → synthesized analysis with narrative, helps user understand context
- Latest news → direct list, quick scan, user decides what they're interested in

## Steps

Pick type based on user intent:
- "news" / "today's news" / unspecified → `node cli.mjs list-articles --type NEWS`
- "in-depth" / "analysis" → `node cli.mjs list-articles --type NORMAL`

```bash
node cli.mjs list-articles --type NEWS --take 10 --lang <lang>
```

## Output

Present as a concise list, one item per line:

```
• [time] Title
• [time] Title
...
```

No summaries, no analysis. If the user is interested in an item they will follow up naturally —
use [workflow-read-article](./workflow-read-article.md) or [workflow-topic-research](./workflow-topic-research.md) to go deeper.
