# Discover Trending

**Trigger**: User wants to know what people are focusing on right now, no specific topic.
Common phrases: "What is everyone talking about", "What has the highest buzz lately".

## Steps

### 1. Get 7-day search trending articles

```bash
node cli.mjs get-rankings --type weekly --take 5 --lang <lang>
```

### 2. Get 24-hour hot rankings

```bash
node cli.mjs get-rankings --type daily --take 5 --lang <lang>
```

### 3. Output

- **Most searched this week**: top 3 articles, title + one sentence on why they're getting attention
- **Most read today**: 3 articles, title + one-sentence summary

To deep dive into a trending topic, use [workflow-topic-research](./workflow-topic-research.md).
