import { defineCommand } from 'citty'
import { z } from 'zod'
import { request } from '../utils/http.ts'
import { resolveLang } from '../utils/lang.ts'
import { toMarkdown } from '../utils/format.ts'

interface TopicTranslation {
  lang: string
  title: string
  desc?: string
}

interface Topic {
  id: string
  title: string
  desc: string | null
  commentsCount: number
  favoritesCount: number
  createdAt: string
  translations: TopicTranslation[]
  [key: string]: unknown
}

export const listTopicsCommand = defineCommand({
  meta: {
    description: 'List or search PANews topics (话题)',
  },
  args: {
    search: {
      type: 'string',
      description: 'Search by topic title or description',
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
    const params = new URLSearchParams({ take: String(take) })
    if (args.search) params.set('search', args.search)

    const data = await request<Topic[]>(`/topics?${params}`, { lang })

    const items = data.map((t) => {
      const tr = t.translations?.find((x) => x.lang === lang) ?? t.translations?.[0]
      return {
        id: t.id,
        title: tr?.title || t.title,
        desc: tr?.desc || t.desc,
        comments: t.commentsCount,
        favorites: t.favoritesCount,
      }
    })

    console.log(toMarkdown(items))
  },
})
