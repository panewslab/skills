import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

const SearchModeSchema = z.enum(['hit', 'time'])
const PublishedAtSchema = z.iso.datetime({ offset: true })
  .transform((value) => new Date(value).toISOString())
  .optional()

interface Article {
  id: string
  lang: string
  title: string
  desc: string | null
  publishedAt: string
  translations?: { lang: string; title: string | null; desc: string | null }[]
  [key: string]: unknown
}

interface SearchItem {
  article: Article
  match: {
    snippet: { text: string }
    field: 'description' | 'content'
  }
}

interface SearchResults {
  items: SearchItem[]
  nextCursor?: string
}

export const searchArticlesCommand = defineCommand({
  meta: {
    description: 'Search articles by keyword and publication date',
  },
  args: {
    query: {
      type: 'positional',
      description: 'Search keyword',
      required: true,
    },
    mode: {
      type: 'string',
      description: 'Sort mode: hit (relevance and freshness) | time (newest first)',
      default: 'hit',
    },
    take: {
      type: 'string',
      description: 'Maximum results on one page (1-50)',
      default: '5',
    },
    'published-from': {
      type: 'string',
      description: 'Inclusive publication time, ISO 8601 with timezone (e.g. 2026-09-21T00:00:00+08:00)',
    },
    'published-to': {
      type: 'string',
      description: 'Exclusive publication time, ISO 8601 with timezone',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale (e.g. zh, en, zh-TW, en-US); auto-detected if omitted',
    },
  },
  async run({ args }) {
    const query = z.string().trim().min(1).max(2000).parse(args.query)
    const mode = SearchModeSchema.parse(args.mode || 'hit')
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(50).parse(args.take || '5')
    const publishedFrom = PublishedAtSchema.parse(args['published-from'])
    const publishedTo = PublishedAtSchema.parse(args['published-to'])
    if (publishedFrom && publishedTo && Date.parse(publishedFrom) >= Date.parse(publishedTo)) {
      throw new Error('--published-to must be later than --published-from')
    }

    const raw = await request<SearchResults>('/search/results', {
      lang,
      method: 'POST',
      body: {
        query,
        mode,
        type: ['NORMAL', 'NEWS'],
        take,
        publishedFrom,
        publishedTo,
      },
    })

    try {
      if (raw.items.length === 0) {
        console.log(raw.nextCursor ? '_No visible results on this page_' : '_No results_')
        return
      }

      const items = raw.items.map(({ article, match }) => {
        const translation = article.lang === lang
          ? undefined
          : article.translations?.find((translation) => translation.lang === lang)
        return {
          ...select(article, ['id', 'title', 'desc', 'publishedAt']),
          ...(translation ? { title: translation.title, desc: translation.desc } : {}),
          ...(match.field === 'content' ? { snippet: match.snippet.text } : {}),
        }
      })

      console.log(toMarkdown(items))
    } finally {
      if (raw.nextCursor) {
        try {
          await request('/search/results/cursor', {
            method: 'DELETE',
            body: { cursor: raw.nextCursor },
            signal: AbortSignal.timeout(5000),
            throwOnError: true,
          })
        } catch {
          console.error('Warning: Could not release the search snapshot; it will expire automatically.')
        }
      }
    }
  },
})
