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
writeFileSync(join(directory, 'article.md'), '# Hello\n\n**world** and [PANews](https://www.panewslab.com)\n\n- 比特币\n')

function mockFetch(routes) {
  globalThis.fetch = async (url, options = {}) => {
    const { pathname, searchParams } = new URL(url)
    console.error('HTTP ' + JSON.stringify({
      path: pathname, query: Object.fromEntries(searchParams), method: options.method ?? 'GET',
      body: options.body ? JSON.parse(options.body) : undefined,
      lang: options.headers?.['PA-Accept-Language'],
    }))
    const route = routes[pathname]
    if (!route) throw new Error(`Unexpected request: ${pathname}`)
    if (route.networkError) throw new Error('Network unavailable')
    return Response.json(route.body, { status: route.status ?? 200 })
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
  test(`${command} renders Markdown with embedded WASM outside the repository`, () => {
    const creating = command === 'create-article'
    const path = `/columns/column-id/articles${creating ? '' : '/article-id'}`
    const result = run([command, '--column-id', 'column-id', '--content-file', 'article.md', '--session', 'test-session',
      ...(creating ? ['--title', 'Test', '--desc', 'Summary', '--lang', 'en'] : ['--article-id', 'article-id'])], {
      [path]: { body: { id: 'article-id', status: 'DRAFT' } },
    }, 'panews-creator')
    assert.equal(result.status, 0, result.stderr)
    assert.equal(result.requests[0].method, creating ? 'POST' : 'PATCH')
    const { content } = result.requests[0].body
    assert.match(content, /<h1>Hello<\/h1>/)
    assert.match(content, /<strong>world<\/strong>/)
    assert.match(content, /<a href="https:\/\/www.panewslab.com">PANews<\/a>/)
    assert.match(content, /<li>比特币<\/li>/)
  })
}
