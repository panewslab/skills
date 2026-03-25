import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

interface SeriesTranslation {
  lang: string
  name: string
  desc?: string
}

interface Series {
  id: string
  name: string
  lastPublishedAt: string | null
  translations: SeriesTranslation[]
  [key: string]: unknown
}

interface Article {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

export const getSeriesCommand = defineCommand({
  meta: {
    description: 'Get series details and articles',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Series ID',
      required: true,
    },
    take: {
      type: 'string',
      description: 'Number of articles to fetch',
      default: '10',
    },
    lang: {
      type: 'string',
      description: 'Language code or locale; auto-detected if omitted',
    },
  },
  async run({ args }) {
    const lang = resolveLang(args.lang)
    const take = z.coerce.number().int().min(1).max(100).parse(args.take || '10')

    const [series, articles] = await Promise.all([
      request<Series>(`/series/${args.id}`, { lang }),
      request<Article[]>(`/articles?seriesId=${args.id}&take=${take}`, { lang }),
    ])

    const translation = series.translations?.find((t) => t.lang === lang) ?? series.translations?.[0]
    const meta = {
      id: series.id,
      name: translation?.name || series.name,
      desc: translation?.desc,
      lastPublishedAt: series.lastPublishedAt,
    }

    const items = articles.map((a) =>
      select(a, ['id', 'title', 'desc', 'publishedAt']),
    )

    console.log(toMarkdown(meta))
    if (items.length > 0) {
      console.log('\n---\n')
      console.log(toMarkdown(items))
    }
  },
})
