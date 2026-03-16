#!/usr/bin/env node
/**
 * Upload an image to PANews CDN.
 *
 * Usage:
 *   node upload-image.mjs <file-path> [--watermark] [--session <value>]
 *
 * Output:
 *   { "url": "https://cdn.panewslab.com/..." }
 */

import { createReadStream, statSync } from 'node:fs'
import { basename } from 'node:path'

const BASE_URL = 'https://universal-api.panewslab.com'

const args = process.argv.slice(2)
const flags = {}
const positional = []

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--watermark') {
    flags.watermark = true
  }
  else if (args[i].startsWith('--')) {
    flags[args[i].slice(2)] = args[i + 1]
    i++
  }
  else {
    positional.push(args[i])
  }
}

const filePath = positional[0]
if (!filePath) {
  console.error('Usage: node upload-image.mjs <file-path> [--watermark] [--session <value>]')
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

statSync(filePath) // throws if file doesn't exist

const formData = new FormData()
const fileStream = createReadStream(filePath)
const chunks = []
for await (const chunk of fileStream) chunks.push(chunk)
const blob = new Blob([Buffer.concat(chunks)])
formData.append('file', blob, basename(filePath))
if (flags.watermark) formData.append('watermark', 'true')

const res = await fetch(`${BASE_URL}/upload`, {
  method: 'PUT',
  headers: { 'PA-User-Session': session },
  body: formData,
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
