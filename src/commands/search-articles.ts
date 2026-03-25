import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { Lang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

const SearchModeSchema = z.enum(['hit', 'time'])

interface Article {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

interface SearchItem {
  score: number
  article: Article
}

export const searchArticlesCommand = defineCommand({
  meta: {
    description: 'Search articles by keyword',
  },
  args: {
    query: {
      type: 'positional',
      description: 'Search keyword',
      required: true,
    },
    mode: {
      type: 'string',
      description: 'Sort mode: hit (relevance) | time (newest first)',
      default: 'hit',
    },
    take: {
      type: 'string',
      description: 'Number of results to return',
      default: '5',
    },
    lang: {
      type: 'string',
      description: 'Language code',
      default: 'zh',
    },
  },
  async run({ args }) {
    const mode = SearchModeSchema.parse(args.mode || 'hit')
    const lang = Lang.parse(args.lang || 'zh')
    const take = z.coerce.number().int().min(1).max(50).parse(args.take || '5')

    const raw = await request<SearchItem[]>('/search/articles', {
      lang,
      method: 'POST',
      body: {
        query: args.query,
        mode,
        type: ['NORMAL', 'NEWS'],
        take,
        skip: 0,
      },
    })

    const articles: Article[] = raw.map((item) => item.article)

    if (articles.length === 0) {
      console.log('_无结果_')
      return
    }

    const items = articles.map((article) =>
      select(article, ['id', 'title', 'desc', 'publishedAt']),
    )

    console.log(toMarkdown(items))
  },
})
