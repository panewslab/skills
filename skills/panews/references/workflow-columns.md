# Browse Columns

**Trigger**: User needs to explore a column or browse articles from a column.
Common phrases: "What columns does PANews have", "Any columns about DeFi", "What has this column written about".

## Steps

### 1. Search or list columns

```bash
node cli.mjs list-columns --search "<keyword>" --take 10 --lang <lang>
```

Omitting `--search` lists all columns ordered by latest post time.

### 2. Get a column's details and articles

```bash
node cli.mjs get-column <columnId> --take 10 --lang <lang>
```

Returns column info (author, post count, follower count) and a list of recent articles.

### 3. Read a specific article

Get the article ID from the previous step, then go to [workflow-read-article](./workflow-read-article.md).

## Output requirements

- Briefly introduce the column's focus and author background
- When listing recent articles, add a short note to help the user decide if they're interested
