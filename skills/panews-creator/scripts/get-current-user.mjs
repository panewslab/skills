#!/usr/bin/env node
/**
 * Validate session and get the current PANews user.
 *
 * Usage:
 *   node get-current-user.mjs [--session <value>]
 *
 * Session resolution order (if --session not provided):
 *   PANEWS_USER_SESSION → PA_USER_SESSION → PA_USER_SESSION_ID
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

const res = await fetch(`${BASE_URL}/user`, {
  headers: { 'PA-User-Session': session },
})

if (res.status === 401) {
  console.error('Session is invalid or expired (401). Please provide a fresh session.')
  process.exit(1)
}

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

const data = await res.json()
console.log(JSON.stringify(data, null, 2))
