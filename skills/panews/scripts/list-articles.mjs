#!/usr/bin/env node
/**
 * List PANews articles with optional filters.
 *
 * Usage:
 *   node list-articles.mjs [options]
 *
 * Options:
 *   --type <type>         NORMAL | NEWS | VIDEO
 *   --column-id <id>      Filter by column
 *   --tag-id <id>         Filter by tag
 *   --author-id <id>      Filter by author
 *   --series-id <id>      Filter by series
 *   --is-in-depth         In-depth articles only
 *   --is-featured         Featured articles only
 *   --is-important        Important articles only
 *   --is-first            First-publish articles only
 *   --is-market-trend     Market trend articles only
 *   --take <n>            Page size (default: 10)
 *   --skip <n>            Page offset (default: 0)
 *   --lang <lang>         zh | zh-hant | en | ja | ko (default: zh)
 */

const BASE_URL = 'https://universal-api.panewslab.com'

const args = process.argv.slice(2)
const flags = {}
const boolFlags = new Set(['is-in-depth', 'is-featured', 'is-important', 'is-first', 'is-market-trend'])

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    const key = args[i].slice(2)
    if (boolFlags.has(key)) {
      flags[key] = true
    }
    else {
      flags[key] = args[i + 1]
      i++
    }
  }
}

const lang = flags.lang ?? 'zh'

const params = new URLSearchParams()
if (flags.type) params.set('type', flags.type)
if (flags['column-id']) params.set('columnId', flags['column-id'])
if (flags['tag-id']) params.set('tagId', flags['tag-id'])
if (flags['author-id']) params.set('authorId', flags['author-id'])
if (flags['series-id']) params.set('seriesId', flags['series-id'])
if (flags['is-in-depth']) params.set('isInDepth', 'true')
if (flags['is-featured']) params.set('isFeatured', 'true')
if (flags['is-important']) params.set('isImportant', 'true')
if (flags['is-first']) params.set('isFirst', 'true')
if (flags['is-market-trend']) params.set('isMarketTrend', 'true')
params.set('take', flags.take ?? '10')
params.set('skip', flags.skip ?? '0')

const res = await fetch(`${BASE_URL}/articles?${params}`, {
  headers: { 'PA-Accept-Language': lang },
})

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
