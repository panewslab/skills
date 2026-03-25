# Event Calendar

**Trigger**: User wants to check upcoming important events in the crypto space — project milestones, policy dates, macroeconomic schedules, etc.
Common phrases: "Any important events coming up", "What's happening this month", "Any scheduled dates for XX".

Difference between event calendar and events:
- Event calendar → editor-compiled event nodes: project launches, policy milestones, macro data releases, etc.
- Events → industry event registrations: summits, hackathons, roadshows

## Steps

### 1. List calendar events

```bash
node cli.mjs list-calendar-events [--search "<keyword>"] [--start-from <YYYY-MM-DD>] [--order asc|desc] [--take 20] --lang <lang>
```

Default order is ascending by `startAt` (nearest events first), ideal for browsing upcoming items.

For past events, pass `--order desc`.

### 2. Filter a specific date range

```bash
node cli.mjs list-calendar-events --start-from 2025-01-01 --order asc --take 20 --lang <lang>
```

## Output requirements

- Order by date for a clear timeline view
- Include date, title, and category for each event
- If an article or activity is linked, include its title
- Include external links where available
