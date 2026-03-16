#!/usr/bin/env node
/**
 * Create a new article in a column.
 *
 * Usage:
 *   node create-article.mjs --column-id <id> --lang <lang> --title <title> --desc <desc> --content-file <path> [options]
 *
 * Options:
 *   --status DRAFT|PENDING    (default: DRAFT)
 *   --cover <url>             Cover image URL
 *   --original-link <url>     Original source URL
 *   --tags <id1,id2,...>      Up to 5 tag IDs
 *   --session <value>
 */

import { readFileSync } from 'node:fs'

const BASE_URL = 'https://universal-api.panewslab.com'

const args = process.argv.slice(2)
const flags = {}
for (let i = 0; i < args.length; i++) {
  if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1]
    i++
  }
}

const columnId = flags['column-id']
if (!columnId || !flags.lang || !flags.title || !flags.desc || !flags['content-file']) {
  console.error('Required: --column-id, --lang, --title, --desc, --content-file <path>')
  process.exit(1)
}

const session = flags.session
  ?? process.env.PANEWS_USER_SESSION
  ?? process.env.PA_USER_SESSION
  ?? process.env.PA_USER_SESSION_ID

if (!session) {
  console.error('No session found. Provide --session or set PANEWS_USER_SESSION env var.')
  process.exit(1)
}

const content = readFileSync(flags['content-file'], 'utf8')

const body = {
  lang: flags.lang,
  title: flags.title,
  desc: flags.desc,
  content,
  status: flags.status ?? 'DRAFT',
}
if (flags.cover) body.cover = flags.cover
if (flags['original-link']) body.originalLink = flags['original-link']
if (flags.tags) body.tags = flags.tags.split(',').map(t => t.trim())

const res = await fetch(`${BASE_URL}/columns/${columnId}/articles`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'PA-User-Session': session,
  },
  body: JSON.stringify(body),
})

if (res.status === 401) {
  console.error('Session is invalid or expired (401).')
  process.exit(1)
}
if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
