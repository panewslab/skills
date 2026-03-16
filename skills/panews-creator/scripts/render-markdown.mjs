#!/usr/bin/env node
/**
 * Render a Markdown draft to HTML for PANews article submission using md4x.
 *
 * Usage:
 *   node render-markdown.mjs <input.md> [--output <path>]
 *
 * Notes:
 *   - Writes the rendered HTML to <input>.html by default
 *   - Requires npx to be available in the environment
 *   - Uses md4x CLI for CommonMark + GFM-compatible rendering
 */

import { spawnSync } from 'node:child_process'
import { basename, dirname, extname, join, resolve } from 'node:path'

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

const inputPath = positional[0]
if (!inputPath) {
  console.error('Usage: node render-markdown.mjs <input.md> [--output <path>]')
  process.exit(1)
}

const resolvedInput = resolve(inputPath)
const defaultOutput = join(
  dirname(resolvedInput),
  `${basename(resolvedInput, extname(resolvedInput))}.html`,
)
const outputPath = resolve(flags.output ?? defaultOutput)

const result = spawnSync('npx', ['--yes', 'md4x', resolvedInput, '-t', 'html', '-o', outputPath], {
  encoding: 'utf8',
  stdio: 'pipe',
})

if (result.error) {
  console.error(`Failed to execute npx md4x: ${result.error.message}`)
  process.exit(1)
}

if (result.status !== 0) {
  if (result.stderr) process.stderr.write(result.stderr)
  if (result.stdout) process.stdout.write(result.stdout)
  process.exit(result.status ?? 1)
}

console.log(JSON.stringify({
  input: resolvedInput,
  output: outputPath,
  renderer: 'md4x',
}, null, 2))
