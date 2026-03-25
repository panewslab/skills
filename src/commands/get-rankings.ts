import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { Lang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

const RankingTypeSchema = z.enum(['daily', 'weekly'])

interface RankedArticle {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

interface RankResponse {
  articles: RankedArticle[]
}

export const getRankingsCommand = defineCommand({
  meta: {
    description: 'Get article hot rankings (daily: 24h hot | weekly: 7-day search trending)',
  },
  args: {
    type: {
      type: 'string',
      description: 'Ranking type: daily (24h hot) | weekly (7-day search trending)',
      default: 'daily',
    },
    take: {
      type: 'string',
      description: 'Number of results to return',
      default: '10',
    },
    lang: {
      type: 'string',
      description: 'Language code',
      default: 'zh',
    },
  },
  async run({ args }) {
    const type = RankingTypeSchema.parse(args.type || 'daily')
    const lang = Lang.parse(args.lang || 'zh')
    const take = z.coerce.number().int().min(1).max(30).parse(args.take || '10')

    const path = type === 'weekly' ? '/articles/rank/weekly/search' : '/articles/rank'
    const params = new URLSearchParams({ take: String(take) })
    const data = await request<RankResponse>(`${path}?${params}`, { lang })
    const articles = data.articles ?? []

    const items = articles.map((article) =>
      select(article, ['id', 'title', 'desc', 'publishedAt']),
    )

    console.log(toMarkdown(items))
  },
})
