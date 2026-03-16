#!/usr/bin/env node
/**
 * Search PANews tags by keyword. No session required.
 * Use this to find tag IDs before creating or updating articles.
 *
 * Usage:
 *   node search-tags.mjs <keyword> [--take 20] [--skip 0] [--lang zh]
 */

const BASE_URL = 'https://universal-api.panewslab.com'

const args = process.argv.slice(2)
const flags = {}
const positional = []

for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1]
    i++
  }
  else {
    positional.push(args[i])
  }
}

const keyword = positional.join(' ')
if (!keyword) {
  console.error('Usage: node search-tags.mjs <keyword> [--take 20] [--skip 0] [--lang zh]')
  process.exit(1)
}

const params = new URLSearchParams()
params.set('search', keyword)
params.set('take', flags.take ?? '20')
params.set('skip', flags.skip ?? '0')

const lang = flags.lang ?? 'zh'

const res = await fetch(`${BASE_URL}/tags?${params}`, {
  headers: { 'PA-Accept-Language': lang },
})

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
