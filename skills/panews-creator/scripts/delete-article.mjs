#!/usr/bin/env node
/**
 * Delete an article (DRAFT or REJECTED status only).
 *
 * Usage:
 *   node delete-article.mjs --column-id <id> --article-id <id> [--session <value>]
 */

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
  console.error('Usage: node delete-article.mjs --column-id <id> --article-id <id>')
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

const res = await fetch(`${BASE_URL}/columns/${columnId}/articles/${articleId}`, {
  method: 'DELETE',
  headers: { 'PA-User-Session': session },
})

if (res.status === 401) {
  console.error('Session is invalid or expired (401).')
  process.exit(1)
}
if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

console.log(JSON.stringify({ ok: true, articleId }, null, 2))
