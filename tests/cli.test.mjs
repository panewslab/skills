import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

// Exercise the shipped files outside the repository, without node_modules or assets.
const directory = mkdtempSync(join(tmpdir(), 'panews-cli-test-'))
after(() => rmSync(directory, { recursive: true, force: true }))
for (const skill of ['panews', 'panews-creator']) {
  copyFileSync(new URL(`../skills/${skill}/scripts/cli.mjs`, import.meta.url), join(directory, `${skill}.mjs`))
}
const markdownBody = '# Hello\n\n**world** and [PANews](https://www.panewslab.com)\n\n- 比特币\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\n```html\n<b>literal</b>\n```\n\n<video src="https://cdn.example/video.mp4" controls></video>\n'
writeFileSync(join(directory, 'article.md'), markdownBody)
writeFileSync(join(directory, 'empty.md'), '  \n\t')

function mockFetch(routes) {
  globalThis.fetch = async (url, options = {}) => {
    if (options.headers?.['PA-Content-Format'] !== 'markdown') throw new Error('Missing Markdown content negotiation')
    if (options.headers?.['User-Agent'] !== 'panews-cli/0.3.0') throw new Error('Missing CLI version')
    const { pathname, searchParams } = new URL(url)
    console.error('HTTP ' + JSON.stringify({
      path: pathname, query: Object.fromEntries(searchParams), method: options.method ?? 'GET',
      body: options.body ? JSON.parse(options.body) : undefined,
      lang: options.headers?.['PA-Accept-Language'],
    }))
    const route = routes[pathname]
    if (!route) throw new Error(`Unexpected request: ${pathname}`)
    if (route.networkError) throw new Error('Network unavailable')
    return Response.json(route.body, { status: route.status ?? 200, headers: route.headers })
  }
}

function run(args, routes = {}, skill = 'panews') {
  const preload = `(${mockFetch.toString()})(${JSON.stringify(routes)})`
  const result = spawnSync(process.execPath, [
    '--import', `data:text/javascript;base64,${Buffer.from(preload).toString('base64')}`,
    join(directory, `${skill}.mjs`), ...args,
  ], { cwd: directory, env: { ...process.env, PANEWS_USER_SESSION: '', TZ: 'UTC' }, encoding: 'utf8', timeout: 10000 })
  assert.ifError(result.error)
  return {
    ...result,
    requests: result.stderr.split('\n').filter((line) => line.startsWith('HTTP ')).map((line) => JSON.parse(line.slice(5))),
  }
}

const item = {
  article: {
    id: 'article-id', lang: 'zh', title: '中文标题', desc: '中文摘要', publishedAt: '2026-09-21T08:00:00.000Z',
    translations: [{ id: 'translation-id', lang: 'en', title: 'English title', desc: 'English summary' }],
    content: 'UNUSED_FULL_ARTICLE',
  },
  match: { field: 'content', snippet: { text: 'Body evidence' } },
}
const searchRoutes = {
  '/search/results': { body: { items: [item], nextCursor: 'snapshot-cursor' } },
  '/search/results/cursor': { body: { ok: true } },
}

for (const skill of ['panews', 'panews-creator']) {
  test(`${skill} help runs as a standalone bundle`, () => {
    const result = run(['--help'], {}, skill)
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /COMMANDS/)
  })
}

test('search uses the new contract, localized fields, date offsets, and cursor cleanup', () => {
  const result = run(['search-articles', ' Bitcoin ', '--lang', 'en-US', '--mode', 'time', '--take', '2',
    '--published-from', '2026-09-21T00:00:00+08:00', '--published-to', '2026-09-22T00:00:00+08:00'], searchRoutes)
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(result.requests, [
    { path: '/search/results', query: {}, method: 'POST', lang: 'en', body: {
      query: 'Bitcoin', mode: 'time', type: ['NORMAL', 'NEWS'], take: 2,
      publishedFrom: '2026-09-20T16:00:00.000Z', publishedTo: '2026-09-21T16:00:00.000Z',
    } },
    { path: '/search/results/cursor', query: {}, method: 'DELETE', body: { cursor: 'snapshot-cursor' } },
  ])
  for (const text of ['article-id', 'English title', 'English summary', 'Body evidence']) assert.ok(result.stdout.includes(text))
  assert.doesNotMatch(result.stdout, /中文|translation-id|UNUSED_FULL_ARTICLE|snapshot-cursor/)
})

