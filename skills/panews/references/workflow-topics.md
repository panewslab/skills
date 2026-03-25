# Browse Topics

**Trigger**: User wants to explore or join a discussion topic, see what people think.
Common phrases: "What topics are being discussed on PANews", "What do people think about the Bitcoin halving".

Difference between topic and series:
- Topic → community discussion, comments, votes, focused on opinion exchange
- Series → editor-curated set of articles, focused on in-depth reporting

## Steps

### 1. Search or list topics

```bash
node cli.mjs list-topics --search "<keyword>" --take 10 --lang <lang>
```

### 2. Get a topic's details and comments

```bash
node cli.mjs get-topic <topicId> --lang <lang>
```

Returns the topic description and the latest 10 community comments.

## Output requirements

- Briefly introduce the topic background
- Summarize the main viewpoints from comments (do not dump all raw text — synthesize)
- If there are clear opposing camps, highlight the core arguments on each side
