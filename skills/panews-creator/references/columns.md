---
name: columns
description: Column application workflow — submit a new application or resubmit a rejected one. Required before writing articles.
---

# Column Applications

A creator must have an approved column before publishing articles.

## Submit New Application

`POST /columns/application-froms`

```json
{
  "name": "Column name",
  "desc": "Column description",
  "picture": "https://...",
  "links": ["https://twitter.com/...", "https://..."]
}
```

| Field | Required | Notes |
| ----- | -------- | ----- |
| `name` | yes | Column display name |
| `desc` | yes | Column description |
| `picture` | yes | Cover image URL (upload first via `/upload`) |
| `links` | yes | Comma-separated URLs; at least one |

## Resubmit Rejected Application

`PATCH /columns/{columnId}/application-from`

All fields are optional — only include what changed:

```json
{
  "name": "Updated name",
  "desc": "Updated description",
  "picture": "https://...",
  "links": ["https://..."]
}
```

## Get Application Status

`GET /columns/{columnId}/application-from`

Returns the current column or application form object for the given column.
