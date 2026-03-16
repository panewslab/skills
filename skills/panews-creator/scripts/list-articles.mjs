#!/usr/bin/env node
/**
 * List articles in a column (creator view).
 *
 * Usage:
 *   node list-articles.mjs --column-id <id> [--status DRAFT|PENDING|PUBLISHED|REJECTED] [--take 20] [--skip 0] [--session <value>]
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
if (!columnId) {
  console.error('Usage: node list-articles.mjs --column-id <id> [--status DRAFT|PENDING|PUBLISHED|REJECTED] [--take 20] [--skip 0]')
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

const params = new URLSearchParams()
if (flags.status) params.set('status', flags.status)
params.set('take', flags.take ?? '20')
params.set('skip', flags.skip ?? '0')

const res = await fetch(`${BASE_URL}/columns/${columnId}/articles?${params}`, {
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

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
