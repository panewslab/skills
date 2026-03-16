#!/usr/bin/env node
/**
 * Get PANews article rankings.
 *
 * Usage:
 *   node get-rankings.mjs [options]
 *
 * Options:
 *   --weekly     Fetch weekly search rankings (default: 24-hour hot rank)
 *   --lang       zh | zh-hant | en | ja | ko (default: zh)
 */

const BASE_URL = 'https://universal-api.panewslab.com'

const args = process.argv.slice(2)
const flags = {}

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--weekly') {
    flags.weekly = true
  }
  else if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1]
    i++
  }
}

const lang = flags.lang ?? 'zh'
const headers = { 'PA-Accept-Language': lang }

const path = flags.weekly ? '/articles/rank/weekly/search' : '/articles/rank'
const res = await fetch(`${BASE_URL}${path}`, { headers })

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
