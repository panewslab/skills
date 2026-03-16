---
name: content
description: PANews non-article public endpoints. Daily must-reads are part of the bundled workflow; the rest are reference-only HTTP notes unless first-class scripts are added later.
---

# Other Content

Base URL: `https://universal-api.panewslab.com`

This reference documents adjacent public endpoints that may be useful for direct HTTP calls. In the current skill version:

- `daily-must-reads` is part of the bundled workflow
- `columns`, `tags`, `crypto`, `events`, and `calendar` are reference-only notes
- Do not describe the reference-only sections as official bundled capabilities of `panews`

If a repeated task depends on one of these reference-only endpoints, add a script first and then promote it into the main skill description.

## Daily Must-Reads

`GET /daily-must-reads?date=YYYY-MM-DD`

Returns the curated daily reading list. Omit `date` to get today's list.

`GET /daily-must-reads/special` — special retrospective reading lists

## Columns

Reference-only in the current skill version.

- `GET /columns` — browse published columns; supports search and filtering
- `GET /columns/{columnId}` — column details and associated articles

## Tags

Reference-only in the current skill version.

`GET /tags?search=...` — search tags (no auth required)

## Crypto

Reference-only in the current skill version.

- `GET /crypto/bitcoin/quote` — current Bitcoin price and 24-hour change
- `GET /crypto/bitcoin/etf/flow-history` — Bitcoin ETF fund flow history
- `GET /crypto/metrics` — aggregate cryptocurrency market indicators
- `GET /crypto/bull-market-peak-indicator` — bull market peak metrics
- `GET /crypto/{chain}/trading-rankings` — chain-specific trading rankings

## Events

Reference-only in the current skill version.

- `GET /events` — list events; filter by topic, date range, location
- `GET /events/topics` — event topic categories
- `GET /events/side` — side event listings
- `GET /events/side/{slug}` — individual side event details

## Calendar

Reference-only in the current skill version.

- `GET /calendar/events` — query calendar events with filtering
- `GET /calendar/categories` — event calendar categories
- `GET /calendar/{dates}` — download calendar files for specified dates
