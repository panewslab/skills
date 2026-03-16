#!/usr/bin/env node
/**
 * Update an existing article (DRAFT or REJECTED status only).
 *
 * Usage:
 *   node update-article.mjs --column-id <id> --article-id <id> [fields...] [--session <value>]
 *
 * Options:
 *   --lang <lang>
 *   --title <title>
 *   --desc <desc>
 *   --content <html>
 *   --content-file <path>
 *   --status DRAFT|PENDING
 *   --cover <url>
 *   --original-link <url>
 *   --tags <id1,id2,...>
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
const articleId = flags['article-id']
if (!columnId || !articleId) {
  console.error('Required: --column-id, --article-id')
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

const body = {}
if (flags.lang) body.lang = flags.lang
if (flags.title) body.title = flags.title
if (flags.desc) body.desc = flags.desc
if (flags['content-file']) body.content = readFileSync(flags['content-file'], 'utf8')
else if (flags.content) body.content = flags.content
if (flags.status) body.status = flags.status
if (flags.cover) body.cover = flags.cover
if (flags['original-link']) body.originalLink = flags['original-link']
if (flags.tags) body.tags = flags.tags.split(',').map(t => t.trim())

if (Object.keys(body).length === 0) {
  console.error('No fields to update. Provide at least one field.')
  process.exit(1)
}

const res = await fetch(`${BASE_URL}/columns/${columnId}/articles/${articleId}`, {
  method: 'PATCH',
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

const text = await res.text()
const data = text ? JSON.parse(text) : { ok: true }
console.log(JSON.stringify(data, null, 2))
