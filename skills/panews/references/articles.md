---
name: articles
description: PANews article endpoints — search, list, detail, related, and rankings. Use when querying or browsing PANews articles via the unified API.
---

# Articles

Base URL: `https://universal-api.panewslab.com`

## Search

`POST /search/articles`

```json
{
  "query": "Bitcoin",
  "mode": "hit",
  "type": ["NORMAL", "NEWS"],
  "take": 10,
  "skip": 0
}
```

| Field | Default | Notes |
| ----- | ------- | ----- |
| `mode` | `hit` | `hit` = relevance + time decay; `time` = newest first |
| `type` | `["NORMAL","NEWS"]` | Add `"VIDEO"` only when user explicitly asks |

## List

`GET /articles`

| Param | Type | Notes |
| ----- | ---- | ----- |
| `type` | `NORMAL` \| `NEWS` \| `VIDEO` | Filter by content type |
| `columnId` | string | Filter by column |
| `tagId` | string | Filter by tag |
| `authorId` | string | Filter by author |
| `seriesId` | string | Filter by series |
| `isInDepth` | boolean | In-depth articles |
| `isFeatured` | boolean | Featured articles |
| `isImportant` | boolean | Important articles |
| `isFirst` | boolean | First-publish articles |
| `isMarketTrend` | boolean | Market trend articles |
| `take` | number | Page size |
| `skip` | number | Page offset |

## Detail & Related

- `GET /articles/{articleId}` — full article content and metadata
- `GET /articles/{articleId}/related-articles` — recommended articles by topic
- `GET /articles/{articleId}/related-series` — related series

## Rankings

- `GET /articles/rank` — top articles by engagement in the past 24 hours
- `GET /articles/rank/weekly/search` — weekly search rankings by click data
