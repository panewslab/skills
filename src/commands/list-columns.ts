import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

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

export const listColumnsCommand = defineCommand({
  meta: {
    description: 'List or search PANews columns',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by column name',
    },
    take: {
      type: 'string',
      description: 'Number of results (max 100)',
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
    const params = new URLSearchParams({
      take: String(take),
      orderBy: 'lastPostAt',
      includeMetric: 'true',
    })
    if (args.search) params.set('search', args.search)

    const data = await request<Column[]>(`/columns?${params}`, { lang })

    const items = data.map((c) => ({
      id: c.id,
      name: c.name,
      author: c.owner?.profile?.name,
      published: c.metric?.published,
      followers: c.followersCount,
      lastPostAt: c.lastPostAt,
    }))

    console.log(toMarkdown(items))
  },
})