test('search defaults and original language are preserved without duplicating summaries', () => {
  const result = run(['search-articles', '比特币', '--lang', 'zh'], {
    '/search/results': { body: { items: [{ ...item, match: { field: 'description', snippet: { text: '中文摘要' } } }] } },
  })
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(result.requests[0].body, { query: '比特币', mode: 'hit', type: ['NORMAL', 'NEWS'], take: 5 })
  assert.equal(result.requests.length, 1)
  assert.match(result.stdout, /中文标题/)
  assert.equal(result.stdout.match(/中文摘要/g).length, 1)
  assert.doesNotMatch(result.stdout, /snippet|English/)
})

for (const missing of [['title'], ['desc'], ['title', 'desc']]) {
  test(`partial translations retain original ${missing.join(' and ')}`, () => {
    const translation = { ...item.article.translations[0] }
    for (const field of missing) translation[field] = null
    const result = run(['search-articles', 'Bitcoin', '--lang', 'en'], {
      '/search/results': { body: { items: [{ ...item, article: { ...item.article, translations: [translation] } }] } },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.ok(result.stdout.includes(missing.includes('title') ? '中文标题' : 'English title'))
    assert.ok(result.stdout.includes(missing.includes('desc') ? '中文摘要' : 'English summary'))
  })
}

for (const nextCursor of [undefined, 'snapshot-cursor']) {
  test(`empty search ${nextCursor ? 'page releases its snapshot' : 'needs no cleanup'}`, () => {
    const result = run(['search-articles', 'nothing'], {
      ...searchRoutes, '/search/results': { body: { items: [], nextCursor } },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, nextCursor ? /No visible results on this page/ : /No results/)
    assert.equal(result.requests.length, nextCursor ? 2 : 1)
  })
}

for (const cleanup of [{ status: 401, body: {} }, { status: 503, body: {} }, { networkError: true }]) {
  test(`cleanup ${cleanup.networkError ? 'network' : `HTTP ${cleanup.status}`} failure preserves results`, () => {
    const result = run(['search-articles', 'Bitcoin', '--lang', 'en'], {
      ...searchRoutes, '/search/results/cursor': cleanup,
    })
    assert.equal(result.status, 0, result.stderr)
    assert.match(result.stdout, /English title/)
    assert.match(result.stderr, /Warning: Could not release/)
  })
}

for (const status of [401, 503]) {
  test(`search HTTP ${status} stops without falling back to the old API`, () => {
    const result = run(['search-articles', 'Bitcoin'], { '/search/results': { status, body: {} } })
    assert.equal(result.status, 1)
    assert.equal(result.stdout, '')
    assert.equal(result.requests.length, 1)
  })
}

for (const args of [
  ['search-articles', '   '], ['search-articles', 'BTC', '--mode', 'SMART'],
  ['search-articles', 'BTC', '--take', '0'], ['search-articles', 'BTC', '--take', '51'],
  ['search-articles', 'BTC', '--published-from', '2026-09-21T00:00:00'],
  ['search-articles', 'BTC', '--published-from', '2026-02-30T00:00:00Z'],
  ['search-articles', 'BTC', '--published-from', '2026-09-21T08:00:00+08:00', '--published-to', '2026-09-21T00:00:00Z'],
  ['list-calendar-events', '--start-from', '2026-02-29'],
  ['list-calendar-events', '--start-from', '2026-02-30'],
  ['list-calendar-events', '--start-from', '2026-09-22', '--end-to', '2026-09-21'],
  ['list-calendar-events', '--period', 'this-month', '--start-from', '2026-09-21'],
]) {
  test(`invalid input stops before HTTP: ${args.join(' ')}`, () => {
    const result = run(args)
    assert.equal(result.status, 1)
    assert.equal(result.requests.length, 0)
  })
}

for (const order of [[], ['--order', 'asc'], ['--order=asc']]) {
  test(`calendar accepts leap day and respects order ${order.join(' ') || 'default'}`, () => {
    const result = run(['list-calendar-events', '--end-to', '2024-02-29', ...order], {
      '/calendar/events': { body: [] }, '/calendar/categories': { body: [] },
    })
    assert.equal(result.status, 0, result.stderr)
    const request = result.requests.find((request) => request.path === '/calendar/events')
    assert.equal(request.query.startAt, 'lte,2024-02-29')
    assert.equal(request.query.sortOrder, order.length ? 'asc' : 'desc')
  })
}

const activity = {
  id: 'event-id', title: 'Event title', category: 'SUMMIT', country: 'US', address: 'Event address',
  startAt: '2026-10-10T00:00:00.000Z', endedAt: '2026-10-12T00:00:00.000Z',
  isOnline: false, isPaid: true, price: '10 USD', url: 'https://example.com/event',
  topics: [
    { eventId: 'event-id', topicId: 'translated', topic: { id: 'translated', label: 'Original topic', translations: [
      { lang: 'ja', label: '日本語トピック' }, { lang: 'en', label: 'English topic' },
    ] } },
    { eventId: 'event-id', topicId: 'fallback', topic: { id: 'fallback', label: 'Fallback topic', translations: [
      { lang: 'zh', label: '中文话题' },
    ] } },
  ],
  internal: 'UNUSED_EVENT_DATA',
}
const eventAsOf = '2026-10-11T00:00:00.000Z'

function eventPagination(result) {
  const blocks = [...result.stdout.matchAll(/```json\s*\n([\s\S]*?)\n```/g)]
  assert.equal(blocks.length, 1, result.stdout)
  return JSON.parse(blocks[0][1])
}

test('events default to one cursor-ready request without changing the default sort', () => {
  const result = run(['list-events'], { '/events': { body: [] } })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.requests.length, 1)
  assert.deepEqual(result.requests[0].query, { limit: '15' })
  assert.equal(result.requests[0].path, '/events')
  assert.equal(result.requests[0].method, 'GET')
  assert.deepEqual(eventPagination(result), {
    nextCursor: null, asOf: null, query: { limit: 15, lang: result.requests[0].lang },
  })
})

test('events preserve Markdown fields and use matching topic labels with original-label fallback', () => {
  const result = run(['list-events', '--lang', 'en-US'], {
    '/events': { body: [activity], headers: { 'PA-Events-As-Of': eventAsOf } },
  })
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.requests.length, 1)
  for (const text of ['event-id', 'Event title', 'SUMMIT', 'US', 'Event address', activity.startAt,
    activity.endedAt, '10 USD', activity.url, 'English topic', 'Fallback topic']) assert.ok(result.stdout.includes(text), text)
  assert.match(result.stdout, /\*\*isOnline\*\*: false/)
  assert.match(result.stdout, /\*\*isPaid\*\*: true/)
  assert.doesNotMatch(result.stdout, /UNUSED_EVENT_DATA|日本語トピック|中文话题|Original topic/)
  assert.deepEqual(eventPagination(result), { nextCursor: null, asOf: eventAsOf, query: { limit: 15, lang: 'en' } })
})

test('events resume an opaque cursor with the same filters and language, without inventing asOf', () => {
  const cursor = 'opaque-v1.A+/=%?&unchanged'
  const options = ['--limit', '2', '--sort', 'status', '--search', 'side event & meetup', '--category', 'SUMMIT',
    '--country', 'US', '--online', 'false', '--paid', 'true', '--lang', 'en-US']
  const first = run(['list-events', ...options, '--as-of', '2026-10-11T08:00:00+08:00'], {
    '/events': { body: [activity], headers: { 'PA-Next-Cursor': cursor, 'PA-Events-As-Of': eventAsOf } },
  })
  assert.equal(first.status, 0, first.stderr)
  assert.equal(first.requests.length, 1)
  const expectedQuery = {
    limit: '2', sort: 'status', search: 'side event & meetup', category: 'SUMMIT', country: 'US', isOnline: 'false', isPaid: 'true',
  }
  assert.deepEqual(first.requests[0], { path: '/events', method: 'GET', lang: 'en', query: { ...expectedQuery, asOf: eventAsOf } })
  const metadata = { limit: 2, sort: 'status', search: 'side event & meetup', category: 'SUMMIT', country: 'US', online: false, paid: true, lang: 'en' }
  assert.deepEqual(eventPagination(first), { nextCursor: cursor, asOf: eventAsOf, query: metadata })

  const next = run(['list-events', ...options, '--cursor', eventPagination(first).nextCursor], {
    '/events': { body: [], headers: { 'pa-events-as-of': eventAsOf } },
  })
  assert.equal(next.status, 0, next.stderr)
  assert.equal(next.requests.length, 1)
  assert.deepEqual(next.requests[0], { path: '/events', method: 'GET', lang: 'en', query: { ...expectedQuery, cursor } })
  assert.deepEqual(eventPagination(next), { nextCursor: null, asOf: eventAsOf, query: metadata })
})

for (const body of [[], [activity]]) {
  test(`events retain pagination headers on ${body.length ? 'nonempty' : 'empty'} pages`, () => {
    const result = run(['list-events', '--limit', '100', '--lang', 'zh'], {
      '/events': { body, headers: { 'pa-next-cursor': 'opaque-next-page', 'pa-events-as-of': eventAsOf } },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.requests.length, 1)
    assert.deepEqual(result.requests[0].query, { limit: '100' })
    assert.deepEqual(eventPagination(result), {
      nextCursor: 'opaque-next-page', asOf: eventAsOf, query: { limit: 100, lang: 'zh' },
    })
  })
}

for (const asOf of [null, '2026-10-11T08:00:00+08:00']) {
  test(`event metadata uses ${asOf ? 'the server header unchanged' : 'null when the server omits asOf'}`, () => {
    const result = run(['list-events', '--lang', 'en', '--as-of', eventAsOf], {
      '/events': { body: [], headers: asOf ? { 'PA-Events-As-Of': asOf } : {} },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.requests.length, 1)
    assert.deepEqual(result.requests[0].query, { limit: '15', asOf: eventAsOf })
    assert.deepEqual(eventPagination(result), { nextCursor: null, asOf, query: { limit: 15, lang: 'en' } })
  })
}

for (const args of [['--take', '7'], ['--take=7'], ['--skip', '0'], ['--skip=15'], ['--limit', '15', '--take', '7']]) {
  test(`removed event pagination options fail before HTTP: ${args.join(' ')}`, () => {
    const result = run(['list-events', ...args])
    assert.equal(result.status, 1)
    assert.equal(result.requests.length, 0)
    assert.match(result.stderr, /take|skip/)
  })
}

for (const failure of [{ status: 400, body: { error: 'Invalid cursor' } }, { status: 503, body: {} }, { networkError: true }]) {
  test(`event ${failure.networkError ? 'network' : `HTTP ${failure.status}`} errors do not retry or fall back to offset`, () => {
    const result = run(['list-events', '--cursor', 'opaque-cursor', '--sort', 'status', '--lang', 'en'], { '/events': failure })
    assert.equal(result.status, 1)
    assert.equal(result.stdout, '')
    assert.equal(result.requests.length, 1)
    assert.deepEqual(result.requests[0].query, { limit: '15', cursor: 'opaque-cursor', sort: 'status' })
  })
}

for (const args of [
  ['--limit', '0'], ['--limit', '101'], ['--limit', '1.5'], ['--limit', 'bad'],
  ['--take', '0'], ['--take', '101'], ['--limit', '15', '--take', '15'],
  ['--sort', 'start'], ['--sort', 'STATUS'], ['--cursor', ''],
  ['--as-of', 'not-a-date'], ['--as-of', '2026-10-11T00:00:00'], ['--as-of', '2026-02-30T00:00:00Z'],
  ['--online', 'maybe'], ['--paid', '1'],
]) {
  test(`invalid event input stops before HTTP: ${args.join(' ')}`, () => {
    const result = run(['list-events', ...args])
    assert.equal(result.status, 1)
    assert.equal(result.requests.length, 0)
  })
}

test('event help exposes only cursor paging, without removed offset options', () => {
  const result = run(['list-events', '--help'])
  assert.equal(result.status, 0, result.stderr)
  assert.equal(result.requests.length, 0)
  for (const option of ['--limit', '--cursor', '--sort', '--as-of']) assert.ok(result.stdout.includes(option), option)
  assert.doesNotMatch(result.stdout, /--(?:take|skip)\b/)
})

test('creator validates a session and selects only public column fields', () => {
  const result = run(['validate-session', '--session', 'test-session'], {
    '/user': { body: { id: 'user-id', profile: { name: 'Test author' } } },
    '/columns': { body: [{ id: 'column-id', name: 'Test column', status: 'APPROVED', internal: 'NOT_FOR_OUTPUT' }] },
  }, 'panews-creator')
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /Test author/)
  assert.match(result.stdout, /Test column/)
  assert.doesNotMatch(result.stdout, /NOT_FOR_OUTPUT/)
})

test('creator stops on 401 before requesting columns', () => {
  const result = run(['validate-session', '--session', 'test-session'], {
    '/user': { status: 401, body: {} },
  }, 'panews-creator')
  assert.equal(result.status, 1)
  assert.match(result.stderr, /Session is expired or invalid/)
  assert.equal(result.requests.length, 1)
})

for (const command of ['create-article', 'update-article']) {
  test(`${command} sends Markdown unchanged from the standalone bundle`, () => {
    const creating = command === 'create-article'
    const path = `/columns/column-id/articles${creating ? '' : '/article-id'}`
    const result = run([command, '--column-id', 'column-id', '--content-file', 'article.md', '--session', 'test-session',
      ...(creating ? ['--title', 'Test', '--desc', 'Summary', '--lang', 'en'] : ['--article-id', 'article-id'])], {
      [path]: { body: { id: 'article-id', status: 'DRAFT' } },
    }, 'panews-creator')
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.requests[0].method, creating ? 'POST' : 'PATCH')
    const { content } = result.requests[0].body
    assert.equal(content, markdownBody)
    assert.equal(result.requests[0].body.status, 'DRAFT')
  })
}

for (const command of ['create-article', 'update-article']) {
  test(`${command} rejects empty Markdown before making requests`, () => {
    const result = run([command, '--column-id', 'column-id', '--content-file', 'empty.md', '--session', 'test-session',
      ...(command === 'create-article' ? ['--title', 'Test', '--desc', 'Summary', '--lang', 'en'] : ['--article-id', 'article-id'])], {}, 'panews-creator')
    assert.equal(result.status, 1)
    assert.equal(result.requests.length, 0)
    assert.match(result.stderr, /Content file must not be empty/)
  })
}

test('metadata-only updates omit the body', () => {
  const result = run(['update-article', '--column-id', 'column-id', '--article-id', 'article-id', '--title', 'New title', '--session', 'test-session'], {
    '/columns/column-id/articles/article-id': { body: { id: 'article-id', status: 'DRAFT' } },
  }, 'panews-creator')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(result.requests[0].body, { title: 'New title', status: 'DRAFT' })
})

test('an update without changes stops before HTTP', () => {
  const result = run(['update-article', '--column-id', 'column-id', '--article-id', 'article-id', '--session', 'test-session'], {}, 'panews-creator')
  assert.equal(result.status, 1)
  assert.equal(result.requests.length, 0)
  assert.match(result.stderr, /No fields were provided/)
})

test('explicit review submission preserves PENDING', () => {
  const result = run(['update-article', '--column-id', 'column-id', '--article-id', 'article-id', '--status', 'PENDING', '--session', 'test-session'], {
    '/columns/column-id/articles/article-id': { body: { id: 'article-id', status: 'PENDING' } },
  }, 'panews-creator')
  assert.equal(result.status, 0, result.stderr)
  assert.deepEqual(result.requests[0].body, { status: 'PENDING' })
})

for (const lang of ['en', 'zh']) {
  test(`article preserves Markdown and selects ${lang} content`, () => {
    const original = '# Original\n\n' + markdownBody
    const translated = '# Translation\n\n' + markdownBody
    const result = run(['get-article', 'article-id', '--lang', lang], {
      '/articles/article-id': { body: { title: 'Original title', desc: 'Original summary', content: original,
        translations: [{ lang: 'en', title: 'English title', content: translated }] } },
    })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.requests[0].lang, lang)
    assert.ok(result.stdout.endsWith((lang === 'en' ? translated : original) + '\n'))
    assert.ok(result.stdout.includes(lang === 'en' ? 'English title' : 'Original title'))
    assert.match(result.stdout, /Original summary/)
  })
}
