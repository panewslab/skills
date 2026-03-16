#!/usr/bin/env node
/**
 * Submit or resubmit a PANews column application.
 *
 * Usage:
 *   # New application
 *   node apply-column.mjs --name <name> --desc <desc> --picture <url> --links <url,url> [--session <value>]
 *
 *   # Resubmit rejected application
 *   node apply-column.mjs --column-id <id> [--name <name>] [--desc <desc>] [--picture <url>] [--links <url,url>] [--session <value>]
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

const session = flags.session
  ?? process.env.PANEWS_USER_SESSION
  ?? process.env.PA_USER_SESSION
  ?? process.env.PA_USER_SESSION_ID

if (!session) {
  console.error('No session found. Provide --session or set PANEWS_USER_SESSION env var.')
  process.exit(1)
}

const columnId = flags['column-id']
const isResubmit = Boolean(columnId)

if (!isResubmit && (!flags.name || !flags.desc || !flags.picture || !flags.links)) {
  console.error('New application requires: --name, --desc, --picture, --links')
  process.exit(1)
}

const body = {}
if (flags.name) body.name = flags.name
if (flags.desc) body.desc = flags.desc
if (flags.picture) body.picture = flags.picture
if (flags.links) body.links = flags.links.split(',').map(l => l.trim())

const url = isResubmit
  ? `${BASE_URL}/columns/${columnId}/application-from`
  : `${BASE_URL}/columns/application-froms`

const res = await fetch(url, {
  method: isResubmit ? 'PATCH' : 'POST',
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
