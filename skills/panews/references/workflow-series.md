# Browse Series

**Trigger**: User wants to explore a long-running topic or a series of reports.
Common phrases: "Does PANews have a series on Layer2", "What series are there", "What is this series about".

## Steps

### 1. Search or list series

```bash
node cli.mjs list-series --search "<keyword>" --take 10 --lang <lang>
```

Omitting `--search` lists all series ordered by latest post time.

### 2. Get a series' articles

```bash
node cli.mjs get-series <seriesId> --take 10 --lang <lang>
```

Returns the series intro and article list (newest first).

### 3. Deep dive into an article

Get the article ID from the previous step and go to [workflow-read-article](./workflow-read-article.md).

## Notes

- A series is an editor-curated set of reports with a clear thematic thread
- Difference from "deep dive": deep dive is keyword search; a series is pre-organized editorial content
