---
name: tags
description: Search PANews tags by keyword to discover tag IDs for use when creating or updating articles. No session required.
---

# Tags

Tags are used when creating or updating articles (`tags` field accepts an array of tag IDs, max 5).

## Search Tags

`GET /tags?search=<keyword>`

No authentication required.

| Param | Default | Notes |
| ----- | ------- | ----- |
| `search` | — | Keyword to filter tags |
| `take` | 20 | Max results (up to 100) |
| `skip` | 0 | Offset for pagination |

Set `PA-Accept-Language` header to get tag names in the target language.

## Workflow

1. Search for relevant tags before creating an article
2. Pick up to 5 tag IDs from the results
3. Pass them as the `tags` array in `create-article` or `update-article`
