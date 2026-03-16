#!/usr/bin/env node
/**
 * Get full creator context: current user + approved columns + column application status.
 * Use this at the start of any creator workflow to determine next steps.
 *
 * Usage:
 *   node get-creator-context.mjs [--session <value>]
 *
 * Session resolution order (if --session not provided):
 *   PANEWS_USER_SESSION → PA_USER_SESSION → PA_USER_SESSION_ID
 *
 * Output:
 *   { user, columns: [...], applicationStatus }
 *   - columns: approved columns owned by the user
 *   - applicationStatus: pending | approved | rejected | none
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

const headers = { 'PA-User-Session': session }

// 1. Get current user
const userRes = await fetch(`${BASE_URL}/user`, { headers })
if (userRes.status === 401) {
  console.error('Session is invalid or expired (401). Please provide a fresh session.')
  process.exit(1)
}
if (!userRes.ok) {
  console.error(`Error ${userRes.status}: ${await userRes.text()}`)
  process.exit(1)
}
const user = await userRes.json()

// 2. Get columns owned by this user
const columnsRes = await fetch(`${BASE_URL}/columns?authorId=${user.id}&take=100`, { headers })
const columnsData = columnsRes.ok ? await columnsRes.json() : { items: [] }
const columns = columnsData.items ?? columnsData ?? []

// 3. Get latest column application status (from the first column if any)
let applicationStatus = 'none'
if (columns.length > 0) {
  const appRes = await fetch(`${BASE_URL}/columns/${columns[0].id}/application-from`, { headers })
  if (appRes.ok) {
    const app = await appRes.json()
    applicationStatus = app.status ?? 'approved'
  }
}

console.log(JSON.stringify({ user, columns, applicationStatus }, null, 2))
