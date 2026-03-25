import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

const ArticleTypeSchema = z.enum(['NORMAL', 'NEWS', 'VIDEO'])

interface Article {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

export const listArticlesCommand = defineCommand({
  meta: {
    description: 'List latest articles by type',
  },
  args: {
    type: {
      type: 'string',
      description: 'Article type: NORMAL | NEWS | VIDEO',
      default: 'NEWS',
    },
    take: {
      type: 'string',
      description: 'Number of articles to return (max 100)',
      default: '10',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale (e.g. zh, en, zh-TW, en-US); auto-detected if omitted',

    },
  },
  async run({ args }) {
    const type = ArticleTypeSchema.parse(args.type || 'NEWS')
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '10')

    const params = new URLSearchParams({ type, take: String(take) })
    const data = await request<Article[]>(`/articles?${params}`, { lang })

    const items = data.map((article) =>
      select(article, ['id', 'title', 'desc', 'publishedAt']),
    )

    console.log(toMarkdown(items))
  },
})
