---
name: articles
description: Column-owner article CRUD — list, create, update, and delete articles within an approved column.
---

# Creator Articles

All routes are scoped to a column: `/columns/{columnId}/articles`.
These are **column-owner** routes, not admin routes.

## List Articles

`GET /columns/{columnId}/articles`

| Param | Notes |
| ----- | ----- |
| `status` | `DRAFT` \| `PENDING` \| `PUBLISHED` \| `REJECTED` |
| `take` | Page size (default 20, max 100) |
| `skip` | Page offset (default 0) |

## Create Article

`POST /columns/{columnId}/articles`

```json
{
  "lang": "zh",
  "title": "Article title",
  "desc": "Short description",
  "content": "<p>HTML content</p>",
  "cover": "https://...",
  "originalLink": "https://...",
  "tags": ["tagId1", "tagId2"],
  "status": "DRAFT"
}
```

| Field | Required | Notes |
| ----- | -------- | ----- |
| `lang` | yes | `zh` / `zh-hant` / `en` / `ja` / `ko` |
| `title` | yes | |
| `desc` | yes | |
| `content` | yes | HTML string — must be passed via `--content-file`, not inline |
| `cover` | no | Image URL |
| `originalLink` | no | Original source URL |
| `tags` | no | Tag ID array, max 5 |
| `status` | yes | `DRAFT` or `PENDING` only |

## Update Article

`PATCH /columns/{columnId}/articles/{articleId}`

Same fields as create, all optional. Only allowed when article status is `DRAFT` or `REJECTED`.

## Delete Article

`DELETE /columns/{columnId}/articles/{articleId}`

Only allowed when article status is `DRAFT` or `REJECTED`.
