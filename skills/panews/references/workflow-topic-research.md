# Deep Topic Research

**Trigger**: The user mentions a specific topic, project name, token, or event.
Common prompts include "What's new with Bitcoin?", "What progress has Ethereum made lately?", or "Help me understand project XX."

## Steps

### 1. Search for related articles first by relevance

```bash
node cli.mjs search-articles "<user keyword>" --mode hit --take 5 --lang <lang>
```

### 2. Evaluate relevance

Review the returned titles and summaries:
- Highly relevant (the title or summary is directly about the topic) -> continue
- Empty or weakly relevant results -> tell the user directly and stop

### 3. Fetch the full text of the 2 to 3 most relevant articles

```bash
node cli.mjs get-article <id> --lang <lang>
```

### 4. Synthesize the output

- **Background**: what this topic is, in one short paragraph
- **Latest developments**: what has happened recently
- **Different viewpoints**: list disagreements or multiple perspectives when relevant
- **Further reading**: article titles plus links, up to 3 items

Link format: `https://www.panewslab.com/<lang>/<id>`

## Notes

- Do not invent information that PANews has not reported.
- If the user asks for price predictions, say that you do not make those judgments, but you can provide relevant news background.
