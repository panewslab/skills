---
name: content
description: PANews non-article content endpoints — daily must-reads, columns, tags, crypto data, events, and calendar. Use when querying any PANews content other than articles.
---

# Other Content

Base URL: `https://universal-api.panewslab.com`

This reference documents adjacent public endpoints that may be useful for direct HTTP calls. The bundled scripts in this skill currently focus on article search, listings, rankings, and daily must-reads.

## Daily Must-Reads

`GET /daily-must-reads?date=YYYY-MM-DD`

Returns the curated daily reading list. Omit `date` to get today's list.

`GET /daily-must-reads/special` — special retrospective reading lists

## Columns

- `GET /columns` — browse published columns; supports search and filtering
- `GET /columns/{columnId}` — column details and associated articles

## Tags

`GET /tags?search=...` — search tags (no auth required)

## Crypto

- `GET /crypto/bitcoin/quote` — current Bitcoin price and 24-hour change
- `GET /crypto/bitcoin/etf/flow-history` — Bitcoin ETF fund flow history
- `GET /crypto/metrics` — aggregate cryptocurrency market indicators
- `GET /crypto/bull-market-peak-indicator` — bull market peak metrics
- `GET /crypto/{chain}/trading-rankings` — chain-specific trading rankings

## Events

- `GET /events` — list events; filter by topic, date range, location
- `GET /events/topics` — event topic categories
- `GET /events/side` — side event listings
- `GET /events/side/{slug}` — individual side event details

## Calendar

- `GET /calendar/events` — query calendar events with filtering
- `GET /calendar/categories` — event calendar categories
- `GET /calendar/{dates}` — download calendar files for specified dates
