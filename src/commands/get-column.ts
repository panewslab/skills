import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { select, toMarkdown } from '../utils/format.ts'

interface Column {
  id: string
  name: string
  desc: string | null
  followersCount: number
  lastPostAt: string | null
  owner: { profile?: { name?: string } }
  metric?: { published: number }
  [key: string]: unknown
}

interface Article {
  id: string
  title: string
  desc: string | null
  publishedAt: string
  [key: string]: unknown
}

export const getColumnCommand = defineCommand({
  meta: {
    description: 'Get column details and recent articles',
  },
  args: {
    id: {
      type: 'positional',
      description: 'Column ID',
      required: true,
    },
    take: {
      type: 'string',
      description: 'Number of recent articles to fetch',
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

    const [column, articles] = await Promise.all([
      request<Column>(`/columns/${args.id}?includeMetric=true`, { lang }),
      request<Article[]>(`/articles?columnId=${args.id}&take=${take}`, { lang }),
    ])

    const meta = {
      id: column.id,
      name: column.name,
      desc: column.desc,
      author: column.owner?.profile?.name,
      published: column.metric?.published,
      followers: column.followersCount,
      lastPostAt: column.lastPostAt,
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
