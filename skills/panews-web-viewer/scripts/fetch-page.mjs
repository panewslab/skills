#!/usr/bin/env node
/**
 * Fetch a PANews website page as Markdown.
 *
 * Usage:
 *   node fetch-page.mjs <path-or-url> [--lang zh]
 *
 * Examples:
 *   node fetch-page.mjs /articles/ARTICLE_ID --lang en
 *   node fetch-page.mjs https://www.panewslab.com/zh
 */

const BASE_URL = 'https://www.panewslab.com'
const LOCALE_PREFIXES = new Set(['/zh', '/zh-hant', '/en', '/ja', '/ko'])
const LANGUAGE_PREFIX = {
  zh: '/zh',
  'zh-hant': '/zh-hant',
  en: '/en',
  ja: '/ja',
  ko: '/ko',
}

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

const target = positional[0]
if (!target) {
  console.error('Usage: node fetch-page.mjs <path-or-url> [--lang zh]')
  process.exit(1)
}

const lang = flags.lang ?? 'zh'
const localePrefix = LANGUAGE_PREFIX[lang]
if (!localePrefix) {
  console.error(`Unsupported language: ${lang}`)
  process.exit(1)
}

const toUrl = (value) => {
  if (/^https?:\/\//.test(value)) return value

  const normalized = value.startsWith('/') ? value : `/${value}`
  const hasLocalePrefix = [...LOCALE_PREFIXES].some(prefix => normalized === prefix || normalized.startsWith(`${prefix}/`))
  const path = hasLocalePrefix ? normalized : `${localePrefix}${normalized}`
  return `${BASE_URL}${path}`
}

const url = toUrl(target)
const res = await fetch(url, {
  headers: { Accept: 'text/markdown' },
})

if (!res.ok) {
  console.error(`Error ${res.status}: ${await res.text()}`)
  process.exit(1)
}

process.stdout.write(await res.text())
