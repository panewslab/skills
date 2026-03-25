# Platform Hooks

**Purpose**: Fetch PANews editorial configurations — hot search keywords, recommended columns/series, homepage tabs, carousels, quick menus, etc.
These represent the platform's curated picks for the current period, reflecting the editorial team's recommended focus areas.

## Available categories

| `category` value | Content |
|-----------------|---------|
| `search-keywords` | Hot search keywords (`payload.hot=true` means trending) |
| `ai-search-issues` | AI-recommended exploration questions |
| `carousel` | Homepage carousel (may include linked article ID) |
| `column-recommend` | Recommended column (payload is columnId) |
| `series-recommend` | Recommended series (payload is seriesId) |
| `website-recommended-topic` | Recommended topic (payload is topicId) |
| `website-series-card` | Series card (payload is seriesId) |
| `homepage-tab` | Homepage tab navigation |
| `website-quick-menu` | Website quick menu |
| `app-quick-menu` | App quick menu |
| `columns-group-recommend` | Column group recommendation |

## Fetching hooks

```bash
node cli.mjs get-hooks --category <category> [--take 20] [--lang <lang>]
```

Multiple categories can be comma-separated:

```bash
node cli.mjs get-hooks --category "search-keywords,ai-search-issues" --lang <lang>
```

## Typical usage

### Get hot search keywords

```bash
node cli.mjs get-hooks --category search-keywords --lang <lang>
```

Returns `text` (keyword) and `payload.hot` (whether it's trending).
Use as search suggestions or to guide users toward popular topics.

### Get recommended columns

```bash
node cli.mjs get-hooks --category column-recommend --lang <lang>
```

Payload is a `columnId` — call `get-column <columnId>` to fetch column details.

### Get AI-recommended questions

```bash
node cli.mjs get-hooks --category ai-search-issues --lang <lang>
```

Returns editorially preset exploratory questions to guide users into deeper topics.

## Notes

- All hooks are time-bounded editorial configs; `onlyValid=true` already filters out expired entries
- When payload contains an ID (columnId, seriesId, topicId), call the corresponding command to get details
